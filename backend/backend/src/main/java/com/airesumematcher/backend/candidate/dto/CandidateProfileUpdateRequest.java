package com.airesumematcher.backend.candidate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateProfileUpdateRequest {

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    private String phone;

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