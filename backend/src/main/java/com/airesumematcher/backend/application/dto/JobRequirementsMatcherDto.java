package com.airesumematcher.backend.application.dto;

import com.airesumematcher.backend.recruiter.dto.JdSkillDto;

import com.airesumematcher.backend.recruiter.dto.ParsedJdDto;
import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequirementsMatcherDto {

    private String status;

    private String jobTitle;

    private String experienceRequired;

    private String educationRequired;

    private ArrayList<JdSkillDto> skills;

    public JobRequirementsMatcherDto toJobRequirements(ParsedJdDto parsedJd) {

        if (parsedJd == null) {

            throw new IllegalArgumentException("Parsed JD data is missing");
        }

        return JobRequirementsMatcherDto.builder().status(parsedJd.getStatus()).jobTitle(parsedJd.getJobTitle())
                .experienceRequired(parsedJd.getExperienceRequired()).educationRequired(parsedJd.getEducationRequired())
                .skills(parsedJd.getSkills()).build();
    }
}
