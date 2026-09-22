package com.airesumematcher.backend.candidate.service;

import com.airesumematcher.backend.candidate.dto.CandidateJobResponse;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.entity.RecruiterProfile;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.recruiter.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CandidateJobService {

    private final JobRepository jobRepository;
    private final JobParsedDataRepository jobParsedDataRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<CandidateJobResponse> getAvailableJobs(String query, String sortBy) {

        List<Job> jobs = jobRepository.findAllByProcessingStatusOrderByCreatedAtDesc(JobProcessingStatus.COMPLETED);

        List<CandidateJobResponse> responses = jobs.stream().map(this::toResponse).filter(resp -> {
                    if (query == null || query.isBlank()) {
                        return true;
                    }

                    String q = query.toLowerCase().trim();
                    boolean matchTitle = resp.getJobTitle() != null && resp.getJobTitle().toLowerCase().contains(q);
                    boolean matchDesc = resp.getJobDescription() != null && resp.getJobDescription().toLowerCase().contains(q);
                    boolean matchSkills = resp.getSkills() != null && resp.getSkills().toString().toLowerCase().contains(q);
                    return matchTitle || matchDesc || matchSkills;
                }).toList();

        if ("title".equalsIgnoreCase(sortBy)) {

            return responses.stream().sorted(Comparator.comparing(CandidateJobResponse::getJobTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))).toList();
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public CandidateJobResponse getJobDetails(Long jobId) {

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (job.getProcessingStatus() != JobProcessingStatus.COMPLETED) {

            throw new IllegalArgumentException("This job is not available to candidates yet");
        }

        return toResponse(job);
    }

    private CandidateJobResponse toResponse(Job job) {

        String companyName = null;

        if (job.getRecruiter() != null) {
            Optional<RecruiterProfile> recruiterProfile = recruiterProfileRepository.findByUserId(job.getRecruiter().getId());
            if (recruiterProfile.isPresent()) {

                companyName = recruiterProfile.get().getCompanyName();
            }
        }

        String experienceRequired = null;
        String educationRequired = null;
        JsonNode skills = null;
        JsonNode parsedJsonNode = null;

        Optional<JobParsedData> parsedDataOpt = jobParsedDataRepository.findByJobId(job.getId());
        if (parsedDataOpt.isPresent()) {
            try {
                parsedJsonNode = objectMapper.readTree(parsedDataOpt.get().getParsedJson());
                experienceRequired = parsedJsonNode.hasNonNull("experienceRequired") ? parsedJsonNode.get("experienceRequired").asText() : null;
                educationRequired = parsedJsonNode.hasNonNull("educationRequired") ? parsedJsonNode.get("educationRequired").asText() : null;
                skills = parsedJsonNode.path("skills");
            } catch (Exception ignored) {
            }
        }

        return CandidateJobResponse.builder().jobId(job.getId()).jobTitle(job.getJobTitle())
                .companyName(companyName).jobDescription(job.getJobDescription()).experienceRequired(experienceRequired)
                .educationRequired(educationRequired).skills(skills).parsedRequirements(parsedJsonNode)
                .processingStatus(job.getProcessingStatus().name()).createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt()).build();
    }
}