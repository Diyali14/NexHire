package com.airesumematcher.backend.application.dto;

import com.airesumematcher.backend.application.dto.CandidateMatcherDto;
import com.airesumematcher.backend.application.dto.JobRequirementsMatcherDto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatcherRequestDto {

    private CandidateMatcherDto candidate;

    private JobRequirementsMatcherDto jobRequirements;
}

