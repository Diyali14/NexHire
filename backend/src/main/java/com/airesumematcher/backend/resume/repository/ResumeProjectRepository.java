package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeProjectRepository extends JpaRepository<ResumeProject, Long> {

    void deleteAllByParsedDataId(Long parsedDataId);
}
