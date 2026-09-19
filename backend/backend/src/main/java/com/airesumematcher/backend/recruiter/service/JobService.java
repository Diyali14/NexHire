package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import com.airesumematcher.backend.rabbitmq.service.JobMessageProducer;
import com.airesumematcher.backend.recruiter.dto.JobCreateRequest;
import com.airesumematcher.backend.recruiter.dto.JobParsedDataResponse;
import com.airesumematcher.backend.recruiter.dto.JobResponse;
import com.airesumematcher.backend.recruiter.dto.JobStatusResponse;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobMessageProducer jobMessageProducer;
    private final JobParsedDataRepository jobParsedDataRepository;


    // =========================================================
    // CREATE JOB
    // =========================================================

    @Transactional
    public JobResponse createJob(
            JobCreateRequest request,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(authentication);


        // 1. Save job in database

        Job job = Job.builder()
                .recruiter(recruiter)
                .jobTitle(request.getJobTitle().trim())
                .jobDescription(request.getJobDescription().trim())
                .processingStatus(JobProcessingStatus.STORED)
                .build();

        job = jobRepository.saveAndFlush(job);


        // 2. Publish job description to RabbitMQ

        JobProcessingMessage message =
                JobProcessingMessage.builder()
                        .jobId(job.getId())
                        .recruiterId(recruiter.getId())
                        .jobTitle(job.getJobTitle())
                        .jobDescription(job.getJobDescription())
                        .build();

        jobMessageProducer.publish(message);


        // 3. Mark job as QUEUED

        job.setProcessingStatus(
                JobProcessingStatus.QUEUED
        );

        job = jobRepository.save(job);


        return toResponse(job);
    }


    // =========================================================
    // GET JOB PROCESSING STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public JobStatusResponse getJobStatus(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(authentication);


        // Make sure recruiter owns this job

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


        boolean parsedDataAvailable =
                jobParsedDataRepository
                        .existsByJobId(jobId);


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
                .status(job.getProcessingStatus().name())
                .parsedDataAvailable(parsedDataAvailable)
                .message(message)
                .build();
    }


    // =========================================================
    // GET PARSED JOB DATA
    // =========================================================

    @Transactional(readOnly = true)
    public JobParsedDataResponse getParsedJobData(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(authentication);


        // 1. Verify that this recruiter owns the job

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


        // 2. Get parsed JSON

        JobParsedData parsedData =
                jobParsedDataRepository
                        .findByJobId(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Parsed job data not found"
                                )
                        );


        // 3. Return parsed data

        return JobParsedDataResponse.builder()
                .jobId(job.getId())
                .parserVersion(
                        parsedData.getParserVersion()
                )
                .parsedJson(
                        parsedData.getParsedJson()
                )
                .build();
    }


    // =========================================================
    // DELETE JOB
    // =========================================================

    @Transactional
    public void deleteJob(
            Long jobId,
            Authentication authentication
    ) {

        User recruiter =
                getAuthenticatedRecruiter(authentication);


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


    // =========================================================
    // GET AUTHENTICATED RECRUITER
    // =========================================================

    private User getAuthenticatedRecruiter(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated recruiter not found"
                        )
                );
    }


    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private JobResponse toResponse(Job job) {

        return JobResponse.builder()
                .jobId(job.getId())
                .recruiterId(
                        job.getRecruiter().getId()
                )
                .jobTitle(job.getJobTitle())
                .jobDescription(
                        job.getJobDescription()
                )
                .storageUrl(null)
                .processingStatus(
                        job.getProcessingStatus().name()
                )
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}