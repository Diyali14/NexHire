package com.airesumematcher.backend.candidate.controller;

import com.airesumematcher.backend.candidate.service.CandidateAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/v1/candidates/jobs")
@RequiredArgsConstructor
public class CandidateAiController {

    private final CandidateAiService candidateAiService;

    @PostMapping("/{jobId}/interview-questions")
    public ResponseEntity<JsonNode> generateInterviewQuestions(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.generateInterviewQuestions(jobId, authentication)
        );
    }

    @GetMapping("/{jobId}/interview-questions")
    public ResponseEntity<JsonNode> getInterviewQuestions(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.getInterviewQuestions(jobId, authentication)
        );
    }

    @PostMapping("/{jobId}/skill-gap")
    public ResponseEntity<JsonNode> analyzeSkillGap(
            @PathVariable Long jobId,
            @RequestParam(required = false) Long resumeId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.analyzeSkillGap(jobId, resumeId, authentication)
        );
    }

    @PostMapping("/{jobId}/analyze")
    public ResponseEntity<JsonNode> analyzeSkillGapAlias(
            @PathVariable Long jobId,
            @RequestParam(required = false) Long resumeId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.analyzeSkillGap(jobId, resumeId, authentication)
        );
    }

    @GetMapping("/{jobId}/skill-gap")
    public ResponseEntity<JsonNode> getSkillGap(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.getSkillGap(jobId, authentication)
        );
    }

    @GetMapping("/{jobId}/analyze")
    public ResponseEntity<JsonNode> getSkillGapAlias(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                candidateAiService.getSkillGap(jobId, authentication)
        );
    }
}
