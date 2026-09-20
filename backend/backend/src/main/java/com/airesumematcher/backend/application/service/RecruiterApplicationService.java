package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.application.dto.RecruiterApplicationResponse;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruiterApplicationService {

    private final JobApplicationRepository applicationRepository;

    private final JobRepository jobRepository;

    private final UserRepository userRepository;

    private final ObjectMapper objectMapper;

    public List<RecruiterApplicationResponse> getApplicationsForJob(
            Long jobId,
            Authentication authentication
    ) {

        // =========================================================
        // 1. GET AUTHENTICATED RECRUITER
        // =========================================================

        User recruiter =
                userRepository
                        .findByEmailIgnoreCase(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Authenticated recruiter not found"
                                )
                        );


        // =========================================================
        // 2. VERIFY JOB BELONGS TO THIS RECRUITER
        // =========================================================

        jobRepository
                .findByIdAndRecruiterId(
                        jobId,
                        recruiter.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found or you do not own this job"
                        )
                );


        // =========================================================
        // 3. GET APPLICATIONS
        //
        // Already sorted by:
        // overall_score DESC
        // created_at ASC
        // =========================================================

        List<JobApplication> applications =
                applicationRepository
                        .findAllByJobIdOrderByOverallScoreDescCreatedAtAsc(
                                jobId
                        );


        // =========================================================
        // 4. BUILD RESPONSE
        // =========================================================

        List<RecruiterApplicationResponse> response =
                new ArrayList<>();

        for (JobApplication application : applications) {

            response.add(
                    buildResponse(application)
            );
        }

        return response;
    }


    // =========================================================
    // BUILD RECRUITER RESPONSE
    // =========================================================

    private RecruiterApplicationResponse buildResponse(
            JobApplication application
    ) {

        JsonNode matcherResult = null;

        if (application.getMatcherResult() != null
                && !application.getMatcherResult().isBlank()) {

            try {

                matcherResult =
                        objectMapper.readTree(
                                application.getMatcherResult()
                        );

            } catch (Exception ignored) {

                // Keep matcherResult null if stored JSON
                // cannot be parsed.
            }
        }


        // =========================================================
        // MATCHED SKILLS
        // =========================================================

        JsonNode matchedSkills =
                matcherResult != null
                        ? matcherResult.path("matchedSkills")
                        : null;


        // =========================================================
        // MISSING SKILLS
        // =========================================================

        JsonNode missingSkills =
                matcherResult != null
                        ? matcherResult.path("missingSkills")
                        : null;


        // =========================================================
        // EXPERIENCE
        // =========================================================

        Boolean experienceMet = null;

        if (matcherResult != null
                && matcherResult.has("experienceMet")) {

            experienceMet =
                    matcherResult
                            .path("experienceMet")
                            .asBoolean();
        }


        // =========================================================
        // EDUCATION
        // =========================================================

        Boolean educationMet = null;

        if (matcherResult != null
                && matcherResult.has("educationMet")) {

            educationMet =
                    matcherResult
                            .path("educationMet")
                            .asBoolean();
        }


        // =========================================================
        // SUMMARY
        // =========================================================

        String summary = null;

        if (matcherResult != null) {

            summary =
                    matcherResult
                            .path("summary")
                            .asText(null);
        }


        // =========================================================
        // CANDIDATE
        // =========================================================

        User candidate =
                application.getCandidate();

        String candidateName =
                buildCandidateName(candidate);


        // =========================================================
        // RESUME
        // =========================================================

        String resumeFileName = null;

        String resumeUrl = null;

        if (application.getResume() != null) {

            /*
             * IMPORTANT:
             *
             * Your Resume entity uses:
             *
             * originalFileName
             * storageUrl
             *
             * NOT:
             *
             * fileName
             * fileUrl
             */

            resumeFileName =
                    application
                            .getResume()
                            .getOriginalFileName();

            resumeUrl =
                    application
                            .getResume()
                            .getStorageUrl();
        }


        // =========================================================
        // FINAL RESPONSE
        // =========================================================

        return RecruiterApplicationResponse
                .builder()

                .applicationId(
                        application.getId()
                )

                .candidateId(
                        candidate.getId()
                )

                .resumeId(
                        application
                                .getResume()
                                .getId()
                )

                .candidateName(
                        candidateName
                )

                .candidateEmail(
                        candidate.getEmail()
                )

                .candidatePhone(
                        candidate.getPhone()
                )

                .resumeFileName(
                        resumeFileName
                )

                .resumeUrl(
                        resumeUrl
                )

                .status(
                        application
                                .getStatus()
                                .name()
                )

                .overallScore(
                        application
                                .getOverallScore()
                )

                .matcherVersion(
                        application
                                .getMatcherVersion()
                )

                .experienceMet(
                        experienceMet
                )

                .educationMet(
                        educationMet
                )

                .matchedSkills(
                        matchedSkills
                )

                .missingSkills(
                        missingSkills
                )

                .summary(
                        summary
                )

                .build();
    }


    // =========================================================
    // BUILD CANDIDATE NAME
    // =========================================================

    private String buildCandidateName(
            User candidate
    ) {

        String firstName =
                candidate.getFirstName();

        String lastName =
                candidate.getLastName();


        if (firstName == null) {
            firstName = "";
        }

        if (lastName == null) {
            lastName = "";
        }


        String fullName =
                (
                        firstName
                                + " "
                                + lastName
                ).trim();


        if (fullName.isBlank()) {

            return candidate.getEmail();
        }


        return fullName;
    }
}