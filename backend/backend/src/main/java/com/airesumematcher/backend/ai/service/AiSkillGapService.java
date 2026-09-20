package com.airesumematcher.backend.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiSkillGapService {

    private final RestClient restClient;

    public AiSkillGapService(
            @Value("${ai.skillgap.base-url:${AI_PARSER_BASE_URL:https://apex-local-2-0.onrender.com}}") String baseUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String analyzeSkillGap(String requestPayloadJson) {
        return restClient.post()
                .uri("/ai/v1/skill-gap")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestPayloadJson)
                .retrieve()
                .body(String.class);
    }
}
