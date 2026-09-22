// ExperienceDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDto {

    private String company;
    private String job_title;
    private String location;
    private ArrayList<String> responsibilities;
    private ArrayList<String> technologies;
    private ArrayList<Object> additional_information;
    private String start_date;
    private String end_date;
}