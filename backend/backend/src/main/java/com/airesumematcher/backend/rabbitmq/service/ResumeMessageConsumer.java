package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.ResumeProcessingMessage;
import com.airesumematcher.backend.resume.entity.ProcessingStatus;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class ResumeMessageConsumer {

    private final ResumeRepository resumeRepository;
    private final CloudinaryStorageService cloudinaryStorageService;

    public ResumeMessageConsumer(
            ResumeRepository resumeRepository,
            CloudinaryStorageService cloudinaryStorageService
    ) {
        this.resumeRepository = resumeRepository;
        this.cloudinaryStorageService =
                cloudinaryStorageService;
    }

    @RabbitListener(
            queues = RabbitMQConfig.RESUME_QUEUE
    )
    public void processResume(
            ResumeProcessingMessage message
    ) {

        System.out.println(
                "======================================"
        );

        System.out.println(
                "RESUME PROCESSING STARTED"
        );

        System.out.println(
                "Resume ID: "
                        + message.getResumeId()
        );

        // 1. Find resume in database
        Resume resume =
                resumeRepository
                        .findByIdAndCandidateId(
                                message.getResumeId(),
                                message.getCandidateId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );

        // 2. Mark as PROCESSING
        resume.setProcessingStatus(
                ProcessingStatus.PROCESSING
        );

        resumeRepository.save(resume);

        System.out.println(
                "Status: PROCESSING"
        );

        // 3. Download file from Cloudinary
        byte[] fileBytes =
                cloudinaryStorageService.downloadFile(
                        message.getStorageObjectName()
                );

        System.out.println(
                "File downloaded from Cloudinary"
        );

        System.out.println(
                "Downloaded bytes: "
                        + fileBytes.length
        );

        System.out.println(
                "Original file type: "
                        + message.getFileType()
        );

        System.out.println(
                "======================================"
        );
    }
}