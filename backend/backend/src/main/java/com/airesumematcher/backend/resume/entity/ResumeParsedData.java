package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "resume_parsed_data",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_resume_parsed_data_resume_id",
                        columnNames = "resume_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_resume_parsed_data_resume_id",
                        columnList = "resume_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeParsedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false, unique = true)
    private Resume resume;

    // =========================================================
    // COMPLETE ORIGINAL PARSER RESPONSE
    // =========================================================

    @JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "parsed_json", nullable = false, columnDefinition = "jsonb")
    private String parsedJson;

    // =========================================================
    // EXTRACTED PROFILE DATA
    // =========================================================

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "language")
    private String language;

    @Column(name = "certifications")
    private String certifications;

    // =========================================================
    // PARSER INFORMATION
    // =========================================================

    @Column(name = "parser_version", length = 50)
    private String parserVersion;

    // =========================================================
    // TIMESTAMPS
    // =========================================================

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