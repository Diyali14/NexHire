package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.recruiter.dto.RecruiterProfileRequest;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.repository.RecruiterProfileRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public RecruiterProfile getProfile(String email) {

        User user = getUser(email);

        return profileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recruiter profile not found"
                        )
                );
    }

    @Transactional
    public RecruiterProfile updateProfile(
            String email,
            RecruiterProfileRequest request
    ) {

        User user = getUser(email);

        RecruiterProfile profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recruiter profile not found"
                                )
                        );

        profile.setCompanyName(request.getCompanyName());
        profile.setDesignation(request.getDesignation());

        return profileRepository.save(profile);
    }

    private User getUser(String email) {

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }
}