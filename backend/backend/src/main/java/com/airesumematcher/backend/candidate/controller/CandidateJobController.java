package com.airesumematcher.backend.candidate.controller;

import com.airesumematcher.backend.candidate.dto.CandidateJobResponse;
import com.airesumematcher.backend.candidate.service.CandidateJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates/jobs")
@RequiredArgsConstructor
public class CandidateJobController {

    private final CandidateJobService candidateJobService;

    @GetMapping
    public ResponseEntity<List<CandidateJobResponse>> getAvailableJobs(@RequestParam(required = false) String query, @RequestParam(required = false, defaultValue = "recent") String sortBy) {

        return ResponseEntity.ok(candidateJobService.getAvailableJobs(query, sortBy));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<CandidateJobResponse> getJobDetails(@PathVariable Long jobId) {

        return ResponseEntity.ok(candidateJobService.getJobDetails(jobId));
    }
}