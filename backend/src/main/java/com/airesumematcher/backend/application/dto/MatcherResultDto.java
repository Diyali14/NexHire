package com.airesumematcher.backend.application.dto;

import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatcherResultDto {

    private double overallScore;

    private double evidenceScore;

    private boolean experienceMet;

    private boolean educationMet;

    private ArrayList<MatchedSkillDto> matchedSkills;

    private ArrayList<MissingSkillDto> missingSkills;

    private String summary;

    private String matcherVersion;
}