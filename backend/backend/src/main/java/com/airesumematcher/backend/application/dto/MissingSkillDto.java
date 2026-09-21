package com.airesumematcher.backend.application.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingSkillDto {

    private String name;

    private String normalizedName;

    private String importance;

    private String category;
}