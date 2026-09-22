package com.airesumematcher.backend.recruiter.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileRequest {

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    private String phone;

    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String companyName;

    @Size(max = 255, message = "Designation must not exceed 255 characters")
    private String designation;
}