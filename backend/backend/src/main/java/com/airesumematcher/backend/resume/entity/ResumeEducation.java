package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "resume_education",
        indexes = {
                @Index(
                        name = "idx_resume_education_parsed_data_id",
                        columnList = "resume_parsed_data_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "resume_parsed_data_id",
            nullable = false
    )
    private ResumeParsedData parsedData;

    @Column(name = "degree")
    private String degree;

    @Column(name = "institution")
    private String institution;

    @Column(name = "end_year")
    private String endYear;

    @Column(name = "grade")
    private String grade;
}