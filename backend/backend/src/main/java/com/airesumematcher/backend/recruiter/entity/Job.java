package com.airesumematcher.backend.recruiter.entity;

import com.airesumematcher.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "jobs",
        indexes = {
                @Index(
                        name = "idx_jobs_recruiter_id",
                        columnList = "recruiter_id"
                ),
                @Index(
                        name = "idx_jobs_processing_status",
                        columnList = "processing_status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "recruiter_id",
            nullable = false
    )
    private User recruiter;

    @Column(
            name = "job_title",
            nullable = false,
            length = 255
    )
    private String jobTitle;

    @Column(
            name = "job_description",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String jobDescription;



    @Enumerated(EnumType.STRING)
    @Column(
            name = "processing_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private JobProcessingStatus processingStatus = JobProcessingStatus.STORED;

    @Column(
            name = "created_at",
            nullable = false
    )
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(
            name = "updated_at",
            nullable = false
    )
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}