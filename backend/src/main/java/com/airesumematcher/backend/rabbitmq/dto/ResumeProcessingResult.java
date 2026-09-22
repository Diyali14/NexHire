package com.airesumematcher.backend.rabbitmq.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeProcessingResult {

    private Long resumeId;

    private Long candidateId;

    private String status;

    private String parserVersion;

    private String parsedJson;

    private String errorMessage;
}

