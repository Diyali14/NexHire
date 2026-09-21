package com.airesumematcher.backend.candidate.controller;

import com.airesumematcher.backend.auth.dto.ChangePasswordRequest;
import com.airesumematcher.backend.auth.dto.PasswordResetRequest;
import com.airesumematcher.backend.candidate.dto.CandidateProfileResponse;
import com.airesumematcher.backend.candidate.dto.CandidateProfileUpdateRequest;
import com.airesumematcher.backend.candidate.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates/me")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping
    public CandidateProfileResponse getMyProfile(Authentication authentication) {

        return candidateProfileService.getMyProfile(authentication.getName());

    }

    @PutMapping
    public CandidateProfileResponse updateMyProfile(Authentication authentication, @Valid @RequestBody CandidateProfileUpdateRequest request) {

        return candidateProfileService.updateMyProfile(authentication.getName(), request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {

        candidateProfileService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> passwordReset(@Valid @RequestBody PasswordResetRequest request) {

        candidateProfileService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
