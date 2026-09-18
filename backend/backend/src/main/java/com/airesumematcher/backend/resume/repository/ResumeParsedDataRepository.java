package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeParsedDataRepository
        extends JpaRepository<ResumeParsedData, Long> {

    Optional<ResumeParsedData> findByResumeId(Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
