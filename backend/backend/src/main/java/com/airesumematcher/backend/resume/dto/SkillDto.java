// SkillDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDto {

    private String name;
    private String normalizedName;
    private int confidence;
}