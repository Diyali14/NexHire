package com.airesumematcher.backend.candidate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CandidateJobResponse {

    private Long jobId;

    private String jobTitle;

    private String companyName;

    private String jobDescription;

    private String experienceRequired;

    private String educationRequired;

    private JsonNode skills;

    private JsonNode parsedRequirements;

    private String processingStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}