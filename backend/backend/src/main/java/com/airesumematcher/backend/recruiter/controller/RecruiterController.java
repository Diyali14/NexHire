package com.airesumematcher.backend.recruiter.controller;

import com.airesumematcher.backend.recruiter.dto.RecruiterProfileRequest;
import com.airesumematcher.backend.recruiter.dto.RecruiterProfileResponse;
import com.airesumematcher.backend.recruiter.service.RecruiterProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterProfileService recruiterService;

    @GetMapping("/me")
    public RecruiterProfileResponse getMyProfile(
            Authentication authentication
    ) {
        return recruiterService.getMyProfile(
                authentication.getName()
        );
    }

    @PutMapping("/me")
    public RecruiterProfileResponse updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody RecruiterProfileRequest request
    ) {
        return recruiterService.updateProfile(
                authentication.getName(),
                request
        );
    }
}