package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.recruiter.dto.RecruiterProfileRequest;
import com.airesumematcher.backend.recruiter.dto.RecruiterProfileResponse;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.repository.RecruiterProfileRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    public RecruiterProfileResponse getMyProfile(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        RecruiterProfile profile =
                recruiterProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recruiter profile not found"
                                )
                        );

        return toResponse(profile);
    }

    @Transactional
    public RecruiterProfileResponse updateProfile(
            String email,
            RecruiterProfileRequest request
    ) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        RecruiterProfile profile =
                recruiterProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recruiter profile not found"
                                )
                        );

        profile.setCompanyName(request.getCompanyName());
        profile.setDesignation(request.getDesignation());

        RecruiterProfile savedProfile =
                recruiterProfileRepository.save(profile);

        return toResponse(savedProfile);
    }

    private RecruiterProfileResponse toResponse(
            RecruiterProfile profile
    ) {

        User user = profile.getUser();

        return RecruiterProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .companyName(profile.getCompanyName())
                .designation(profile.getDesignation())
                .build();
    }
}