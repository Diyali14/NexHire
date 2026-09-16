package com.airesumematcher.backend.recruiter.controller;

import com.airesumematcher.backend.recruiter.dto.RecruiterProfileRequest;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.service.RecruiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterService recruiterService;

    @GetMapping("/me")
    public RecruiterProfile getMyProfile(
            Authentication authentication
    ) {

        return recruiterService.getProfile(
                authentication.getName()
        );
    }

    @PutMapping("/me")
    public RecruiterProfile updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody RecruiterProfileRequest request
    ) {

        return recruiterService.updateProfile(
                authentication.getName(),
                request
        );
    }
}