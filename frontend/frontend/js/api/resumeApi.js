/* =========================================================
   NexHire — Resume Management API Module (Endpoints 9-13)
   ========================================================= */

(function () {
  "use strict";

  const ResumeApi = {
    /**
     * Endpoint 9: Upload Resume
     * POST /api/v1/resumes (multipart/form-data)
     */
    uploadResume(file) {
      const formData = new FormData();
      formData.append("file", file);
      return window.ApiClient.post("/resumes", formData);
    },

    /**
     * Endpoint 10: Get All Candidate Resumes
     * GET /api/v1/resumes
     */
    getAllResumes() {
      return window.ApiClient.get("/resumes");
    },

    /**
     * Endpoint 11: Get Single Resume Metadata
     * GET /api/v1/resumes/{resumeId}
     */
    getResume(resumeId) {
      return window.ApiClient.get(`/resumes/${resumeId}`);
    },

    /**
     * Endpoint 12: Get Resume Processing Status
     * GET /api/v1/resumes/{resumeId}/status
     */
    getResumeStatus(resumeId) {
      return window.ApiClient.get(`/resumes/${resumeId}/status`);
    },

    /**
     * Endpoint 13: Get Parsed Resume Data
     * GET /api/v1/resumes/{resumeId}/parsed-data
     */
    getParsedResumeData(resumeId) {
      return window.ApiClient.get(`/resumes/${resumeId}/parsed-data`);
    },

    /**
     * Helper: Poll resume status until COMPLETED or FAILED
     * Sensible polling with max attempts and cleanup
     */
    async pollUntilCompleted(resumeId, onStatusUpdate = null, intervalMs = 3000, maxAttempts = 30) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await this.getResumeStatus(resumeId);
        if (onStatusUpdate) onStatusUpdate(res);

        if (res.status === "COMPLETED") {
          const parsed = await this.getParsedResumeData(resumeId);
          return { status: "COMPLETED", statusData: res, parsedData: parsed };
        }

        if (res.status === "FAILED") {
          throw new Error(res.message || "Resume parsing failed.");
        }

        await new Promise((r) => setTimeout(r, intervalMs));
      }

      throw new Error("Resume processing timed out. Please check again in a few moments.");
    }
  };

  window.ResumeApi = ResumeApi;
})();
