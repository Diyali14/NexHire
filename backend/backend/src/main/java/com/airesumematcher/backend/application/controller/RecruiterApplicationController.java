package com.airesumematcher.backend.application.controller;

import com.airesumematcher.backend.application.dto.RecruiterApplicationResponse;
import com.airesumematcher.backend.application.service.RecruiterApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiters/jobs")
@RequiredArgsConstructor
public class RecruiterApplicationController {

    private final RecruiterApplicationService recruiterApplicationService;

    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<RecruiterApplicationResponse>> getApplications(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                recruiterApplicationService
                        .getApplicationsForJob(
                                jobId,
                                authentication
                        )
        );
    }
}