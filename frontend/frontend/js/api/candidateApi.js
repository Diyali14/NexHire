/* =========================================================
   NexHire — Candidate Profile & Password API Module (Endpoints 5-8)
   ========================================================= */

(function () {
  "use strict";

  const CandidateApi = {
    /**
     * Endpoint 5: Get Candidate Profile
     * GET /api/v1/candidates/me
     */
    getProfile() {
      return window.ApiClient.get("/candidates/me");
    },

    /**
     * Endpoint 6: Update Candidate Profile
     * PUT /api/v1/candidates/me
     * Note: email is preserved as requested by UX
     */
    updateProfile(data) {
      return window.ApiClient.put("/candidates/me", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl || "https://linkedin.com/in/candidate",
        githubUrl: data.githubUrl || "https://github.com/candidate",
        bio: data.bio || ""
      });
    },

    /**
     * Endpoint 7: Candidate Change Password
     * POST /api/v1/candidates/me/change-password
     */
    changePassword(oldPassword, newPassword) {
      return window.ApiClient.post("/candidates/me/change-password", {
        oldPassword,
        newPassword
      });
    },

    /**
     * Endpoint 8: Candidate Password Reset
     * POST /api/v1/candidates/me/password-reset
     */
    resetPassword(email, newPassword) {
      return window.ApiClient.post("/candidates/me/password-reset", {
        email,
        newPassword
      });
    }
  };

  window.CandidateApi = CandidateApi;
})();
