package com.airesumematcher.backend.recruiter.repository;

import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobParsedDataRepository
        extends JpaRepository<JobParsedData, Long> {

    Optional<JobParsedData> findByJobId(Long jobId);

    boolean existsByJobId(Long jobId);
}
