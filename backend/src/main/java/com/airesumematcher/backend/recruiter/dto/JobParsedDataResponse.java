package com.airesumematcher.backend.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import com.fasterxml.jackson.databind.JsonNode;

@Getter
@Builder
@AllArgsConstructor
public class JobParsedDataResponse {

    private Long jobId;

    private String parserVersion;

    private Object parsedJson;
}