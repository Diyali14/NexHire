package com.airesumematcher.backend.resume.service;

import com.airesumematcher.backend.recruiter.dto.ParsedJdDto;
import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ParsedDataMapperService {

    private final ObjectMapper objectMapper;

    // =========================================================
    // RESUME
    // =========================================================

    public String resumeToJson(ParsedResumeDto parsedResume) {
        try {
            return objectMapper.writeValueAsString(parsedResume);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ParsedResumeDto to JSON", e);
        }
    }

    public ParsedResumeDto jsonToResume(String json) {
        try {
            return objectMapper.readValue(json, ParsedResumeDto.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize JSON to ParsedResumeDto", e);
        }
    }

    // =========================================================
    // JOB DESCRIPTION
    // =========================================================

    public String jdToJson(ParsedJdDto parsedJd) {
        try {
            return objectMapper.writeValueAsString(parsedJd);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ParsedJdDto to JSON", e);
        }
    }

    public ParsedJdDto jsonToJd(String json) {
        try {
            return objectMapper.readValue(json, ParsedJdDto.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize JSON to ParsedJdDto", e);
        }
    }
}