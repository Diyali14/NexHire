package com.airesumematcher.backend.candidate.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateProfileUpdateRequest {

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    @Pattern(
            regexp = "^(https?://)?(www\\.)?linkedin\\.com/.*$",
            message = "Invalid LinkedIn URL"
    )
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must not exceed 500 characters")
    @Pattern(
            regexp = "^(https?://)?(www\\.)?github\\.com/.*$",
            message = "Invalid GitHub URL"
    )
    private String githubUrl;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;
}