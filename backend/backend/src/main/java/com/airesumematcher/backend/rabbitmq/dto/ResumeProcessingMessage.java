package com.airesumematcher.backend.rabbitmq.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeProcessingMessage {

    private Long resumeId;

    private Long candidateId;

    private String storageObjectName;

    private String storageUrl;

    private String fileType;
}
