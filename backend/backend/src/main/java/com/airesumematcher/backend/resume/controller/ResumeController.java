package com.airesumematcher.backend.resume.controller;

import com.airesumematcher.backend.resume.dto.ResumeParsedDataResponse;
import com.airesumematcher.backend.resume.dto.ResumeResponse;
import com.airesumematcher.backend.resume.dto.ResumeStatusResponse;
import com.airesumematcher.backend.resume.dto.ResumeUploadResponse;
import com.airesumematcher.backend.resume.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(
            ResumeService resumeService
    ) {
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

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                resumeService.getMyResumes(authentication)
        );
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getMyResume(
            @PathVariable Long resumeId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                resumeService.getMyResume(
                        resumeId,
                        authentication
                )
        );
    }

    @GetMapping("/{resumeId}/status")
    public ResponseEntity<ResumeStatusResponse> getResumeStatus(
            @PathVariable Long resumeId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                resumeService.getResumeStatus(
                        resumeId,
                        authentication
                )
        );
    }

    @GetMapping("/{resumeId}/parsed-data")
    public ResponseEntity<ResumeParsedDataResponse> getParsedData(
            @PathVariable Long resumeId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                resumeService.getParsedData(
                        resumeId,
                        authentication
                )
        );
    }
}