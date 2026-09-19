package com.airesumematcher.backend.recruiter.service;

import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class JobParsedDataService {

    private final JobRepository jobRepository;
    private final JobParsedDataRepository jobParsedDataRepository;
    private final ObjectMapper objectMapper;

    public JobParsedDataService(
            JobRepository jobRepository,
            JobParsedDataRepository jobParsedDataRepository,
            ObjectMapper objectMapper
    ) {
        this.jobRepository = jobRepository;
        this.jobParsedDataRepository =
                jobParsedDataRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public JobParsedData saveParsedData(
            Long jobId,
            String parsedJson,
            String parserVersion
    ) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        if (parsedJson == null || parsedJson.isBlank()) {
            throw new IllegalArgumentException(
                    "Parsed job data cannot be empty"
            );
        }

        validateJson(parsedJson);

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        JobParsedData parsedData =
                jobParsedDataRepository
                        .findByJobId(jobId)
                        .orElseGet(() ->
                                JobParsedData.builder()
                                        .job(job)
                                        .build()
                        );

        parsedData.setParsedJson(parsedJson);
        parsedData.setParserVersion(parserVersion);

        return jobParsedDataRepository.save(
                parsedData
        );
    }

    private void validateJson(String parsedJson) {

        try {

            JsonNode jsonNode =
                    objectMapper.readTree(parsedJson);

            if (jsonNode == null || !jsonNode.isObject()) {
                throw new IllegalArgumentException(
                        "Parsed job data must be a JSON object"
                );
            }

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid JSON returned by job parser",
                    e
            );
        }
    }
}