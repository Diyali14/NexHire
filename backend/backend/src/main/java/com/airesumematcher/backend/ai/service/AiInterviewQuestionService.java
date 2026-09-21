package com.airesumematcher.backend.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiInterviewQuestionService {

    private final RestClient restClient;

    public AiInterviewQuestionService(@Value("${ai.interview.base-url:${AI_PARSER_BASE_URL:https://apex-local-2-0.onrender.com}}") String baseUrl) {

        this.restClient = RestClient.builder().baseUrl(baseUrl).build();

    }

    public String generateInterviewQuestions(String exactParsedJdJson) {

        return restClient.post().uri("/ai/v1/interview-questions").contentType(MediaType.APPLICATION_JSON)
                .body(exactParsedJdJson).retrieve().body(String.class);

    }
}
