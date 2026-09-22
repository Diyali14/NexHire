package com.airesumematcher.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // PUBLIC
                        // =================================================

                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/health",
                                "/actuator/health",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/v1/storage-test/**"
                        ).permitAll()

                        // =================================================
                        // CANDIDATE
                        // =================================================

                        .requestMatchers("/api/v1/candidates/**").hasRole("CANDIDATE")

                        .requestMatchers("/api/v1/resumes/**").hasRole("CANDIDATE")

                        // Candidate applies to recruiter job
                        .requestMatchers(HttpMethod.POST, "/api/v1/jobs/*/apply").hasRole("CANDIDATE")

                        // =================================================
                        // RECRUITER
                        // =================================================

                        .requestMatchers("/api/v1/recruiters/**").hasRole("RECRUITER")

                        .requestMatchers("/api/v1/jobs/**").hasRole("RECRUITER")

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                        "http://localhost:5500",
                        "http://127.0.0.1:5501",
                        "http://localhost:3000",
                        "http://localhost:5000",
                        "http://localhost:5001",
			"http://127.0.0.1:5502",
			"http://127.0.0.1:5500",
			"https://nex-hire-frontend.vercel.app/",

                        "https://nex-hire-11i2.vercel.app"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}