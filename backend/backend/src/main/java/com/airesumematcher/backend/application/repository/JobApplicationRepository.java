package com.airesumematcher.backend.application.repository;

import com.airesumematcher.backend.application.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    boolean existsByJobIdAndCandidateId(
            Long jobId,
            Long candidateId
    );

    Optional<JobApplication> findByJobIdAndCandidateId(
            Long jobId,
            Long candidateId
    );

    List<JobApplication> findAllByJobIdOrderByOverallScoreDescCreatedAtAsc(
            Long jobId
    );

    Optional<JobApplication> findByIdAndCandidateId(
            Long applicationId,
            Long candidateId
    );
}