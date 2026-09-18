package com.airesumematcher.backend.resume.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "resume_links",
        indexes = {
                @Index(
                        name = "idx_resume_links_parsed_data_id",
                        columnList = "resume_parsed_data_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "resume_parsed_data_id",
            nullable = false,
            unique = true
    )
    private ResumeParsedData parsedData;

    @Column(name = "linkedin")
    private String linkedin;

    @Column(name = "website")
    private String website;
}