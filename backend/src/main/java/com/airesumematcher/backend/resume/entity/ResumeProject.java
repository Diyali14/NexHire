package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "resume_projects",
        indexes = {
                @Index(
                        name = "idx_resume_projects_parsed_data_id",
                        columnList = "resume_parsed_data_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_parsed_data_id", nullable = false)
    private ResumeParsedData parsedData;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}