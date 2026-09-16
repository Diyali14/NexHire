package com.airesumematcher.backend.candidate.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateProfileUpdateRequest {

    @Size(max = 500)
    private String linkedinUrl;

    @Size(max = 500)
    private String githubUrl;

    @Size(max = 2000)
    private String bio;
}

