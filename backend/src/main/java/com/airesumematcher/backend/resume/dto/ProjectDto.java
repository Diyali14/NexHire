// ProjectDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {

    private String name;
    private String description;
}
