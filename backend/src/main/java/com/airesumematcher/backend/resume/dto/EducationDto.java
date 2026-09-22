// EducationDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationDto {

    private String degree;
    private String institution;
    private String end_year;
    private String grade;
}