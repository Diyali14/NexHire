package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeExperience;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeExperienceRepository extends JpaRepository<ResumeExperience, Long> {

    void deleteAllByParsedDataId(Long parsedDataId);
}