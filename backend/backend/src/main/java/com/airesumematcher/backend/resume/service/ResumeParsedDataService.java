package com.airesumematcher.backend.resume.service;

import com.airesumematcher.backend.resume.dto.ParsedResumeDto;
import com.airesumematcher.backend.resume.dto.ResumeParsedDataResponse;
import com.airesumematcher.backend.resume.entity.Resume;
import com.airesumematcher.backend.resume.entity.ResumeEducation;
import com.airesumematcher.backend.resume.entity.ResumeExperience;
import com.airesumematcher.backend.resume.entity.ResumeLink;
import com.airesumematcher.backend.resume.entity.ResumeParsedData;
import com.airesumematcher.backend.resume.entity.ResumeProject;
import com.airesumematcher.backend.resume.entity.ResumeSkill;
import com.airesumematcher.backend.resume.repository.ResumeEducationRepository;
import com.airesumematcher.backend.resume.repository.ResumeExperienceRepository;
import com.airesumematcher.backend.resume.repository.ResumeLinkRepository;
import com.airesumematcher.backend.resume.repository.ResumeParsedDataRepository;
import com.airesumematcher.backend.resume.repository.ResumeProjectRepository;
import com.airesumematcher.backend.resume.repository.ResumeRepository;
import com.airesumematcher.backend.resume.repository.ResumeSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//point of breakage
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
//point of breakage

import java.util.ArrayList;
import java.util.List;

@Service
public class ResumeParsedDataService {

    private final ResumeRepository resumeRepository;
    private final ResumeParsedDataRepository resumeParsedDataRepository;
    private final ResumeSkillRepository resumeSkillRepository;
    private final ResumeEducationRepository resumeEducationRepository;
    private final ResumeExperienceRepository resumeExperienceRepository;
    private final ResumeProjectRepository resumeProjectRepository;
    private final ResumeLinkRepository resumeLinkRepository;
    private final ObjectMapper objectMapper;

    public ResumeParsedDataService(ResumeRepository resumeRepository, ResumeParsedDataRepository resumeParsedDataRepository,
            ResumeSkillRepository resumeSkillRepository, ResumeEducationRepository resumeEducationRepository,
            ResumeExperienceRepository resumeExperienceRepository, ResumeProjectRepository resumeProjectRepository,
            ResumeLinkRepository resumeLinkRepository, ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.resumeParsedDataRepository = resumeParsedDataRepository;
        this.resumeSkillRepository = resumeSkillRepository;
        this.resumeEducationRepository = resumeEducationRepository;
        this.resumeExperienceRepository = resumeExperienceRepository;
        this.resumeProjectRepository = resumeProjectRepository;
        this.resumeLinkRepository = resumeLinkRepository;
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // SAVE PARSED DATA
    // =========================================================

    @Transactional
    public ResumeParsedData saveParsedData(Long resumeId, String parsedJson, String parserVersion) {

        if (resumeId == null) {
            throw new IllegalArgumentException("Resume ID is required");
        }

        if (parsedJson == null || parsedJson.isBlank()) {
            throw new IllegalArgumentException("Parsed resume data cannot be empty");
        }

        JsonNode root = validateAndParseJson(parsedJson);

        JsonNode resumeNode = root.path("resume");

        if (resumeNode.isMissingNode() || !resumeNode.isObject()) {

            throw new IllegalArgumentException("Parser response does not contain a valid resume object");
        }

        Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));

        ResumeParsedData parsedData = resumeParsedDataRepository.findByResumeId(resumeId)
                .orElseGet(() -> ResumeParsedData.builder().resume(resume).build());

        try {
            parsedData.setParsedJson(objectMapper.writeValueAsString(root));
        } catch (Exception e) {
            parsedData.setParsedJson(root.toString());
        }

        parsedData.setParserVersion(parserVersion != null ? parserVersion : (root.hasNonNull("parserVersion") ? root.get("parserVersion").asText() : null));

        parsedData.setCandidateName(getText(resumeNode, "name"));

        parsedData.setEmail(getText(resumeNode, "email"));

        parsedData.setPhone(getText(resumeNode, "phone"));

        parsedData.setYearsOfExperience(
                getInteger(resumeNode, "years_of_experience"));

        parsedData.setLanguage(getText(root, "language"));

        parsedData.setCertifications(extractCertifications(resumeNode.path("certifications")));

        parsedData = resumeParsedDataRepository.save(parsedData);

