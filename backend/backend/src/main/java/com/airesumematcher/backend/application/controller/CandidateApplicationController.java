package com.airesumematcher.backend.application.controller;

import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor

public class CandidateApplicationController {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/jobs/{jobId}/application")
    public ResponseEntity<?> getApplication(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        User candidate = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Authenticated candidate not found"
                        )
                );

        JobApplication application =
                applicationRepository
                        .findByJobIdAndCandidateId(
                                jobId,
                                candidate.getId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "You have not applied for this job"
                                )
                        );

        return ResponseEntity.ok(buildApplicationMap(application));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Map<String, Object>>> getMyApplications(
            Authentication authentication
    ) {
        User candidate = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Authenticated candidate not found"
                        )
                );

        List<JobApplication> applications =
                applicationRepository.findAllByCandidateIdOrderByCreatedAtDesc(candidate.getId());

        List<Map<String, Object>> response = new ArrayList<>();
        for (JobApplication app : applications) {
            response.add(buildApplicationMap(app));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/{applicationId}/match-result")
    public ResponseEntity<?> getMatchResult(
            @PathVariable Long applicationId,
            Authentication authentication
    ) {
        User candidate = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Authenticated candidate not found"
                        )
                );

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Application not found"
                        )
                );

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to view this application"
            );
        }

        JsonNode matcherResultNode = null;

        if (application.getMatcherResult() != null
                && !application.getMatcherResult().isBlank()) {

            try {
                matcherResultNode =
                        objectMapper.readTree(application.getMatcherResult());
                while (matcherResultNode != null && matcherResultNode.isTextual()) {
                    matcherResultNode = objectMapper.readTree(matcherResultNode.asText());
                }
            } catch (Exception ignored) {
            }
        }

        Object matcherResultObj = Map.of();
        if (matcherResultNode != null && !matcherResultNode.isMissingNode()) {
            try {
                matcherResultObj = objectMapper.treeToValue(matcherResultNode, Object.class);
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "applicationId", application.getId(),
                        "jobId", application.getJob().getId(),
                        "jobTitle", application.getJob().getJobTitle(),
                        "status", application.getStatus().name(),
                        "overallScore",
                        application.getOverallScore() != null
                                ? application.getOverallScore()
                                : 0,
                        "matcherVersion",
                        application.getMatcherVersion() != null
                                ? application.getMatcherVersion()
                                : "",
                        "matcherResult",
                        matcherResultObj
                )
        );
    }

    private Map<String, Object> buildApplicationMap(JobApplication app) {
        return Map.of(
                "applicationId", app.getId(),
                "jobId", app.getJob().getId(),
                "jobTitle", app.getJob().getJobTitle(),
                "resumeId", app.getResume().getId(),
                "status", app.getStatus().name(),
                "overallScore",
                app.getOverallScore() != null
                        ? app.getOverallScore()
                        : 0,
                "createdAt", app.getCreatedAt()
        );
    }
}