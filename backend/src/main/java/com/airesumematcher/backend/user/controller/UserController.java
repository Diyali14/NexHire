package com.airesumematcher.backend.user.controller;

import com.airesumematcher.backend.user.dto.PasswordChangeRequest;
import com.airesumematcher.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(Authentication authentication, @Valid @RequestBody PasswordChangeRequest request) {

        userService.changePassword(authentication.getName(), request);

        return ResponseEntity.ok("Password changed successfully");
    }
}