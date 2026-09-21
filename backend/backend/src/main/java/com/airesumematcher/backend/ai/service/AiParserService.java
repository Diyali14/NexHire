package com.airesumematcher.backend.ai.service;

import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
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

    // ===============================
    // RESUME PARSER
    // ===============================

    public ParsedResumeDto parseResume(
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

         ParsedResumeDto obj=restClient.post()
                .uri("/ai/v1/parse-resume-file")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(ParsedResumeDto.class);
        System.out.println(obj);
        return obj;
    }


    // ===============================
    // JOB DESCRIPTION PARSER
    // ===============================

    public String analyzeJobDescription(
            String jobDescription
    ) {

        return restClient.post()
                .uri("/ai/v1/analyze-jd")
                .contentType(MediaType.TEXT_PLAIN)
                .body(jobDescription)
                .retrieve()
                .body(String.class);
    }
}