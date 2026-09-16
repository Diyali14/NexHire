package com.airesumematcher.backend.candidate.service;

import com.airesumematcher.backend.candidate.dto.CandidateProfileResponse;
import com.airesumematcher.backend.candidate.dto.CandidateProfileUpdateRequest;
import com.airesumematcher.backend.candidate.entity.CandidateProfile;
import com.airesumematcher.backend.candidate.repository.CandidateProfileRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

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

        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setBio(request.getBio());

        CandidateProfile savedProfile =
                candidateProfileRepository.save(profile);

        return toResponse(savedProfile);
    }


}

