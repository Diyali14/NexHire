package com.airesumematcher.backend.candidate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CandidateJobResponse {

    private Long jobId;

    private String jobTitle;

    private String jobDescription;

    private String processingStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}