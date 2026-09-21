package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.ai.service.AiParserService;
import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.ResumeProcessingMessage;
import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
import com.airesumematcher.backend.resume.entity.ProcessingStatus;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.resume.service.ResumeParsedDataService;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ResumeMessageConsumer {

    private final ResumeRepository resumeRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final AiParserService aiParserService;
    private final ResumeParsedDataService resumeParsedDataService;

    public ResumeMessageConsumer(
            ResumeRepository resumeRepository,
            CloudinaryStorageService cloudinaryStorageService,
            AiParserService aiParserService,
            ResumeParsedDataService resumeParsedDataService
    ) {
        this.resumeRepository = resumeRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.aiParserService = aiParserService;
        this.resumeParsedDataService = resumeParsedDataService;
    }

    @RabbitListener(queues = RabbitMQConfig.RESUME_QUEUE)
    public void processResume(ResumeProcessingMessage message) {

        log.info("RESUME PROCESSING STARTED - Resume ID: {}, Candidate ID: {}",
                message.getResumeId(), message.getCandidateId());

        Resume resume = resumeRepository
                .findByIdAndCandidateId(
                        message.getResumeId(),
                        message.getCandidateId()
                )
                .orElseThrow(() ->
                        new RuntimeException("Resume not found for ID: " + message.getResumeId())
                );

        // Idempotency check: if already completed, do not re-process
        if (resume.getProcessingStatus() == ProcessingStatus.COMPLETED) {
            log.info("Resume ID {} already completed processing. Skipping.", message.getResumeId());
            return;
        }

        try {

            // 1. Mark PROCESSING
            resume.setProcessingStatus(ProcessingStatus.PROCESSING);
            resumeRepository.save(resume);

            log.info("Resume ID {} status updated to PROCESSING", message.getResumeId());

            // 2. Download file from Cloudinary
            byte[] fileBytes =
                    cloudinaryStorageService.downloadFile(
                            message.getStorageObjectName()
                    );

            log.info("Downloaded {} bytes from Cloudinary for resume ID {}", fileBytes.length, message.getResumeId());

            // 3. Send file to AI parser
            String fileName = "resume." + (message.getFileType() != null ? message.getFileType().toLowerCase() : "pdf");
            ParsedResumeDto parsedDto =
                    aiParserService.parseResume(
                            fileBytes,
                            fileName
                    );

            log.info("AI parser response received for resume ID {}", message.getResumeId());

            // 4. Save parsed data
            resumeParsedDataService.saveParsedData(
                    message.getResumeId(),
                    parsedDto
            );

            log.info("Parsed resume data saved to database for resume ID {}", message.getResumeId());

            // 5. Mark COMPLETED
            resume.setProcessingStatus(ProcessingStatus.COMPLETED);
            resumeRepository.save(resume);

            log.info("RESUME PROCESSING COMPLETED - Resume ID: {}", message.getResumeId());

        } catch (Exception e) {

            log.error("Resume processing failed for Resume ID: {}", message.getResumeId(), e);

            resume.setProcessingStatus(ProcessingStatus.FAILED);
            resumeRepository.save(resume);
        }
    }
}