package com.airesumematcher.backend.recruiter.repository;

import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository
        extends JpaRepository<Job, Long> {

    List<Job> findAllByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    Optional<Job> findByIdAndRecruiterId(Long id, Long recruiterId);

    List<Job> findAllByProcessingStatusOrderByCreatedAtDesc(JobProcessingStatus processingStatus);
}