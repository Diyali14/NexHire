package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.ai.service.AiMatcherService;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.entity.JobApplicationStatus;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.application.service.MatcherPayloadService;
import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.MatcherProcessingMessage;
import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MatcherMessageConsumer {

    private final JobApplicationRepository applicationRepository;

    private final ResumeParsedDataRepository resumeParsedDataRepository;

    private final JobParsedDataRepository jobParsedDataRepository;

    private final MatcherPayloadService matcherPayloadService;

    private final AiMatcherService aiMatcherService;

    private final ObjectMapper objectMapper;

    public MatcherMessageConsumer(
            JobApplicationRepository applicationRepository,
            ResumeParsedDataRepository resumeParsedDataRepository,
            JobParsedDataRepository jobParsedDataRepository,
            MatcherPayloadService matcherPayloadService,
            AiMatcherService aiMatcherService,
            ObjectMapper objectMapper
    ) {

        this.applicationRepository =
                applicationRepository;

        this.resumeParsedDataRepository =
                resumeParsedDataRepository;

        this.jobParsedDataRepository =
                jobParsedDataRepository;

        this.matcherPayloadService =
                matcherPayloadService;

        this.aiMatcherService =
                aiMatcherService;

        this.objectMapper =
                objectMapper;
    }

    @RabbitListener(
            queues = RabbitMQConfig.MATCHER_QUEUE
    )
    public void processMatcher(
            MatcherProcessingMessage message
    ) {

        JobApplication application =
                applicationRepository
                        .findById(
                                message.getApplicationId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found: "
                                                + message.getApplicationId()
                                )
                        );

        try {

            // =================================================
            // 1. MARK AS MATCHING
            // =================================================

            application.setStatus(
                    JobApplicationStatus.MATCHING
            );

            application.setErrorMessage(null);

            applicationRepository.save(application);


            // =================================================
            // 2. GET PARSED RESUME
            // =================================================

            ResumeParsedData resumeParsedData =
                    resumeParsedDataRepository
                            .findByResumeId(
                                    message.getResumeId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parsed resume data not found for resume: "
                                                    + message.getResumeId()
                                    )
                            );


            // =================================================
            // 3. GET PARSED JOB
            // =================================================

            JobParsedData jobParsedData =
                    jobParsedDataRepository
                            .findByJobId(
                                    message.getJobId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parsed job data not found for job: "
                                                    + message.getJobId()
                                    )
                            );


            // =================================================
            // 4. BUILD EXACT MATCHER PAYLOAD
            // =================================================

            String matcherPayload =
                    matcherPayloadService.buildPayload(
                            resumeParsedData,
                            jobParsedData
                    );


            // =================================================
            // 5. CALL PYTHON AI MATCHER
            // =================================================

            String matcherResponse =
                    aiMatcherService.match(
                            matcherPayload
                    );


            // =================================================
            // 6. VALIDATE MATCHER RESPONSE
            // =================================================

            JsonNode result =
                    objectMapper.readTree(
                            matcherResponse
                    );

            if (result == null
                    || !result.isObject()) {

                throw new IllegalArgumentException(
                        "Matcher returned invalid JSON"
                );
            }

            String status =
                    result.hasNonNull("status") ? result.get("status").asText() : null;

            if (status == null
                    || status.isBlank()) {

                throw new IllegalArgumentException(
                        "Matcher response does not contain status"
                );
            }


            // =================================================
            // 7. EXTRACT SCORE
            // =================================================

            Integer overallScore = null;

            if (result
                    .path("overallScore")
                    .isNumber()) {

                overallScore =
                        result
                                .path("overallScore")
                                .asInt();
            }


            // =================================================
            // 8. EXTRACT MATCHER VERSION
            // =================================================

            String modelVersion =
                    result.hasNonNull("modelVersion") ? result.get("modelVersion").asText() : null;


            // =================================================
            // 9. SAVE COMPLETE MATCHER RESPONSE
            // =================================================

            application.setMatcherResult(
                    objectMapper.writeValueAsString(
                            result
                    )
            );

            application.setOverallScore(
                    overallScore
            );

            application.setMatcherVersion(
                    modelVersion
            );

            application.setStatus(
                    JobApplicationStatus.MATCHED
            );

            application.setErrorMessage(null);

            applicationRepository.save(
                    application
            );

        } catch (Exception e) {

            // =================================================
            // MATCHING FAILED
            // =================================================

            application.setStatus(
                    JobApplicationStatus.FAILED
            );

            application.setErrorMessage(
                    e.getMessage()
            );

            applicationRepository.save(
                    application
            );

            /*
             * Do not rethrow here.
             *
             * If we throw after saving FAILED, RabbitMQ may
             * redeliver the same message depending on the
             * acknowledgement configuration.
             */
        }
    }
}