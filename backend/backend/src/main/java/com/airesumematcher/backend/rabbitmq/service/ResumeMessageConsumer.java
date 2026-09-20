package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.ai.service.AiParserService;
import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.ResumeProcessingMessage;
import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.entity.ProcessingStatus;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.resume.service.ResumeParsedDataService;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class ResumeMessageConsumer {

    private final ResumeRepository resumeRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final AiParserService aiParserService;
    private final ResumeParsedDataService resumeParsedDataService;
    private final ObjectMapper objectMapper;

    public ResumeMessageConsumer(
            ResumeRepository resumeRepository,
            CloudinaryStorageService cloudinaryStorageService,
            AiParserService aiParserService,
            ResumeParsedDataService resumeParsedDataService,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.aiParserService = aiParserService;
        this.resumeParsedDataService = resumeParsedDataService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.RESUME_QUEUE)
    public void processResume(ResumeProcessingMessage message) {

        System.out.println("======================================");
        System.out.println("RESUME PROCESSING STARTED");
        System.out.println("Resume ID: " + message.getResumeId());

        Resume resume = resumeRepository
                .findByIdAndCandidateId(
                        message.getResumeId(),
                        message.getCandidateId()
                )
                .orElseThrow(() ->
                        new RuntimeException("Resume not found")
                );

        try {

            // 1. Mark PROCESSING

            resume.setProcessingStatus(ProcessingStatus.PROCESSING);
            resumeRepository.save(resume);

            System.out.println("Status: PROCESSING");


            // 2. Download PDF from Cloudinary

            byte[] fileBytes =
                    cloudinaryStorageService.downloadFile(
                            message.getStorageObjectName()
                    );

            System.out.println("File downloaded from Cloudinary");
            System.out.println(
                    "Downloaded bytes: " + fileBytes.length
            );


            // 3. Send PDF to AI parser

            ParsedResumeDto parsedJson =
                    aiParserService.parseResume(
                            fileBytes,
                            "resume.pdf"
                    );
            System.out.println(parsedJson);
            System.out.println("AI parser response received");


            // 4. Extract parser version

//            JsonNode root =
//                    objectMapper.readTree(parsedJson);
//
//            String parserVersion =
//                    root.path("parserVersion")
//                            .asText(null);
//
//
//            // 5. Save parsed data
//
//            resumeParsedDataService.saveParsedData(
//                    message.getResumeId(),
//                    parsedJson,
//                    parserVersion
//            );
//
//            System.out.println("Parsed data saved");
//
//
//            // 6. Mark COMPLETED
//
//            resume.setProcessingStatus(
//                    ProcessingStatus.COMPLETED
//            );
//
//            resumeRepository.save(resume);

            System.out.println("Status: COMPLETED");
            System.out.println("======================================");

        }
        catch (Exception e) {

            System.err.println(
                    "Resume processing failed: "
                            + message.getResumeId()
            );

            e.printStackTrace();

            resume.setProcessingStatus(
                    ProcessingStatus.FAILED
            );

            resumeRepository.save(resume);

            throw new RuntimeException(
                    "Resume processing failed",
                    e
            );
        }
    }
}