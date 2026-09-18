package com.airesumematcher.backend.recruiter.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecruiterProfileResponse {

    private Long id;

    private Long userId;

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private String companyName;

    private String designation;
}

