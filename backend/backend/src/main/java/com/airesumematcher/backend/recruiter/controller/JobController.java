package com.airesumematcher.backend.recruiter.controller;

import com.airesumematcher.backend.recruiter.dto.JobCreateRequest;
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

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobCreateRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                jobService.createJob(
                        request,
                        authentication
                )
        );
    }

//    @GetMapping
//    public ResponseEntity<List<JobResponse>> getMyJobs(
//            Authentication authentication
//    ) {
//
//        return ResponseEntity.ok(
//                jobService.getMyJobs(
//                        authentication
//                )
//        );
//    }
//
//    @GetMapping("/{jobId}")
//    public ResponseEntity<JobResponse> getMyJob(
//            @PathVariable Long jobId,
//            Authentication authentication
//    ) {
//
//        return ResponseEntity.ok(
//                jobService.getMyJob(
//                        jobId,
//                        authentication
//                )
//        );
//    }

    @GetMapping("/{jobId}/status")
    public ResponseEntity<JobStatusResponse> getJobStatus(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                jobService.getJobStatus(
                        jobId,
                        authentication
                )
        );
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        jobService.deleteJob(
                jobId,
                authentication
        );

        return ResponseEntity.noContent().build();
    }
}
