package com.airesumematcher.backend.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ResumeParsedDataResponse {

    private Long resumeId;

    private String parserVersion;

    private String parsedJson;
}