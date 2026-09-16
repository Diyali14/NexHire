package com.airesumematcher.backend.candidate.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidateProfileResponse {

    private Long id;

    private Long userId;

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private String linkedinUrl;

    private String githubUrl;

    private String bio;
}

