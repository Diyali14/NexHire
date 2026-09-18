package com.airesumematcher.backend.recruiter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobCreateRequest {

    @NotBlank(message = "Job title is required")
    @Size(
            max = 255,
            message = "Job title must not exceed 255 characters"
    )
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    @Size(
            max = 20000,
            message = "Job description must not exceed 20000 characters"
    )
    private String jobDescription;
}