        return parsedData;
    }

    @Transactional
    public ResumeParsedData saveParsedData(Long resumeId, ParsedResumeDto parsedDto) {
        try {
            String json = objectMapper.writeValueAsString(parsedDto);
            return saveParsedData(resumeId, json, parsedDto.getParserVersion());
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize ParsedResumeDto", e);
        }
    }
    // =========================================================
    // GET PARSED DATA
    // =========================================================

    @Transactional(readOnly = true)
    public ResumeParsedDataResponse getParsedData(Long resumeId, Long candidateId) {

        Resume resume = resumeRepository.findByIdAndCandidateId(resumeId, candidateId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));

        ResumeParsedData parsedData = resumeParsedDataRepository.findByResumeId(resume.getId())
                .orElseThrow(() -> new RuntimeException("Parsed resume data is not available yet"));

        /*
         * parsed_json is already JsonNode.
         * No need to parse it again.
         */
        JsonNode root;

        try {
            root = objectMapper.readTree(parsedData.getParsedJson());
        } catch (Exception e) {throw new RuntimeException("Stored parsed resume JSON is invalid",
                    e
            );
        }

        JsonNode resumeNode = root.path("resume");

        // =====================================================
        // PROFILE
        // =====================================================

        ResumeParsedDataResponse.Profile profile = ResumeParsedDataResponse.Profile.builder()
                .name(parsedData.getCandidateName())
                .email(parsedData.getEmail())
                .phone(parsedData.getPhone())
                .yearsOfExperience(parsedData.getYearsOfExperience())
                .language(parsedData.getLanguage())
                .build();

        // =====================================================
        // SKILLS
        // =====================================================

        List<ResumeParsedDataResponse.Skill> skills = new ArrayList<>();

        JsonNode skillsNode = resumeNode.path("skills");

        if (skillsNode.isArray()) {

            for (JsonNode skillNode : skillsNode) {skills.add(
                    ResumeParsedDataResponse.Skill.builder().name(getText(skillNode, "name"))
                                .normalizedName(getText(skillNode, "normalizedName"))
                                .confidence(getDouble(skillNode, "confidence"))
                                .build());
            }
        }

        // =====================================================
        // EDUCATION
        // =====================================================

        List<ResumeParsedDataResponse.Education> education = new ArrayList<>();

        JsonNode educationNode = resumeNode.path("education");

        if (educationNode.isArray()) {

            for (JsonNode educationItem : educationNode) {

                education.add(ResumeParsedDataResponse.Education
                                .builder()
                                .degree(getText(educationItem, "degree"))
                                .institution(getText(educationItem, "institution"))
                                .endYear(getText(educationItem, "end_year"))
                                .grade(getText(educationItem, "grade"))
                                .build()
                );
            }
        }

        // =====================================================
        // EXPERIENCE
        // =====================================================

        List<ResumeParsedDataResponse.Experience> experience = new ArrayList<>();

        JsonNode experienceNode = resumeNode.path("experience");

        if (experienceNode.isArray()) {

            for (JsonNode experienceItem : experienceNode) {

                experience.add(ResumeParsedDataResponse.Experience
                                .builder()
                                .company(getText(experienceItem, "company"))
                                .jobTitle(getText(experienceItem, "job_title"))
                                .location(getText(experienceItem, "location"))
                                .startDate(getText(experienceItem, "start_date"))
                                .endDate(getText(experienceItem, "end_date"))
                                .responsibilities(experienceItem.path("responsibilities"))
                                .technologies(experienceItem.path("technologies"))
                                .additionalInformation(experienceItem.path("additional_information"))
                        .build()
                );
            }
        }

        // =====================================================
        // PROJECTS
        // =====================================================

        List<ResumeParsedDataResponse.Project> projects = new ArrayList<>();

        JsonNode projectsNode = resumeNode.path("projects");

        if (projectsNode.isArray()) {

            for (JsonNode projectNode : projectsNode) {

                projects.add(ResumeParsedDataResponse.Project
                                .builder()
                                .name(getText(projectNode, "name"))
                                .description(getText(projectNode, "description"))
                                .build());
            }
        }

        // =====================================================
        // LINKS
        // =====================================================

        JsonNode linksNode = resumeNode.path("links");

        ResumeParsedDataResponse.Links links = ResumeParsedDataResponse.Links.builder()
                .linkedin(getText(linksNode, "linkedin"))
                .website(getText(linksNode, "website"))
                .build();

        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        Object parsedDataObject = null;
        if (root != null) {
            try {
                parsedDataObject = objectMapper.treeToValue(root, Object.class);
            } catch (Exception ignored) {
            }
        }

        return ResumeParsedDataResponse.builder()
                .resumeId(resume.getId())
                .candidateId(candidateId)
                .status(resume.getProcessingStatus().name())
                .parserVersion(parsedData.getParserVersion())
                .profile(profile)
                .skills(skills)
                .education(education)
                .experience(experience)
                .projects(projects)
                .certifications(parsedData.getCertifications())
                .links(links)
                .parsedData(parsedDataObject)
                .build();
    }

    // =========================================================
    // SAVE SKILLS
    // =========================================================

    private void saveSkills(ResumeParsedData parsedData, JsonNode skillsNode
    ) {

        if (!skillsNode.isArray()) {
            return;
        }

        for (JsonNode skillNode : skillsNode) {

            ResumeSkill skill = ResumeSkill.builder()
                    .parsedData(parsedData)
                    .name(getText(skillNode, "name"))
                    .normalizedName(getText(skillNode, "normalizedName"))
                    .confidence(getDouble(skillNode, "confidence"))
                    .build();

            resumeSkillRepository.save(skill);
        }
    }

    // =========================================================
    // SAVE EDUCATION
    // =========================================================

    private void saveEducation(ResumeParsedData parsedData, JsonNode educationNode) {

        if (!educationNode.isArray()) {
            return;
        }

        for (JsonNode educationNodeItem : educationNode) {

            ResumeEducation education = ResumeEducation
                    .builder()
                    .parsedData(parsedData)
                    .degree(getText(educationNodeItem, "degree"))
                    .institution(getText(educationNodeItem, "institution"))
                    .endYear(getText(educationNodeItem, "end_year"))
                    .grade(getText(educationNodeItem, "grade"))
                    .build();

            resumeEducationRepository.save(education);
        }
    }

    // =========================================================
    // SAVE EXPERIENCE
    // =========================================================

    private void saveExperience(ResumeParsedData parsedData, JsonNode experienceNode) {

        if (!experienceNode.isArray()) {
            return;
        }

        for (JsonNode experienceNodeItem : experienceNode) {

            /*
             * IMPORTANT:
             *
             * These three values are JSON structures.
             * They should be stored as JsonNode in JSONB
             * columns, not converted into String.
             */
            ResumeExperience experience = ResumeExperience
                    .builder()
                    .parsedData(parsedData)
                    .company(getText(experienceNodeItem, "company"))
                            .jobTitle(getText(experienceNodeItem, "job_title"))
                            .location(getText(experienceNodeItem, "location"))
                            .startDate(getText(experienceNodeItem, "start_date"))
                            .endDate(getText(experienceNodeItem, "end_date"))
                            .responsibilities(toJsonString(experienceNodeItem.path("responsibilities")))
                            .technologies(toJsonString(experienceNodeItem.path("technologies")))
                            .additionalInformation(toJsonString(experienceNodeItem.path("additional_information")))
                            .build();

            resumeExperienceRepository.save(experience);
        }
    }

    // =========================================================
    // SAVE PROJECTS
    // =========================================================

    private void saveProjects(ResumeParsedData parsedData, JsonNode projectsNode) {

        if (!projectsNode.isArray()) {
            return;
        }

        for (JsonNode projectNode : projectsNode) {

            ResumeProject project = ResumeProject
                    .builder()
                    .parsedData(parsedData)
                    .name(getText(projectNode, "name"))
                    .description(getText(projectNode, "description"))
                    .build();

            resumeProjectRepository.save(project);
        }
    }

    // =========================================================
    // SAVE LINKS
    // =========================================================

    private void saveLinks(ResumeParsedData parsedData, JsonNode linksNode) {

        if (!linksNode.isObject()) {
            return;
        }

        String linkedin = getText(linksNode, "linkedin");

        String website = getText(linksNode, "website");

        if ((linkedin == null || linkedin.isBlank()) && (website == null || website.isBlank())) {

            return;
        }

        ResumeLink links = ResumeLink
                .builder().parsedData(parsedData)
                .linkedin(linkedin)
                .website(website)
                .build();

        resumeLinkRepository.save(links);
    }

    // =========================================================
    // JSON VALIDATION
    // =========================================================

    private JsonNode validateAndParseJson(String parsedJson) {

        try {
            JsonNode jsonNode = objectMapper.readTree(parsedJson);

            if (jsonNode == null || !jsonNode.isObject()) {

                throw new IllegalArgumentException("Parsed resume data must be a JSON object");
            }

            return jsonNode;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalArgumentException("Invalid JSON returned by resume parser", e);
        }
    }

    // =========================================================
    // JSON HELPERS
    // =========================================================

    private String getText(JsonNode node, String field
    ) {

        if (node == null || node.isMissingNode() || node.isNull()) {

            return null;
        }

        JsonNode value = node.path(field);

        if (value.isMissingNode() || value.isNull()) {

            return null;
        }

        String text = value.asText();

        return text.isBlank() ? null : text;
    }

    private Integer getInteger(JsonNode node, String field) {

        if (node == null) {
            return null;
        }

        JsonNode value = node.path(field);

        if (value.isMissingNode() || value.isNull()) {

            return null;
        }

        if (value.isNumber()) {
            return value.asInt();
        }

        try {

            return Integer.parseInt(value.asText());

        } catch (Exception e) {

            return null;
        }
    }

    private Double getDouble(JsonNode node, String field) {

        if (node == null) {
            return null;
        }

        JsonNode value = node.path(field);

        if (value.isMissingNode() || value.isNull()) {

            return null;
        }

        if (value.isNumber()) {
            return value.asDouble();
        }

        try {

            return Double.parseDouble(value.asText());

        } catch (Exception e) {

            return null;
        }
    }

    // =========================================================
    // CERTIFICATIONS
    // =========================================================

    private String extractCertifications(JsonNode certificationsNode) {

        if (certificationsNode == null || certificationsNode.isMissingNode() || certificationsNode.isNull()) {

            return null;
        }

        if (certificationsNode.isTextual()) {

            String value = certificationsNode.asText();

            return value.isBlank() ? null : value;
        }

        return toJsonString(certificationsNode);
    }

    // =========================================================
    // JSON SERIALIZATION HELPER
    // =========================================================

    private String toJsonString(JsonNode node) {

        if (node == null || node.isMissingNode() || node.isNull()) {

            return null;
        }

        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize JSON data", e);
        }
    }
}