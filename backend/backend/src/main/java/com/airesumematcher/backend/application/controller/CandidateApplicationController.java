package com.airesumematcher.backend.application.controller;

import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateApplicationController {

    private final JobApplicationRepository applicationRepository;

    private final UserRepository userRepository;


    @GetMapping("/jobs/{jobId}/application")
    public ResponseEntity<?> getApplication(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        // =========================================================
        // 1. GET AUTHENTICATED CANDIDATE
        // =========================================================

        User candidate = userRepository.findByEmailIgnoreCase(authentication.getName())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Authenticated candidate not found"
                                )
                        );


        // =========================================================
        // 2. GET APPLICATION
        // =========================================================

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


        // =========================================================
        // 3. RETURN APPLICATION STATUS
        // =========================================================

        return ResponseEntity.ok(
                Map.of(
                        "applicationId",
                        application.getId(),

                        "jobId",
                        application
                                .getJob()
                                .getId(),

                        "resumeId",
                        application
                                .getResume()
                                .getId(),

                        "status",
                        application
                                .getStatus()
                                .name(),

                        "overallScore",
                        application.getOverallScore()
                                != null
                                ? application.getOverallScore()
                                : 0
                )
        );
    }
}