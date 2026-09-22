package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeLinkRepository extends JpaRepository<ResumeLink, Long> {

    Optional<ResumeLink> findByParsedDataId(Long parsedDataId);

    void deleteByParsedDataId(Long parsedDataId);
}