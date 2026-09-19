package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(
        name = "resume_experience",
        indexes = {
                @Index(
                        name = "idx_resume_experience_parsed_data_id",
                        columnList = "resume_parsed_data_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "resume_parsed_data_id",
            nullable = false
    )
    private ResumeParsedData parsedData;

    @Column(name = "company")
    private String company;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "location")
    private String location;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "responsibilities",
            columnDefinition = "jsonb"
    )
    private String responsibilities;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "technologies",
            columnDefinition = "jsonb"
    )
    private String technologies;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "additional_information",
            columnDefinition = "jsonb"
    )
    private String additionalInformation;
}