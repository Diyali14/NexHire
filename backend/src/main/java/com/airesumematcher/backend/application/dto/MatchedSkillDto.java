package com.airesumematcher.backend.application.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchedSkillDto {

    private String name;

    private String normalizedName;

    private String importance;

    private String category;

    private double similarity;

    private double evidenceScore;

    private String evidenceSource;
}