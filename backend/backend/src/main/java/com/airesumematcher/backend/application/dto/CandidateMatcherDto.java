package com.airesumematcher.backend.application.dto;

import com.airesumematcher.backend.resume.dto.*;

import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateMatcherDto {

    private String name;
    private String email;
    private String phone;

    private ArrayList<SkillDto> skills;

    private ArrayList<EducationDto> education;

    private ArrayList<ExperienceDto> experience;

    private int years_of_experience;

    private ArrayList<ProjectDto> projects;


    public CandidateMatcherDto toCandidate(
            ParsedResumeDto parsedResume
    ) {

        if (parsedResume == null
                || parsedResume.getResume() == null) {

            throw new IllegalArgumentException(
                    "Parsed resume data is missing"
            );
        }

        ResumeDto resume =
                parsedResume.getResume();

        return CandidateMatcherDto.builder()

                .name(resume.getName())

                .email(resume.getEmail())

                .phone(resume.getPhone())

                .skills(resume.getSkills())

                .education(resume.getEducation())

                .experience(resume.getExperience())

                .years_of_experience(
                        resume.getYears_of_experience()
                )

                .projects(resume.getProjects())

                .build();
    }
}
