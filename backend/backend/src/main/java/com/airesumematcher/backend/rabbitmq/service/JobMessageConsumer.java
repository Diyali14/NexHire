package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class JobMessageConsumer {

    private final JobRepository jobRepository;

//    private final CloudinaryStorageService cloudinaryStorageService;

    public JobMessageConsumer(JobRepository jobRepository, CloudinaryStorageService cloudinaryStorageService) {

        this.jobRepository = jobRepository;

//        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    // Consumer disabled so messages remain in the RabbitMQ job.queue in Ready state for external processing.
//     @RabbitListener(queues = RabbitMQConfig.JOB_QUEUE)
    public void processJob(JobProcessingMessage message) {

        System.out.println("======================================");

        System.out.println("JD PROCESSING STARTED");

        System.out.println("Job ID: " + message.getJobId());

        System.out.println("Job title : "+ message.getJobTitle());

        System.out.println("Job description : "+ message.getJobDescription());


        // 1. Find job
//        Job job = jobRepository.findByIdAndRecruiterId(
//                                message.getJobId(),
//                                message.getRecruiterId()
//                        )
//                        .orElseThrow(() -> new RuntimeException("Job not found")
//                        );
//
//        // 2. Mark as PROCESSING
//        job.setProcessingStatus(JobProcessingStatus.PROCESSING);
//
//        jobRepository.save(job);

        System.out.println("Status: PROCESSING");

        // 3. Download JD PDF from Cloudinary
//        byte[] fileBytes = cloudinaryStorageService.downloadFile(message.getStorageObjectName());
//
//        System.out.println("JD PDF downloaded from Cloudinary");
//
//        System.out.println("Downloaded bytes: " + fileBytes.length);
//
//        System.out.println("Storage object: " + message.getStorageObjectName());

        System.out.println("======================================");
    }
}