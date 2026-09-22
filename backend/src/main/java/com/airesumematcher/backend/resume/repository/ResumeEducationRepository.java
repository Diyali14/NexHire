package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeEducation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeEducationRepository extends JpaRepository<ResumeEducation, Long> {

    void deleteAllByParsedDataId(Long parsedDataId);
}