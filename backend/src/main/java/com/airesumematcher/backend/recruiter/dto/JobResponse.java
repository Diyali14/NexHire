package com.airesumematcher.backend.recruiter.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class JobResponse {

    private Long jobId;

    private Long recruiterId;

    private String jobTitle;

    private String jobDescription;

    private String storageUrl;

    private String processingStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}