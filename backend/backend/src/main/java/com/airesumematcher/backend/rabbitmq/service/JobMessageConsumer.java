package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.ai.service.AiParserService;
import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.recruiter.service.JobParsedDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
public class JobMessageConsumer {

    private final JobRepository jobRepository;
    private final AiParserService aiParserService;
    private final JobParsedDataService jobParsedDataService;
    private final ObjectMapper objectMapper;

    public JobMessageConsumer(JobRepository jobRepository, AiParserService aiParserService, JobParsedDataService jobParsedDataService, ObjectMapper objectMapper) {
        this.jobRepository = jobRepository;
        this.aiParserService = aiParserService;
        this.jobParsedDataService = jobParsedDataService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.JOB_QUEUE)
    public void processJob(JobProcessingMessage message) {

        log.info("JD PROCESSING STARTED - Job ID: {}, Title: {}", message.getJobId(), message.getJobTitle());

        Job job = jobRepository.findById(message.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found for ID: " + message.getJobId()));

        // Idempotency check: if already completed, do not re-process
        if (job.getProcessingStatus() == JobProcessingStatus.COMPLETED) {
            log.info("Job ID {} already completed processing. Skipping.", message.getJobId());
            return;
        }

        try {

            // 1. Mark job as PROCESSING
            job.setProcessingStatus(JobProcessingStatus.PROCESSING);
            jobRepository.save(job);

            log.info("Job ID {} status updated to PROCESSING", message.getJobId());

            // 2. Get plain-text job description
            String jobDescription = message.getJobDescription();
            if (jobDescription == null || jobDescription.isBlank()) {

                throw new IllegalArgumentException("Job description cannot be empty");
            }

            // 3. Send plain text JD to AI parser
            String parsedJson = aiParserService.analyzeJobDescription(jobDescription);

            log.info("AI JD parser response received for Job ID {}", message.getJobId());

            // 4. Parse AI response
            JsonNode root = objectMapper.readTree(parsedJson);
            String parserVersion = root.hasNonNull("modelVersion") ? root.get("modelVersion").asText() : null;

            // 5. Save complete parsed JSON
            jobParsedDataService.saveParsedData(message.getJobId(), parsedJson, parserVersion);

            log.info("Parsed JD data saved successfully for Job ID {}", message.getJobId());

            // 6. Mark job as COMPLETED
            job.setProcessingStatus(JobProcessingStatus.COMPLETED);
            jobRepository.save(job);

            log.info("JD PROCESSING COMPLETED - Job ID: {}", message.getJobId());

        } catch (Exception e) {

            log.error("JD processing failed for Job ID: {}", message.getJobId(), e);

            job.setProcessingStatus(JobProcessingStatus.FAILED);
            jobRepository.save(job);
        }
    }
}