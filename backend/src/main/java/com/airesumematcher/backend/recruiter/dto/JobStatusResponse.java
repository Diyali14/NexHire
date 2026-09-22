package com.airesumematcher.backend.recruiter.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobStatusResponse {

    private Long jobId;

    private String status;

    private boolean parsedDataAvailable;

    private String message;
}