package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.ResumeSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeSkillRepository extends JpaRepository<ResumeSkill, Long> {

    void deleteAllByParsedDataId(Long parsedDataId);
}
