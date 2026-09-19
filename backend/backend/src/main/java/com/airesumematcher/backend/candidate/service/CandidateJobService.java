package com.airesumematcher.backend.candidate.service;

import com.airesumematcher.backend.candidate.dto.CandidateJobResponse;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateJobService {

    private final JobRepository jobRepository;

    /**
     * Returns all jobs that have completed JD processing.
     *
     * Jobs are already ordered by createdAt DESC
     * by the repository query.
     */
    @Transactional(readOnly = true)
    public List<CandidateJobResponse> getAvailableJobs() {

        List<Job> jobs =
                jobRepository
                        .findAllByProcessingStatusOrderByCreatedAtDesc(
                                JobProcessingStatus.COMPLETED
                        );

        return jobs.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns one completed job for candidate viewing.
     */
    @Transactional(readOnly = true)
    public CandidateJobResponse getJobDetails(
            Long jobId
    ) {

        Job job =
                jobRepository
                        .findById(jobId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job not found"
                                )
                        );

        if (job.getProcessingStatus()
                != JobProcessingStatus.COMPLETED) {

            throw new IllegalArgumentException(
                    "This job is not available to candidates yet"
            );
        }

        return toResponse(job);
    }

    /**
     * Converts Job entity into candidate-safe response.
     */
    private CandidateJobResponse toResponse(
            Job job
    ) {

        return CandidateJobResponse.builder()
                .jobId(job.getId())
                .jobTitle(job.getJobTitle())
                .jobDescription(job.getJobDescription())
                .processingStatus(
                        job.getProcessingStatus().name()
                )
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}