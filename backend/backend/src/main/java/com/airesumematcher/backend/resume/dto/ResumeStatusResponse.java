package com.airesumematcher.backend.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ResumeStatusResponse {

    private Long resumeId;

    private String status;

    private boolean parsedDataAvailable;

    private String message;
}
