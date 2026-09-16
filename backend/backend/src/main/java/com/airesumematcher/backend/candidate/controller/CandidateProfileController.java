package com.airesumematcher.backend.candidate.controller;

import com.airesumematcher.backend.candidate.dto.CandidateProfileResponse;
import com.airesumematcher.backend.candidate.dto.CandidateProfileUpdateRequest;
import com.airesumematcher.backend.candidate.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates/me")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping
    public CandidateProfileResponse getMyProfile(
            Authentication authentication
    ) {
        return candidateProfileService.getMyProfile(
                authentication.getName()
        );
    }

    @PutMapping public CandidateProfileResponse updateMyProfile( Authentication authentication, @Valid @RequestBody CandidateProfileUpdateRequest request ) { return candidateProfileService.updateMyProfile( authentication.getName(), request ); }

}

