package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.ai.service.AiParserService;
import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.recruiter.service.JobParsedDataService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class JobMessageConsumer {

    private final JobRepository jobRepository;
    private final AiParserService aiParserService;
    private final JobParsedDataService jobParsedDataService;
    private final ObjectMapper objectMapper;

    public JobMessageConsumer(
            JobRepository jobRepository,
            AiParserService aiParserService,
            JobParsedDataService jobParsedDataService,
            ObjectMapper objectMapper
    ) {
        this.jobRepository = jobRepository;
        this.aiParserService = aiParserService;
        this.jobParsedDataService = jobParsedDataService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.JOB_QUEUE)
    public void processJob(JobProcessingMessage message) {

        System.out.println("======================================");
        System.out.println("JD PROCESSING STARTED");
        System.out.println("Job ID: " + message.getJobId());
        System.out.println("Job Title: " + message.getJobTitle());

        Job job = jobRepository
                .findById(message.getJobId())
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        try {

            // 1. Mark job as PROCESSING

            job.setProcessingStatus(
                    JobProcessingStatus.PROCESSING
            );

            jobRepository.save(job);

            System.out.println("Status: PROCESSING");


            // 2. Get plain-text job description
            // directly from RabbitMQ message

            String jobDescription =
                    message.getJobDescription();

            if (jobDescription == null ||
                    jobDescription.isBlank()) {

                throw new IllegalArgumentException(
                        "Job description cannot be empty"
                );
            }

            System.out.println(
                    "Job description received from RabbitMQ"
            );


            // 3. Send plain text JD to AI parser

            String parsedJson =
                    aiParserService.analyzeJobDescription(
                            jobDescription
                    );

            System.out.println(
                    "AI JD parser response received"
            );


            // 4. Parse AI response

            JsonNode root =
                    objectMapper.readTree(parsedJson);

            String parserVersion =
                    root.path("modelVersion")
                            .asText(null);


            // 5. Save complete parsed JSON

            jobParsedDataService.saveParsedData(
                    message.getJobId(),
                    parsedJson,
                    parserVersion
            );

            System.out.println(
                    "Parsed JD data saved successfully"
            );


            // 6. Mark job as COMPLETED

            job.setProcessingStatus(
                    JobProcessingStatus.COMPLETED
            );

            jobRepository.save(job);

            System.out.println("Status: COMPLETED");
            System.out.println("======================================");

        } catch (Exception e) {

            System.err.println(
                    "JD processing failed for Job ID: "
                            + message.getJobId()
            );

            e.printStackTrace();

            job.setProcessingStatus(
                    JobProcessingStatus.FAILED
            );

            jobRepository.save(job);

            throw new RuntimeException(
                    "Job description processing failed",
                    e
            );
        }
    }
}