package com.airesumematcher.backend.resume.repository;

import com.airesumematcher.backend.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findAllByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    Optional<Resume> findByIdAndCandidateId(Long id, Long candidateId);
}
