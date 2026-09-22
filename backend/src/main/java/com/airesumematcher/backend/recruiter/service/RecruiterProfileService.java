package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.auth.dto.ChangePasswordRequest;
import com.airesumematcher.backend.auth.dto.PasswordResetRequest;
import com.airesumematcher.backend.recruiter.dto.RecruiterProfileRequest;
import com.airesumematcher.backend.recruiter.dto.RecruiterProfileResponse;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.repository.RecruiterProfileRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public RecruiterProfileResponse getMyProfile(String email) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId()).orElseThrow(() ->
                                new IllegalArgumentException("Recruiter profile not found"));

        return toResponse(profile);
    }

    @Transactional
    public RecruiterProfileResponse updateProfile(String email, RecruiterProfileRequest request) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RecruiterProfile profile = recruiterProfileRepository
                .findByUserId(user.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Recruiter profile not found"));

        if (request.getFirstName() != null) {

            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {

            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {

            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {

            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {

                throw new IllegalArgumentException("Email is already taken");
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);

        if (request.getCompanyName() != null) {

            profile.setCompanyName(request.getCompanyName());
        }
        if (request.getDesignation() != null) {

            profile.setDesignation(request.getDesignation());
        }

        RecruiterProfile savedProfile = recruiterProfileRepository.save(profile);

        return toResponse(savedProfile);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {

            throw new IllegalArgumentException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found for provided email"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private RecruiterProfileResponse toResponse(RecruiterProfile profile) {

        User user = profile.getUser();

        return RecruiterProfileResponse.builder().id(profile.getId()).userId(user.getId()).email(user.getEmail())
                .firstName(user.getFirstName()).lastName(user.getLastName()).phone(user.getPhone())
                .companyName(profile.getCompanyName()).designation(profile.getDesignation()).build();
    }
}