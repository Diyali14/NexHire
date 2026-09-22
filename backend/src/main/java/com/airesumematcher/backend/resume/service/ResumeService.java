package com.airesumematcher.backend.resume.service;

import com.airesumematcher.backend.rabbitmq.dto.ResumeProcessingMessage;
import com.airesumematcher.backend.rabbitmq.service.ResumeMessageProducer;
import com.airesumematcher.backend.resume.dto.*;
import com.airesumematcher.backend.resume.entity.ProcessingStatus;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.storage.service.FileProcessingService;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ResumeService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "txt", "docx");

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final ResumeRepository resumeRepository;
    private final ResumeParsedDataRepository resumeParsedDataRepository;
    private final UserRepository userRepository;
    private final FileProcessingService fileProcessingService;
    private final ResumeMessageProducer resumeMessageProducer;
    private final ResumeParsedDataService resumeParsedDataService;

    public ResumeService(ResumeRepository resumeRepository, ResumeParsedDataRepository resumeParsedDataRepository,
            UserRepository userRepository, FileProcessingService fileProcessingService,
            ResumeMessageProducer resumeMessageProducer, ResumeParsedDataService resumeParsedDataService) {
        this.resumeRepository = resumeRepository;
        this.resumeParsedDataRepository = resumeParsedDataRepository;
        this.userRepository = userRepository;
        this.fileProcessingService = fileProcessingService;
        this.resumeMessageProducer = resumeMessageProducer;
        this.resumeParsedDataService = resumeParsedDataService;
    }

    // =========================================================
    // UPLOAD RESUME
    // =========================================================

    @Transactional
    public ResumeUploadResponse uploadResume(MultipartFile file, Authentication authentication) {

        // 1. Validate file
        validateFile(file);

        // 2. Get authenticated user's email from JWT
        String email = authentication.getName();

        // 3. Resolve actual User from database
        User candidate = userRepository.findByEmailIgnoreCase(email)
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // 4. Calculate SHA-256 hash of original uploaded file
        String fileHash;

        try {
            fileHash = calculateSha256(file.getBytes());

        } catch (IOException e) {

            throw new RuntimeException("Failed to read uploaded file", e);
        }

        // 5. Create initial database record
        Resume resume = Resume
                .builder()
                        .candidate(candidate)
                        .originalFileName(file.getOriginalFilename())
                        .fileType(getFileExtension(file.getOriginalFilename()).toUpperCase())
                        .fileSize(file.getSize())
                        .fileHash(fileHash)
                        .processingStatus(ProcessingStatus.UPLOADED)
                        .build();

        resume = resumeRepository.saveAndFlush(resume);

        Long resumeId = resume.getId();

        // 6. Generate Cloudinary public ID
        String publicId = "nexhire/candidates/" + candidate.getId() + "/resumes/" + resumeId + "/resume";

        // 7. Convert if necessary + upload to Cloudinary
        Map<String, Object> uploadResult;

        try {

            uploadResult = fileProcessingService.processAndUpload(file, publicId);

        } catch (Exception e) {

            resume.setProcessingStatus(ProcessingStatus.FAILED);

            resumeRepository.save(resume);

            throw new RuntimeException("Failed to process and upload resume", e);
        }

        // 8. Save Cloudinary information
        resume.setStorageObjectName(publicId);

        Object secureUrl = uploadResult.get("secureUrl");

        if (secureUrl != null) {

            resume.setStorageUrl(secureUrl.toString());
        }

        // 9. Create RabbitMQ processing message
        ResumeProcessingMessage message = ResumeProcessingMessage.builder()
                        .resumeId(resumeId)
                        .candidateId(candidate.getId())
                        .storageObjectName(publicId)
                        .storageUrl(resume.getStorageUrl())
                        .fileType(getFileExtension(file.getOriginalFilename()).toUpperCase())
                        .build();

        // 10. Publish message to RabbitMQ asynchronously
        try {

            resumeMessageProducer.publish(
                    message
            );

            resume.setProcessingStatus(
                    ProcessingStatus.QUEUED
            );

        } catch (Exception e) {

            resume.setProcessingStatus(ProcessingStatus.FAILED);

            resumeRepository.save(resume);

            throw new RuntimeException("Resume uploaded but failed to queue for processing", e);
        }

        // 11. Save final state
        resumeRepository.save(resume);

        // 12. Return upload response
        return ResumeUploadResponse.builder().resumeId(resumeId).fileName(file.getOriginalFilename())
                .fileType(getFileExtension(file.getOriginalFilename()).toUpperCase())
                .status(resume.getProcessingStatus().name())
                .message("Resume uploaded and queued for processing.")
                .build();
    }

    // =========================================================
    // GET ALL RESUMES OF CURRENT CANDIDATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(Authentication authentication) {

        User candidate = getAuthenticatedCandidate(authentication);

        return resumeRepository
                .findAllByCandidateIdOrderByCreatedAtDesc(candidate.getId())
                .stream()
                .map(this::toResumeResponse)
                .toList();
    }

    // =========================================================
    // GET ONE RESUME
    // =========================================================

    @Transactional(readOnly = true)
    public ResumeResponse getMyResume(Long resumeId, Authentication authentication) {

        User candidate = getAuthenticatedCandidate(authentication);

        Resume resume = resumeRepository.findByIdAndCandidateId(resumeId, candidate.getId())
                        .orElseThrow(() -> new RuntimeException("Resume not found"));

        return toResumeResponse(resume);
    }

    // =========================================================
    // GET RESUME PROCESSING STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public ResumeStatusResponse getResumeStatus(Long resumeId, Authentication authentication) {

        User candidate = getAuthenticatedCandidate(authentication);

        Resume resume = resumeRepository.findByIdAndCandidateId(resumeId, candidate.getId())
                        .orElseThrow(() -> new RuntimeException("Resume not found"));

        boolean parsedDataAvailable = resumeParsedDataRepository.existsByResumeId(resumeId);

        String message;

        switch (resume.getProcessingStatus()) {

            case UPLOADED -> message = "Resume has been uploaded.";

            case QUEUED -> message = "Resume is waiting to be processed.";

            case PROCESSING -> message = "Resume is currently being processed.";

            case COMPLETED -> message = "Resume processing completed.";

            case PARTIAL -> message = "Resume processing completed with partial data.";

            case FAILED -> message = "Resume processing failed.";

            default -> message = "Unknown resume processing status.";
        }

        return ResumeStatusResponse
                .builder()
                .resumeId(resumeId)
                .status(resume.getProcessingStatus().name())
                .parsedDataAvailable(parsedDataAvailable)
                .message(message)
                .build();
    }

    // =========================================================
    // GET PARSED RESUME DATA
    // =========================================================

    @Transactional(readOnly = true)
    public ResumeParsedDataResponse getParsedData(Long resumeId, Authentication authentication) {

        User candidate = getAuthenticatedCandidate(authentication);

        return resumeParsedDataService.getParsedData(resumeId, candidate.getId());
    }

    // =========================================================
    // GET AUTHENTICATED CANDIDATE
    // =========================================================

    private User getAuthenticatedCandidate(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private ResumeResponse toResumeResponse(Resume resume) {

        return ResumeResponse.builder().resumeId(resume.getId()).fileName(resume.getOriginalFileName())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .processingStatus(resume.getProcessingStatus().name())
                .storageUrl(resume.getStorageUrl())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

    // =========================================================
    // FILE VALIDATION
    // =========================================================

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException("Resume file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException("Resume file size must not exceed 10 MB");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {

            throw new IllegalArgumentException("Resume file name is required");
        }

        String extension = getFileExtension(fileName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {

            throw new IllegalArgumentException("Only PDF, JPG, JPEG, TXT and DOCX files are supported");
        }
    }

    // =========================================================
    // GET FILE EXTENSION
    // =========================================================

    private String getFileExtension(String fileName) {

        int lastDot = fileName.lastIndexOf('.');

        if (lastDot == -1 || lastDot == fileName.length() - 1) {

            return "";
        }

        return fileName.substring(lastDot + 1).toLowerCase();
    }

    // =========================================================
    // SHA-256 HASH
    // =========================================================

    private String calculateSha256(byte[] data) {

        try {

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(data);

            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {

                hexString.append(String.format("%02x", b));
            }

            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}