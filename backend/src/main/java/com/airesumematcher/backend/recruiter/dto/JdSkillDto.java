package com.airesumematcher.backend.recruiter.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JdSkillDto {

    private String name;

    private String normalizedName;

    private int confidence;

    private String importance;

    private String category;
}
