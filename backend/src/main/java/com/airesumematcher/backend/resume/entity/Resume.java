package com.airesumematcher.backend.resume.entity;

import com.airesumematcher.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "resumes",
        indexes = {
                @Index(name = "idx_resumes_candidate_id", columnList = "candidate_id"),
                @Index(name = "idx_resumes_processing_status", columnList = "processing_status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "storage_object_name", length = 500)
    private String storageObjectName;

    @Column(name = "storage_url", length = 2000)
    private String storageUrl;

    @Column(name = "file_type", nullable = false, length = 20)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_hash", length = 64)
    private String fileHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 20)
    @Builder.Default
    private ProcessingStatus processingStatus = ProcessingStatus.UPLOADED;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}