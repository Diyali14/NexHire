package com.airesumematcher.backend.application.controller;

import com.airesumematcher.backend.application.dto.RecruiterApplicationResponse;
import com.airesumematcher.backend.application.service.RecruiterApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
public class RecruiterApplicationController {

    private final RecruiterApplicationService recruiterApplicationService;

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<RecruiterApplicationResponse>> getApplications(@PathVariable Long jobId, Authentication authentication) {

        return ResponseEntity.ok(recruiterApplicationService.getApplicationsForJob(jobId, authentication));

    }

    @GetMapping("/jobs/{jobId}/applications/{applicationId}")
    public ResponseEntity<Map<String, Object>> getApplicationDetails(@PathVariable Long jobId, @PathVariable Long applicationId, Authentication authentication) {

        return ResponseEntity.ok(recruiterApplicationService.getApplicationDetails(jobId, applicationId, authentication));
    }

    @GetMapping("/applications/{applicationId}/resume/download")
    public ResponseEntity<byte[]> downloadCandidateResume(@PathVariable Long applicationId, Authentication authentication) {

        Map<String, Object> result = recruiterApplicationService.downloadCandidateResume(applicationId, authentication);

        byte[] fileBytes = (byte[]) result.get("fileBytes");
        String fileName = (String) result.get("fileName");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName != null ? fileName : "candidate_resume.pdf").build());

        return ResponseEntity.ok().headers(headers).body(fileBytes);
    }
}