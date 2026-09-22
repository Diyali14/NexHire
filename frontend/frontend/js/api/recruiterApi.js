/* =========================================================
   NexHire — Recruiter Profile & Applicant Management API Module (Endpoints 24-27, 35-37)
   ========================================================= */

(function () {
  "use strict";

  const RecruiterApi = {
    /**
     * Endpoint 24: Get Recruiter Profile
     * GET /api/v1/recruiters/me
     */
    getProfile() {
      return window.ApiClient.get("/recruiters/me");
    },

    /**
     * Endpoint 25: Update Recruiter Profile
     * PUT /api/v1/recruiters/me
     * Note: email is preserved
     */
    updateProfile(data) {
      return window.ApiClient.put("/recruiters/me", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        designation: data.designation
      });
    },

    /**
     * Endpoint 26: Recruiter Change Password
     * POST /api/v1/recruiters/me/change-password
     */
    changePassword(oldPassword, newPassword) {
      return window.ApiClient.post("/recruiters/me/change-password", {
        oldPassword,
        newPassword
      });
    },

    /**
     * Endpoint 27: Recruiter Password Reset
     * POST /api/v1/recruiters/me/password-reset
     */
    resetPassword(email, newPassword) {
      return window.ApiClient.post("/recruiters/me/password-reset", {
        email,
        newPassword
      });
    },

    /**
     * Endpoint 35: Recruiter List Applicants for Job
     * GET /api/v1/recruiters/jobs/{jobId}/applications
     * Response is sorted deterministically by overallScore DESC, createdAt ASC
     */
    getApplicantsForJob(jobId) {
      return window.ApiClient.get(`/recruiters/jobs/${jobId}/applications`);
    },

    /**
     * Endpoint 36: Recruiter Get Applicant Details
     * GET /api/v1/recruiters/jobs/{jobId}/applications/{applicationId}
     */
    getApplicantDetails(jobId, applicationId) {
      return window.ApiClient.get(`/recruiters/jobs/${jobId}/applications/${applicationId}`);
    },

    /**
     * Endpoint 37: Secure Candidate Resume Download
     * GET /api/v1/recruiters/applications/{applicationId}/resume/download
     * Returns raw binary file stream (blob)
     */
    downloadResume(applicationId) {
      return window.ApiClient.downloadStream(`/recruiters/applications/${applicationId}/resume/download`);
    }
  };

  window.RecruiterApi = RecruiterApi;
})();
