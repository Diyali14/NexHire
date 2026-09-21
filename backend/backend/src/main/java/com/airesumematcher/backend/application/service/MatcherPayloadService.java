package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class MatcherPayloadService {

    private final ObjectMapper objectMapper;

    public MatcherPayloadService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String buildPayload(ResumeParsedData resumeParsedData, JobParsedData jobParsedData) {
        try {
            // 1. Read stored resume JSON
            JsonNode resumeRoot = objectMapper.readTree(resumeParsedData.getParsedJson());
            if (resumeRoot == null || !resumeRoot.isObject()) {

                throw new IllegalArgumentException("Stored parsed resume JSON is not a valid JSON object");
            }

            // Determine candidate object: exact resume parser response
            JsonNode candidateNode = resumeRoot;
            if (resumeRoot.has("parsedData") && resumeRoot.path("parsedData").isObject()) {

                candidateNode = resumeRoot.path("parsedData");
            }

            // 2. Read stored JD JSON
            JsonNode jobRoot = objectMapper.readTree(jobParsedData.getParsedJson());
            if (jobRoot == null || !jobRoot.isObject()) {

                throw new IllegalArgumentException("Stored parsed job JSON is not a valid JSON object");
            }

            // Determine jobRequirements object: exact JD parser response
            JsonNode jobRequirementsNode = jobRoot;

            // 3. Construct exact matcher request
            ObjectNode request = objectMapper.createObjectNode();
            request.set("candidate", candidateNode);
            request.set("jobRequirements", jobRequirementsNode);

            return objectMapper.writeValueAsString(request);

        } catch (Exception e) {
            throw new RuntimeException("Failed to build matcher request", e);
        }
    }
}