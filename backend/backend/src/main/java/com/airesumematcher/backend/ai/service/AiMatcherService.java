package com.airesumematcher.backend.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiMatcherService {

    private final RestClient restClient;

    public AiMatcherService(
            @Value("${ai.matcher.base-url}") String baseUrl
    ) {
        this.restClient =
                RestClient.builder()
                        .baseUrl(baseUrl)
                        .build();
    }

    public String match(
            String requestJson
    ) {

        return restClient.post()
                .uri("/ai/v1/match")
                .contentType(
                        MediaType.APPLICATION_JSON
                )
                .body(requestJson)
                .retrieve()
                .body(String.class);
    }
}

//package com.airesumematcher.backend.ai.service;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestClient;
//
//@Service
//@RequiredArgsConstructor
//public class AiMatcherService {
//
//    @Value("${ai.matcher.base-url}")
//    private String matcherBaseUrl;
//
//    private final RestClient.Builder restClientBuilder;
//
//    public String match(String payload) {
//
//        RestClient restClient =
//                restClientBuilder
//                        .baseUrl(matcherBaseUrl)
//                        .build();
//
//        return restClient
//                .post()
//                .uri("/ai/v1/match")
//                .contentType(MediaType.APPLICATION_JSON)
//                .body(payload)
//                .retrieve()
//                .body(String.class);
//    }
//}