package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.application.dto.RecruiterApplicationResponse;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.candidate.entity.CandidateProfile;
import com.airesumematcher.backend.candidate.repository.CandidateProfileRepository;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.storage.service.CloudinaryStorageService;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecruiterApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ResumeParsedDataRepository resumeParsedDataRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final ObjectMapper objectMapper;

    public List<RecruiterApplicationResponse> getApplicationsForJob(Long jobId, Authentication authentication) {

        User recruiter = getAuthenticatedRecruiter(authentication);

        Job job = jobRepository.findByIdAndRecruiterId(jobId, recruiter.getId())
                .orElseThrow(() -> new RuntimeException("Job not found or you do not own this job"));

        List<JobApplication> applications = applicationRepository.findAllByJobIdOrderByOverallScoreDescCreatedAtAsc(jobId);

        List<RecruiterApplicationResponse> response = new ArrayList<>();
        for (JobApplication application : applications) {

            response.add(buildResponse(application));
        }

        return response;
    }

    public Map<String, Object> getApplicationDetails(Long jobId, Long applicationId, Authentication authentication) {

        User recruiter = getAuthenticatedRecruiter(authentication);

        Job job = jobRepository.findByIdAndRecruiterId(jobId, recruiter.getId())
                .orElseThrow(() -> new RuntimeException("Job not found or you do not own this job"));

        JobApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getId().equals(job.getId())) {

            throw new RuntimeException("Application does not belong to this job");
        }

        User candidateUser = application.getCandidate();
        Optional<CandidateProfile> profileOpt = candidateProfileRepository.findByUserId(candidateUser.getId());
        Optional<ResumeParsedData> parsedResumeOpt = resumeParsedDataRepository.findByResumeId(application.getResume().getId());

        JsonNode parsedResumeJson = null;
        if (parsedResumeOpt.isPresent()) {
            try {
                parsedResumeJson = objectMapper.readTree(parsedResumeOpt.get().getParsedJson());
            } catch (Exception ignored) {
            }
        }

        return Map.of("applicationSummary", buildResponse(application), "candidateProfile", profileOpt.isPresent() ? Map.of(
                        "linkedinUrl", profileOpt.get().getLinkedinUrl() != null ? profileOpt.get().getLinkedinUrl() : "",
                        "githubUrl", profileOpt.get().getGithubUrl() != null ? profileOpt.get().getGithubUrl() : "",
                        "bio", profileOpt.get().getBio() != null ? profileOpt.get().getBio() : "") : Map.of(),
                "parsedResume", parsedResumeJson != null ? parsedResumeJson : Map.of()
        );
    }

    public Map<String, Object> downloadCandidateResume(Long applicationId, Authentication authentication) {
        User recruiter = getAuthenticatedRecruiter(authentication);

        JobApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));

        // Authorization check: recruiter MUST own the job for this application
        Job job = application.getJob();
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {

            throw new RuntimeException("Forbidden: You do not own the job for this application");
        }

        Resume resume = application.getResume();
        if (resume == null || resume.getStorageUrl() == null) {

            throw new RuntimeException("Resume file not found for this application");
        }

        byte[] fileBytes = cloudinaryStorageService.downloadFile(resume.getStorageObjectName());

        return Map.of(
                "fileName", resume.getOriginalFileName(),
                "fileType", resume.getFileType(),
                "fileBytes", fileBytes,
                "storageUrl", resume.getStorageUrl()
        );
    }

    private User getAuthenticatedRecruiter(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Authenticated recruiter not found"));
    }

    private RecruiterApplicationResponse buildResponse(JobApplication application) {

        JsonNode matcherResult = null;

        if (application.getMatcherResult() != null && !application.getMatcherResult().isBlank()) {
            try {
                matcherResult = objectMapper.readTree(application.getMatcherResult());

                while (matcherResult != null && matcherResult.isTextual()) {

                    matcherResult = objectMapper.readTree(matcherResult.asText());
                }
            } catch (Exception ignored) {
            }
        }

        JsonNode matchedSkillsNode = matcherResult != null ? matcherResult.path("matchedSkills") : null;
        JsonNode missingSkillsNode = matcherResult != null ? matcherResult.path("missingSkills") : null;

        Object matchedSkills = null;
        if (matchedSkillsNode != null && !matchedSkillsNode.isMissingNode()) {
            try {

                matchedSkills = objectMapper.treeToValue(matchedSkillsNode, Object.class);
            } catch (Exception ignored) {
            }
        }

        Object missingSkills = null;
        if (missingSkillsNode != null && !missingSkillsNode.isMissingNode()) {
            try {
                missingSkills = objectMapper.treeToValue(missingSkillsNode, Object.class);
            } catch (Exception ignored) {
            }
        }

        Object matcherResultObj = null;
        if (matcherResult != null && !matcherResult.isMissingNode()) {
            try {
                matcherResultObj = objectMapper.treeToValue(matcherResult, Object.class);
            } catch (Exception ignored) {
            }
        }

        Boolean experienceMet = null;
        if (matcherResult != null && matcherResult.has("experienceMet")) {

            experienceMet = matcherResult.path("experienceMet").asBoolean();
        }

        Boolean educationMet = null;
        if (matcherResult != null && matcherResult.has("educationMet")) {

            educationMet = matcherResult.path("educationMet").asBoolean();
        }

        String summary = matcherResult != null && matcherResult.hasNonNull("summary") ? matcherResult.get("summary").asText() : null;

        User candidate = application.getCandidate();
        String candidateName = buildCandidateName(candidate);

        String resumeFileName = null;
        String resumeUrl = null;

        if (application.getResume() != null) {
            resumeFileName = application.getResume().getOriginalFileName();
            resumeUrl = application.getResume().getStorageUrl();
        }

        return RecruiterApplicationResponse.builder()
                .applicationId(application.getId())
                .candidateId(candidate.getId())
                .resumeId(application.getResume() != null ? application.getResume()
                        .getId() : null)
                .candidateName(candidateName)
                .candidateEmail(candidate.getEmail())
                .candidatePhone(candidate.getPhone())
                .resumeFileName(resumeFileName).resumeUrl(resumeUrl)
                .status(application.getStatus().name())
                .overallScore(application.getOverallScore())
                .matcherVersion(application.getMatcherVersion())
                .experienceMet(experienceMet)
                .educationMet(educationMet)
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .summary(summary)
                .matcherResult(matcherResultObj)
                .build();
    }

    private String buildCandidateName(User candidate) {

        String firstName = candidate.getFirstName() != null ? candidate.getFirstName() : "";
        String lastName = candidate.getLastName() != null ? candidate.getLastName() : "";
        String fullName = (firstName + " " + lastName).trim();

        return fullName.isBlank() ? candidate.getEmail() : fullName;
    }
}