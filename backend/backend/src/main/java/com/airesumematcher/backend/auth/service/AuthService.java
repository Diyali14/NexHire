package com.airesumematcher.backend.auth.service;

import com.airesumematcher.backend.auth.dto.*;
import com.airesumematcher.backend.candidate.entity.CandidateProfile;
import com.airesumematcher.backend.candidate.repository.CandidateProfileRepository;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.repository.RecruiterProfileRepository;
import com.airesumematcher.backend.security.JwtService;
import com.airesumematcher.backend.user.entity.*;
import com.airesumematcher.backend.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final com.airesumematcher.backend.security.CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request, RoleName roleName) {

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {

            throw new IllegalArgumentException("Email is already registered");
        }

        Role role = roleRepository.findByName(roleName).orElseThrow(() -> new IllegalStateException("Role not configured: " + roleName));

        User user = User.builder().email(request.getEmail().trim().toLowerCase()).passwordHash(passwordEncoder.encode(request.getPassword()))

                .firstName(request.getFirstName().trim()).lastName(request.getLastName())
                .phone(request.getPhone()).status("ACTIVE")
                .roles(Set.of(role)).build();

        user = userRepository.save(user);

        if (roleName == RoleName.CANDIDATE) {

            CandidateProfile profile = CandidateProfile.builder().user(user).build();

            candidateProfileRepository.save(profile);

        } else if (roleName == RoleName.RECRUITER) {

            RecruiterProfile profile = RecruiterProfile.builder().user(user).build();

            recruiterProfileRepository.save(profile);
        }

        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request, RoleName expectedRole
    ) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        boolean hasExpectedRole = user.getRoles().stream().anyMatch(role -> role.getName() == expectedRole);

        if (!hasExpectedRole) {

            throw new BadCredentialsException("User does not have the required role");
        }

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String token = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

        return AuthResponse.builder().token(token).userId(user.getId()).email(user.getEmail()).firstName(user.getFirstName()).roles(roles).build();

    }
}