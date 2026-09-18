package com.airesumematcher.backend.resume.service;

import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class ResumeParsedDataService {

    private final ResumeRepository resumeRepository;
    private final ResumeParsedDataRepository resumeParsedDataRepository;
    private final ObjectMapper objectMapper;

    public ResumeParsedDataService(
            ResumeRepository resumeRepository,
            ResumeParsedDataRepository resumeParsedDataRepository,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.resumeParsedDataRepository =
                resumeParsedDataRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ResumeParsedData saveParsedData(
            Long resumeId,
            String parsedJson,
            String parserVersion
    ) {

        if (resumeId == null) {
            throw new IllegalArgumentException(
                    "Resume ID is required"
            );
        }

        if (parsedJson == null || parsedJson.isBlank()) {
            throw new IllegalArgumentException(
                    "Parsed resume data cannot be empty"
            );
        }

        validateJson(parsedJson);

        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );

        ResumeParsedData parsedData =
                resumeParsedDataRepository
                        .findByResumeId(resumeId)
                        .orElseGet(() ->
                                ResumeParsedData.builder()
                                        .resume(resume)
                                        .build()
                        );

        parsedData.setParsedJson(parsedJson);
        parsedData.setParserVersion(parserVersion);

        return resumeParsedDataRepository.save(
                parsedData
        );
    }

    private void validateJson(String parsedJson) {

        try {

            JsonNode jsonNode =
                    objectMapper.readTree(parsedJson);

            if (jsonNode == null || !jsonNode.isObject()) {
                throw new IllegalArgumentException(
                        "Parsed resume data must be a JSON object"
                );
            }

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid JSON returned by resume parser",
                    e
            );
        }
    }
}