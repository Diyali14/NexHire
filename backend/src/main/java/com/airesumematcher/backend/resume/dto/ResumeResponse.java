package com.airesumematcher.backend.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ResumeResponse {

    private Long resumeId;

    private String fileName;

    private String fileType;

    private Long fileSize;

    private String processingStatus;

    private String storageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}