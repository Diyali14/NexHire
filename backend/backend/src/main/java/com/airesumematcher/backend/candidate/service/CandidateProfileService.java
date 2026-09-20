package com.airesumematcher.backend.candidate.service;

import com.airesumematcher.backend.auth.dto.ChangePasswordRequest;
import com.airesumematcher.backend.auth.dto.PasswordResetRequest;
import com.airesumematcher.backend.candidate.dto.CandidateProfileResponse;
import com.airesumematcher.backend.candidate.dto.CandidateProfileUpdateRequest;
import com.airesumematcher.backend.candidate.entity.CandidateProfile;
import com.airesumematcher.backend.candidate.repository.CandidateProfileRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public CandidateProfileResponse getMyProfile(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        CandidateProfile profile =
                candidateProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Candidate profile not found"
                                )
                        );

        return toResponse(profile);
    }

    @Transactional
    public CandidateProfileResponse updateMyProfile(
            String email,
            CandidateProfileUpdateRequest request
    ) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        CandidateProfile profile =
                candidateProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Candidate profile not found"
                                )
                        );

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

        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        CandidateProfile savedProfile =
                candidateProfileRepository.save(profile);

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

    private CandidateProfileResponse toResponse(
            CandidateProfile profile
    ) {

        User user = profile.getUser();

        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .bio(profile.getBio())
                .build();
    }
}
