package com.airesumematcher.backend.recruiter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "job_parsed_data",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_job_parsed_data_job_id",
                        columnNames = "job_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_job_parsed_data_job_id",
                        columnList = "job_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobParsedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "job_id",
            nullable = false,
            unique = true
    )
    private Job job;

    @Column(
            name = "parsed_json",
            nullable = false,
            columnDefinition = "jsonb"
    )
    private String parsedJson;

    @Column(
            name = "parser_version",
            length = 50
    )
    private String parserVersion;

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