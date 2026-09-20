package com.airesumematcher.backend.application.controller;

import com.airesumematcher.backend.application.dto.JobApplicationRequest;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> apply(
            @PathVariable Long jobId,
            @Valid @RequestBody JobApplicationRequest request,
            Authentication authentication
    ) {

        JobApplication application =
                jobApplicationService.createApplication(
                        jobId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(
                Map.of(
                        "applicationId", application.getId(),
                        "jobId", jobId,
                        "resumeId", request.getResumeId(),
                        "status", application.getStatus().name(),
                        "message",
                        "Application submitted successfully. Matching is being processed."
                )
        );
    }
}