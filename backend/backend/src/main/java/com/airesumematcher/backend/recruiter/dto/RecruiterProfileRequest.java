package com.airesumematcher.backend.recruiter.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileRequest {

    @Size(max = 255)
    private String companyName;

    @Size(max = 255)
    private String designation;
}