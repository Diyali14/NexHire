package com.airesumematcher.backend.candidate.service;

import com.airesumematcher.backend.ai.service.AiInterviewQuestionService;
import com.airesumematcher.backend.ai.service.AiSkillGapService;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.application.service.MatcherPayloadService;
import com.airesumematcher.backend.candidate.entity.InterviewQuestion;
import com.airesumematcher.backend.candidate.entity.SkillGapResult;
import com.airesumematcher.backend.candidate.repository.InterviewQuestionRepository;
import com.airesumematcher.backend.candidate.repository.SkillGapResultRepository;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.entity.JobParsedData;
import com.airesumematcher.backend.recruiter.entity.JobProcessingStatus;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CandidateAiService {

    private final JobRepository jobRepository;
    private final JobParsedDataRepository jobParsedDataRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeParsedDataRepository resumeParsedDataRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    private final InterviewQuestionRepository interviewQuestionRepository;
    private final SkillGapResultRepository skillGapResultRepository;

    private final AiInterviewQuestionService aiInterviewQuestionService;
    private final AiSkillGapService aiSkillGapService;
    private final MatcherPayloadService matcherPayloadService;
    private final ObjectMapper objectMapper;

    @Transactional
    public JsonNode generateInterviewQuestions(Long jobId, Authentication authentication) {
        User candidate = getAuthenticatedCandidate(authentication);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (job.getProcessingStatus() != JobProcessingStatus.COMPLETED) {
            throw new IllegalStateException("Job is not ready for interview question generation");
        }

        JobParsedData jobParsedData = jobParsedDataRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalStateException("Parsed job requirements not found"));

        // Call AI endpoint with exact parsed JD JSON
        String rawResponse = aiInterviewQuestionService.generateInterviewQuestions(jobParsedData.getParsedJson());

        JsonNode responseNode;
        try {
            responseNode = objectMapper.readTree(rawResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse interview questions response", e);
        }

        Integer totalQuestions = responseNode.path("totalQuestions").asInt(0);

        Optional<JobApplication> appOpt = jobApplicationRepository.findByJobIdAndCandidateId(jobId, candidate.getId());
        Long applicationId = appOpt.map(JobApplication::getId).orElse(null);

        InterviewQuestion record = InterviewQuestion.builder()
                .candidate(candidate)
                .job(job)
                .applicationId(applicationId)
                .rawResponse(rawResponse)
                .totalQuestions(totalQuestions)
                .build();

        interviewQuestionRepository.save(record);

        return responseNode;
    }

    @Transactional(readOnly = true)
    public JsonNode getInterviewQuestions(Long jobId, Authentication authentication) {
        User candidate = getAuthenticatedCandidate(authentication);

        InterviewQuestion record = interviewQuestionRepository
                .findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(candidate.getId(), jobId)
                .orElseThrow(() -> new IllegalArgumentException("Interview questions not found for this job"));

        try {
            return objectMapper.readTree(record.getRawResponse());
        } catch (Exception e) {
            throw new RuntimeException("Stored interview questions JSON is invalid", e);
        }
    }

    @Transactional
    public JsonNode analyzeSkillGap(Long jobId, Long resumeId, Authentication authentication) {
        User candidate = getAuthenticatedCandidate(authentication);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (job.getProcessingStatus() != JobProcessingStatus.COMPLETED) {
            throw new IllegalStateException("Job is not ready for skill gap analysis");
        }

        JobParsedData jobParsedData = jobParsedDataRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalStateException("Parsed job requirements not found"));

        // If resumeId not supplied, try to find from existing application or latest candidate resume
        Long targetResumeId = resumeId;
        if (targetResumeId == null) {
            Optional<JobApplication> appOpt = jobApplicationRepository.findByJobIdAndCandidateId(jobId, candidate.getId());
            if (appOpt.isPresent()) {
                targetResumeId = appOpt.get().getResume().getId();
            } else {
                List<Resume> resumes = resumeRepository.findAllByCandidateIdOrderByCreatedAtDesc(candidate.getId());
                if (resumes.isEmpty()) {
                    throw new IllegalArgumentException("No resume found for candidate. Please upload a resume first.");
                }
                targetResumeId = resumes.get(0).getId();
            }
        }

        Resume resume = resumeRepository.findByIdAndCandidateId(targetResumeId, candidate.getId())
                .orElseThrow(() -> new IllegalArgumentException("Resume not found or unauthorized"));

        ResumeParsedData resumeParsedData = resumeParsedDataRepository.findByResumeId(resume.getId())
                .orElseThrow(() -> new IllegalStateException("Parsed resume data not available"));

        // Build exact request payload: { "candidate": EXACT_RESUME_PARSER_RESPONSE, "jobRequirements": EXACT_JD_PARSER_RESPONSE }
        String payloadJson = matcherPayloadService.buildPayload(resumeParsedData, jobParsedData);

        String rawResponse = aiSkillGapService.analyzeSkillGap(payloadJson);

        JsonNode responseNode;
        try {
            responseNode = objectMapper.readTree(rawResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse skill gap analysis response", e);
        }

        Boolean hasGap = responseNode.has("hasGap") ? responseNode.path("hasGap").asBoolean() : null;
        Boolean experienceMet = responseNode.has("experienceMet") ? responseNode.path("experienceMet").asBoolean() : null;

        Optional<JobApplication> appOpt = jobApplicationRepository.findByJobIdAndCandidateId(jobId, candidate.getId());
        Long applicationId = appOpt.map(JobApplication::getId).orElse(null);

        SkillGapResult resultRecord = SkillGapResult.builder()
                .candidate(candidate)
                .job(job)
                .resume(resume)
                .applicationId(applicationId)
                .rawResponse(rawResponse)
                .hasGap(hasGap)
                .experienceMet(experienceMet)
                .build();

        skillGapResultRepository.save(resultRecord);

        return responseNode;
    }

    @Transactional(readOnly = true)
    public JsonNode getSkillGap(Long jobId, Authentication authentication) {
        User candidate = getAuthenticatedCandidate(authentication);

        SkillGapResult record = skillGapResultRepository
                .findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(candidate.getId(), jobId)
                .orElseThrow(() -> new IllegalArgumentException("Skill gap analysis not found for this job"));

        try {
            return objectMapper.readTree(record.getRawResponse());
        } catch (Exception e) {
            throw new RuntimeException("Stored skill gap JSON is invalid", e);
        }
    }

    private User getAuthenticatedCandidate(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated candidate not found"));
    }
}
