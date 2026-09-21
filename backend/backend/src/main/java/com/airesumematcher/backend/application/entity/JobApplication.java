package com.airesumematcher.backend.application.entity;

import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "job_applications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_job_application_job_candidate",
                        columnNames = {
                                "job_id",
                                "candidate_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_job_applications_job_id",
                        columnList = "job_id"
                ),
                @Index(
                        name = "idx_job_applications_candidate_id",
                        columnList = "candidate_id"
                ),
                @Index(
                        name = "idx_job_applications_job_score",
                        columnList = "job_id, overall_score"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private JobApplicationStatus status = JobApplicationStatus.MATCHING_PENDING;

    @Column(name = "overall_score")
    private Integer overallScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matcher_result", columnDefinition = "jsonb")
    private String matcherResult;

    @Column(name = "matcher_version", length = 100)
    private String matcherVersion;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

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