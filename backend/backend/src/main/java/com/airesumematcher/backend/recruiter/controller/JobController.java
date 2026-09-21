package com.airesumematcher.backend.recruiter.controller;

import com.airesumematcher.backend.recruiter.dto.JobCreateRequest;
import com.airesumematcher.backend.recruiter.dto.JobParsedDataResponse;
import com.airesumematcher.backend.recruiter.dto.JobResponse;
import com.airesumematcher.backend.recruiter.dto.JobStatusResponse;
import com.airesumematcher.backend.recruiter.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // =========================================================
    // CREATE JOB
    // =========================================================

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobCreateRequest request, Authentication authentication) {
        return ResponseEntity.ok(jobService.createJob(request, authentication));
    }

    // =========================================================
    // GET RECRUITER'S OWN JOBS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<JobResponse>> getMyJobs(Authentication authentication) {
        return ResponseEntity.ok(jobService.getMyJobs(authentication));
    }

    // =========================================================
    // GET SINGLE JOB DETAILS FOR RECRUITER
    // =========================================================

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long jobId, Authentication authentication) {
        return ResponseEntity.ok(jobService.getJob(jobId, authentication));
    }

    // =========================================================
    // UPDATE JOB
    // =========================================================

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long jobId, @Valid @RequestBody JobCreateRequest request, Authentication authentication) {
        return ResponseEntity.ok(jobService.updateJob(jobId, request, authentication));
    }

    // =========================================================
    // GET JOB STATUS
    // =========================================================

    @GetMapping("/{jobId}/status")
    public ResponseEntity<JobStatusResponse> getJobStatus(@PathVariable Long jobId, Authentication authentication) {

        return ResponseEntity.ok(jobService.getJobStatus(jobId, authentication));
    }

    // =========================================================
    // GET PARSED JOB DATA
    // =========================================================

    @GetMapping("/{jobId}/parsed-data")
    public ResponseEntity<JobParsedDataResponse> getParsedJobData(@PathVariable Long jobId, Authentication authentication) {
        return ResponseEntity.ok(jobService.getParsedJobData(jobId, authentication));
    }

    // =========================================================
    // DELETE JOB
    // =========================================================

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId, Authentication authentication) {

        jobService.deleteJob(jobId, authentication);

        return ResponseEntity.noContent().build();
    }
}