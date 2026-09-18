package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import com.airesumematcher.backend.rabbitmq.service.JobMessageProducer;
import com.airesumematcher.backend.recruiter.dto.JobCreateRequest;
import com.airesumematcher.backend.recruiter.dto.JobResponse;
import com.airesumematcher.backend.recruiter.dto.JobStatusResponse;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import com.airesumematcher.backend.storage.service.DocumentConversionService;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final DocumentConversionService documentConversionService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final JobMessageProducer jobMessageProducer;

    @Transactional
    public JobResponse createJob(
            JobCreateRequest request,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        Job job =
                Job.builder()
                        .recruiter(recruiter)
                        .jobTitle(
                                request.getJobTitle().trim()
                        )
                        .jobDescription(
                                request.getJobDescription().trim()
                        )
                        .processingStatus(
                                JobProcessingStatus.STORED
                        )
                        .build();

        job = jobRepository.saveAndFlush(job);

        Long jobId = job.getId();

        String publicId =
                "nexhire/recruiters/"
                        + recruiter.getId()
                        + "/jobs/"
                        + jobId
                        + "/jd";

        byte[] pdfBytes;

        try {

            pdfBytes =
                    documentConversionService
                            .convertTextToPdf(
                                    job.getJobDescription()
                            );

        } catch (Exception e) {

            job.setProcessingStatus(
                    JobProcessingStatus.FAILED
            );

            jobRepository.save(job);

            throw new RuntimeException(
                    "Failed to convert job description to PDF",
                    e
            );
        }

        Map<String, Object> uploadResult;

        try {

            uploadResult =
                    cloudinaryStorageService.uploadPdf(
                            pdfBytes,
                            publicId
                    );

        } catch (Exception e) {

            job.setProcessingStatus(
                    JobProcessingStatus.FAILED
            );

            jobRepository.save(job);

            throw new RuntimeException(
                    "Failed to upload job description to Cloudinary",
                    e
            );
        }

        job.setStorageObjectName(
                publicId
        );

        Object secureUrl =
                uploadResult.get("secure_url");

        if (secureUrl != null) {

            job.setStorageUrl(
                    secureUrl.toString()
            );
        }

        /*
         * Cloudinary upload succeeded.
         * Now put the job into the RabbitMQ processing queue.
         */
        job.setProcessingStatus(
                JobProcessingStatus.QUEUED
        );

        Job savedJob =
                jobRepository.save(job);

        /*
         * Create the message that will be sent to RabbitMQ.
         */
        JobProcessingMessage message =
                JobProcessingMessage.builder()
                        .jobId(
                                savedJob.getId()
                        )
                        .recruiterId(
                                recruiter.getId()
                        )
                        .storageObjectName(
                                savedJob.getStorageObjectName()
                        )
                        .storageUrl(
                                savedJob.getStorageUrl()
                        )
                        .build();

        /*
         * Publish the job to RabbitMQ.
         */
        jobMessageProducer.publish(message);

        return toResponse(savedJob);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        return jobRepository
                .findAllByRecruiterIdOrderByCreatedAtDesc(
                        recruiter.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getMyJob(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiter.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        return toResponse(job);
    }

    @Transactional(readOnly = true)
    public JobStatusResponse getJobStatus(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiter.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        String message;

        switch (job.getProcessingStatus()) {

            case DRAFT ->
                    message =
                            "Job description is still being prepared.";

            case STORED ->
                    message =
                            "Job description is stored and waiting for parser processing.";

            case QUEUED ->
                    message =
                            "Job description is waiting to be processed.";

            case PROCESSING ->
                    message =
                            "Job description is currently being processed.";

            case COMPLETED ->
                    message =
                            "Job description processing completed.";

            case PARTIAL ->
                    message =
                            "Job description processing completed with partial data.";

            case FAILED ->
                    message =
                            "Job description processing failed.";

            default ->
                    message =
                            "Unknown job processing status.";
        }

        return JobStatusResponse.builder()
                .jobId(jobId)
                .status(
                        job.getProcessingStatus().name()
                )
                .parsedDataAvailable(false)
                .message(message)
                .build();
    }

    @Transactional
    public void deleteJob(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiter.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        jobRepository.delete(job);
    }

    private User getAuthenticatedRecruiter(
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated recruiter not found"
                        )
                );
    }

    private JobResponse toResponse(
            Job job
    ) {

        return JobResponse.builder()
                .jobId(job.getId())
                .recruiterId(
                        job.getRecruiter().getId()
                )
                .jobTitle(
                        job.getJobTitle()
                )
                .jobDescription(
                        job.getJobDescription()
                )
                .storageUrl(
                        job.getStorageUrl()
                )
                .processingStatus(
                        job.getProcessingStatus().name()
                )
                .createdAt(
                        job.getCreatedAt()
                )
                .updatedAt(
                        job.getUpdatedAt()
                )
                .build();
    }
}