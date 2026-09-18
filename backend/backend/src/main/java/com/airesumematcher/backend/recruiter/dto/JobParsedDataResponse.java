package com.airesumematcher.backend.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class JobParsedDataResponse {

    private Long jobId;

    private String parserVersion;

    private String parsedJson;
}