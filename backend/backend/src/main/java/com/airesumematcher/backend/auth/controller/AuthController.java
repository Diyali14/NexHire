package com.airesumematcher.backend.auth.controller;

import com.airesumematcher.backend.auth.dto.*;
import com.airesumematcher.backend.auth.service.AuthService;
import com.airesumematcher.backend.candidate.dto.CandidateProfileResponse;
import com.airesumematcher.backend.candidate.dto.CandidateProfileUpdateRequest;
import com.airesumematcher.backend.user.entity.RoleName;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/candidate/register")
    public ResponseEntity<AuthResponse> registerCandidate(
            @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        authService.register(
                                request,
                                RoleName.CANDIDATE
                        )
                );
    }

    @PostMapping("/recruiter/register")
    public ResponseEntity<AuthResponse> registerRecruiter(
            @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        authService.register(
                                request,
                                RoleName.RECRUITER
                        )
                );
    }

    @PostMapping("/candidate/login")
    public ResponseEntity<AuthResponse> loginCandidate(
            @Valid @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(
                        request,
                        RoleName.CANDIDATE
                )
        );
    }

    @PostMapping("/recruiter/login")
    public ResponseEntity<AuthResponse> loginRecruiter(
            @Valid @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(
                        request,
                        RoleName.RECRUITER
                )
        );
    }

}