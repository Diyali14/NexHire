package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
public class MatcherPayloadService {

    private final ObjectMapper objectMapper;

    public MatcherPayloadService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String buildPayload(
            ResumeParsedData resumeParsedData,
            JobParsedData jobParsedData
    ) {

        try {

            // =========================================================
            // 1. READ STORED RESUME JSON
            // =========================================================

            JsonNode resumeRoot =
                    objectMapper.readTree(
                            resumeParsedData.getParsedJson()
                    );

            if (resumeRoot == null || !resumeRoot.isObject()) {

                throw new IllegalArgumentException(
                        "Stored parsed resume JSON is not a valid JSON object"
                );
            }


            // =========================================================
            // 2. GET ACTUAL RESUME OBJECT
            //
            // Your parser stores it inside:
            //
            // parsedData.resume
            // =========================================================

            JsonNode parsedData =
                    resumeRoot.path("parsedData");

            if (parsedData.isMissingNode()
                    || !parsedData.isObject()) {

                throw new IllegalArgumentException(
                        "Parsed resume does not contain parsedData"
                );
            }

            JsonNode resumeNode =
                    parsedData.path("resume");

            if (resumeNode.isMissingNode()
                    || !resumeNode.isObject()) {

                throw new IllegalArgumentException(
                        "Parsed resume does not contain parsedData.resume"
                );
            }


            // =========================================================
            // 3. READ STORED JD JSON
            // =========================================================

            JsonNode jobRoot =
                    objectMapper.readTree(
                            jobParsedData.getParsedJson()
                    );

            if (jobRoot == null || !jobRoot.isObject()) {

                throw new IllegalArgumentException(
                        "Stored parsed job JSON is not a valid JSON object"
                );
            }


            // =========================================================
            // 4. BUILD jobRequirements
            //
            // Your JD parser stores these fields directly at root:
            //
            // status
            // modelVersion
            // jobTitle
            // experienceRequired
            // educationRequired
            // skills
            // =========================================================

            ObjectNode jobRequirements =
                    objectMapper.createObjectNode();

            jobRequirements.set(
                    "status",
                    jobRoot.path("status")
            );

            jobRequirements.set(
                    "modelVersion",
                    jobRoot.path("modelVersion")
            );

            jobRequirements.set(
                    "jobTitle",
                    jobRoot.path("jobTitle")
            );

            jobRequirements.set(
                    "experienceRequired",
                    jobRoot.path("experienceRequired")
            );

            jobRequirements.set(
                    "educationRequired",
                    jobRoot.path("educationRequired")
            );

            jobRequirements.set(
                    "skills",
                    jobRoot.path("skills")
            );


            // =========================================================
            // 5. BUILD candidate
            // =========================================================

            ObjectNode candidate =
                    objectMapper.createObjectNode();

            candidate.put(
                    "status",
                    parsedData
                            .path("status")
                            .asText(
                                    resumeRoot
                                            .path("status")
                                            .asText("COMPLETED")
                            )
            );

            candidate.put(
                    "language",
                    parsedData
                            .path("language")
                            .asText(
                                    resumeParsedData.getLanguage() != null
                                            ? resumeParsedData.getLanguage()
                                            : "en"
                            )
            );

            candidate.set(
                    "resume",
                    resumeNode
            );


            // =========================================================
            // 6. BUILD FINAL MATCHER REQUEST
            // =========================================================

            ObjectNode request =
                    objectMapper.createObjectNode();

            request.set(
                    "candidate",
                    candidate
            );

            request.set(
                    "jobRequirements",
                    jobRequirements
            );


            // =========================================================
            // 7. RETURN EXACT MATCHER JSON
            // =========================================================

            return objectMapper.writeValueAsString(
                    request
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to build matcher request",
                    e
            );
        }
    }
}