package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.application.dto.CandidateMatcherDto;
import com.airesumematcher.backend.application.dto.JobRequirementsMatcherDto;
import com.airesumematcher.backend.application.dto.MatcherRequestDto;
import com.airesumematcher.backend.recruiter.dto.ParsedJdDto;
import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MatcherRequestMapper {

    private final ObjectMapper objectMapper;

    public MatcherRequestDto buildMatcherRequest(
            ParsedResumeDto parsedResume,
            ParsedJdDto parsedJd
    ) {

        return MatcherRequestDto.builder()
                .candidate(toCandidate(parsedResume))
                .jobRequirements(toJobRequirements(parsedJd))
                .build();
    }

    public String buildMatcherJson(
            ParsedResumeDto parsedResume,
            ParsedJdDto parsedJd
    ) {

        try {

            MatcherRequestDto request =
                    buildMatcherRequest(
                            parsedResume,
                            parsedJd
                    );

            return objectMapper.writeValueAsString(request);

        } catch (JsonProcessingException e) {

            throw new IllegalStateException(
                    "Failed to build matcher request JSON",
                    e
            );
        }
    }

    private CandidateMatcherDto toCandidate(
            ParsedResumeDto parsedResume
    ) {

        if (parsedResume == null ||
                parsedResume.getResume() == null) {

            throw new IllegalArgumentException(
                    "Parsed resume data is missing"
            );
        }

        var resume = parsedResume.getResume();

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

    private JobRequirementsMatcherDto toJobRequirements(
            ParsedJdDto parsedJd
    ) {

        if (parsedJd == null) {

            throw new IllegalArgumentException(
                    "Parsed JD data is missing"
            );
        }

        return JobRequirementsMatcherDto.builder()
                .status(parsedJd.getStatus())
                .jobTitle(parsedJd.getJobTitle())
                .experienceRequired(
                        parsedJd.getExperienceRequired()
                )
                .educationRequired(
                        parsedJd.getEducationRequired()
                )
                .skills(parsedJd.getSkills())
                .build();
    }
}