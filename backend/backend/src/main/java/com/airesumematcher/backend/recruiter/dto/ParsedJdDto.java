package com.airesumematcher.backend.recruiter.dto;

import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedJdDto {

    private String status;

    private String modelVersion;

    private String jobTitle;

    private String experienceRequired;

    private String educationRequired;

    private ArrayList<JdSkillDto> skills;
}