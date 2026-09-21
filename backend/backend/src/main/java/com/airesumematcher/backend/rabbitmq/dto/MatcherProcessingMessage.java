package com.airesumematcher.backend.rabbitmq.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatcherProcessingMessage {

    private Long applicationId;

    private Long jobId;

    private Long candidateId;

    private Long resumeId;
}