package com.airesumematcher.backend.candidate.repository;

import com.airesumematcher.backend.candidate.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    Optional<InterviewQuestion> findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(Long candidateId, Long jobId);

    Optional<InterviewQuestion> findByApplicationId(Long applicationId);
}
