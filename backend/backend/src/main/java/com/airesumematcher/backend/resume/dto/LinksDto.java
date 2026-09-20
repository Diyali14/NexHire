// LinksDto.java
package com.airesumematcher.backend.resume.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinksDto {

    private String linkedin;
    private String website;
}