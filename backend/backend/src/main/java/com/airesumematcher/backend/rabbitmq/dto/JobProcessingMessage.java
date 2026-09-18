package com.airesumematcher.backend.rabbitmq.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobProcessingMessage {

    private Long jobId;

    private Long recruiterId;

    private String storageObjectName;

    private String storageUrl;
}