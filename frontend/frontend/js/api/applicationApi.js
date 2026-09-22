/* =========================================================
   NexHire — Applications, Skill Gap & Interview API Module (Endpoints 16-23)
   ========================================================= */

(function () {
  "use strict";

  const ApplicationApi = {
    /**
     * Endpoint 16: Candidate Apply To Job
     * POST /api/v1/jobs/{jobId}/apply
     */
    applyToJob(jobId, resumeId) {
      return window.ApiClient.post(`/jobs/${jobId}/apply`, {
        resumeId: Number(resumeId)
      });
    },

    /**
     * Endpoint 17: Candidate Get Application Status for Job
     * GET /api/v1/candidates/jobs/{jobId}/application
     */
    getApplicationStatusForJob(jobId) {
      return window.ApiClient.get(`/candidates/jobs/${jobId}/application`);
    },

    /**
     * Endpoint 18: Candidate List All Applications
     * GET /api/v1/candidates/applications
     */
    getAllCandidateApplications() {
      return window.ApiClient.get("/candidates/applications");
    },

    /**
     * Endpoint 19: Candidate Get Match Result
     * GET /api/v1/candidates/applications/{applicationId}/match-result
     */
    getMatchResult(applicationId) {
      return window.ApiClient.get(`/candidates/applications/${applicationId}/match-result`);
    },

    /**
     * Endpoint 20: Generate Interview Questions
     * POST /api/v1/candidates/jobs/{jobId}/interview-questions
     */
    generateInterviewQuestions(jobId) {
      return window.ApiClient.post(`/candidates/jobs/${jobId}/interview-questions`, {});
    },

    /**
     * Endpoint 21: Retrieve Interview Questions
     * GET /api/v1/candidates/jobs/{jobId}/interview-questions
     */
    getInterviewQuestions(jobId) {
      return window.ApiClient.get(`/candidates/jobs/${jobId}/interview-questions`);
    },

    /**
     * Endpoint 22: Analyze Skill Gap
     * POST /api/v1/candidates/jobs/{jobId}/skill-gap?resumeId=10
     */
    analyzeSkillGap(jobId, resumeId = null) {
      const queryStr = resumeId ? `?resumeId=${resumeId}` : "";
      return window.ApiClient.post(`/candidates/jobs/${jobId}/skill-gap${queryStr}`, {});
    },

    /**
     * Endpoint 23: Retrieve Skill Gap Analysis
     * GET /api/v1/candidates/jobs/{jobId}/skill-gap
     */
    getSkillGapAnalysis(jobId) {
      return window.ApiClient.get(`/candidates/jobs/${jobId}/skill-gap`);
    }
  };

  window.ApplicationApi = ApplicationApi;
})();
