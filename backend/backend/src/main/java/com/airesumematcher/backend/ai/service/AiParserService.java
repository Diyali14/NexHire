package com.airesumematcher.backend.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class AiParserService {

    private final RestClient restClient;

    public AiParserService(
            @Value("${ai.parser.base-url}") String baseUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String parseResume(
            byte[] pdfBytes,
            String fileName
    ) {

        ByteArrayResource fileResource =
                new ByteArrayResource(pdfBytes) {

                    @Override
                    public String getFilename() {
                        return fileName;
                    }
                };

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("file", fileResource);

        return restClient.post()
                .uri("/ai/v1/parse-resume-file")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
    }
}