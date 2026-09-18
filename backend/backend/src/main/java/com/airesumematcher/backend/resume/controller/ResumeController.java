package com.airesumematcher.backend.resume.controller;

import com.airesumematcher.backend.resume.dto.ResumeUploadResponse;
import com.airesumematcher.backend.resume.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        ResumeUploadResponse response =
                resumeService.uploadResume(
                        file,
                        authentication
                );

        return ResponseEntity.ok(response);
    }
}