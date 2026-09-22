package com.airesumematcher.backend.candidate.repository;

import com.airesumematcher.backend.candidate.entity.SkillGapResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillGapResultRepository extends JpaRepository<SkillGapResult, Long> {

    Optional<SkillGapResult> findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(Long candidateId, Long jobId);

    Optional<SkillGapResult> findByApplicationId(Long applicationId);
}
