package com.airesumematcher.backend.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ResumeUploadResponse {

    private Long resumeId;
    private String fileName;
    private String fileType;
    private String status;
    private String message;
}