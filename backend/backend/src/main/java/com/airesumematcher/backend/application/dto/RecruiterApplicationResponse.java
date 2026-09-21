package com.airesumematcher.backend.application.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecruiterApplicationResponse {

    private Long applicationId;

    private Long candidateId;

    private Long resumeId;

    private String candidateName;

    private String candidateEmail;

    private String candidatePhone;

    private String resumeFileName;

    private String resumeUrl;

    private String status;

    private Integer overallScore;

    private String matcherVersion;

    private Boolean experienceMet;

    private Boolean educationMet;

    private Object matchedSkills;

    private Object missingSkills;

    private String summary;
}