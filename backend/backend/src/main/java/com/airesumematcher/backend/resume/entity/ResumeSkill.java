package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "resume_skills",
        indexes = {
                @Index(
                        name = "idx_resume_skills_parsed_data_id",
                        columnList = "resume_parsed_data_id"
                ),
                @Index(
                        name = "idx_resume_skills_normalized_name",
                        columnList = "normalized_name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "resume_parsed_data_id",
            nullable = false
    )
    private ResumeParsedData parsedData;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "normalized_name")
    private String normalizedName;

    @Column(name = "confidence")
    private Double confidence;
}