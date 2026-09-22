package com.airesumematcher.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobApplicationRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;
}