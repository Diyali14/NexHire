// ResumeDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDto {

    private String name;
    private String email;
    private String phone;

    private ArrayList<SkillDto> skills;
    private ArrayList<EducationDto> education;
    private ArrayList<ExperienceDto> experience;

    private int years_of_experience;

    private ArrayList<ProjectDto> projects;

    private String certifications;

    private LinksDto links;
}