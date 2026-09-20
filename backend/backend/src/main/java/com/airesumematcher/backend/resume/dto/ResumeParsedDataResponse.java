package com.airesumematcher.backend.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ResumeParsedDataResponse {

    private Long resumeId;

    private String parserVersion;

    private Profile profile;

    private List<Skill> skills;

    private List<Education> education;

    private List<Experience> experience;

    private List<Project> projects;

    private String certifications;

    private Links links;

    // Complete original parser response
    private JsonNode parsedData;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Profile {

        private String name;
        private String email;
        private String phone;
        private Integer yearsOfExperience;
        private String language;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Skill {

        private String name;
        private String normalizedName;
        private Double confidence;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Education {

        private String degree;
        private String institution;
        private String endYear;
        private String grade;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Experience {

        private String company;
        private String jobTitle;
        private String location;
        private String startDate;
        private String endDate;
        private JsonNode responsibilities;
        private JsonNode technologies;
        private JsonNode additionalInformation;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Project {

        private String name;
        private String description;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Links {

        private String linkedin;
        private String website;
    }
}