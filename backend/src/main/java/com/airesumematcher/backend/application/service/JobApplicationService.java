package com.airesumematcher.backend.application.service;

import com.airesumematcher.backend.application.dto.JobApplicationRequest;
import com.airesumematcher.backend.application.entity.JobApplication;
import com.airesumematcher.backend.application.entity.JobApplicationStatus;
import com.airesumematcher.backend.application.repository.JobApplicationRepository;
import com.airesumematcher.backend.rabbitmq.dto.MatcherProcessingMessage;
import com.airesumematcher.backend.rabbitmq.service.MatcherMessageProducer;
import com.airesumematcher.backend.recruiter.entity.Job;
import com.airesumematcher.backend.recruiter.repository.JobParsedDataRepository;
import com.airesumematcher.backend.recruiter.repository.JobRepository;
import com.airesumematcher.backend.resume.entity.ProcessingStatus;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.user.entity.User;
import com.airesumematcher.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;

    private final JobRepository jobRepository;

    private final ResumeRepository resumeRepository;

    private final ResumeParsedDataRepository resumeParsedDataRepository;

    private final JobParsedDataRepository jobParsedDataRepository;

    private final UserRepository userRepository;

    private final MatcherMessageProducer matcherMessageProducer;

    @Transactional
    public JobApplication createApplication(Long jobId, JobApplicationRequest request, Authentication authentication) {

        User candidate = getAuthenticatedCandidate(authentication);

        // =====================================================
        // 1. GET JOB
        // =====================================================

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        // =====================================================
        // 2. JOB MUST HAVE PARSED DATA
        // =====================================================

        if (!jobParsedDataRepository.existsByJobId(jobId)) {

            throw new IllegalStateException("This job is not ready for applications yet");
        }

        // =====================================================
        // 3. PREVENT DUPLICATE APPLICATION
        // =====================================================

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {

            throw new IllegalStateException("You have already applied for this job");
        }

        // =====================================================
        // 4. GET CANDIDATE'S RESUME
        // =====================================================

        Resume resume = resumeRepository.findByIdAndCandidateId(request.getResumeId(), candidate.getId())
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // =====================================================
        // 5. RESUME MUST BE COMPLETELY PROCESSED
        // =====================================================

        if (resume.getProcessingStatus() != ProcessingStatus.COMPLETED) {

            throw new IllegalStateException("Selected resume has not finished processing yet");
        }

        if (!resumeParsedDataRepository.existsByResumeId(resume.getId())) {

            throw new IllegalStateException("Parsed resume data is not available yet");
        }

        // =====================================================
        // 6. CREATE APPLICATION
        // =====================================================

        JobApplication application = JobApplication.builder().job(job).candidate(candidate).resume(resume).status(JobApplicationStatus.MATCHING_PENDING).build();

        application = applicationRepository.saveAndFlush(application);

        // =====================================================
        // 7. SEND ONLY IDS TO RABBITMQ
        // =====================================================

        matcherMessageProducer.publish(MatcherProcessingMessage.builder().applicationId(application.getId()).jobId(job.getId()).candidateId(candidate.getId()).resumeId(resume.getId()).build());

        return application;
    }

    private User getAuthenticatedCandidate(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException(
                "Authenticated candidate not found"));
    }
}