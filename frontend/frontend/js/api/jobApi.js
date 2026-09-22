/* =========================================================
   NexHire — Job Management API Module (Endpoints 14-15, 28-34)
   ========================================================= */

(function () {
  "use strict";

  const JobApi = {
    // ---------------------------------------------------------
    // CANDIDATE JOB ENDPOINTS
    // ---------------------------------------------------------

    /**
     * Endpoint 14: Candidate Search & List Jobs
     * GET /api/v1/candidates/jobs?query=python&sortBy=recent|title
     */
    searchCandidateJobs(query = "", sortBy = "recent") {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (sortBy) params.append("sortBy", sortBy);
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      return window.ApiClient.get(`/candidates/jobs${queryStr}`);
    },

    /**
     * Endpoint 15: Candidate Get Job Details
     * GET /api/v1/candidates/jobs/{jobId}
     */
    getCandidateJobDetails(jobId) {
      return window.ApiClient.get(`/candidates/jobs/${jobId}`);
    },

    // ---------------------------------------------------------
    // RECRUITER JOB ENDPOINTS
    // ---------------------------------------------------------

    /**
     * Endpoint 28: Recruiter Create Job
     * POST /api/v1/jobs
     */
    createJob(jobTitle, jobDescription) {
      return window.ApiClient.post("/jobs", {
        jobTitle,
        jobDescription
      });
    },

    /**
     * Endpoint 29: Recruiter List Own Jobs
     * GET /api/v1/jobs
     */
    getRecruiterJobs() {
      return window.ApiClient.get("/jobs");
    },

    /**
     * Endpoint 30: Recruiter Get Single Job
     * GET /api/v1/jobs/{jobId}
     */
    getRecruiterJobDetails(jobId) {
      return window.ApiClient.get(`/jobs/${jobId}`);
    },

    /**
     * Endpoint 31: Recruiter Update Job
     * PUT /api/v1/jobs/{jobId}
     */
    updateJob(jobId, jobTitle, jobDescription) {
      return window.ApiClient.put(`/jobs/${jobId}`, {
        jobTitle,
        jobDescription
      });
    },

    /**
     * Endpoint 32: Recruiter Delete Job
     * DELETE /api/v1/jobs/{jobId}
     */
    deleteJob(jobId) {
      return window.ApiClient.delete(`/jobs/${jobId}`);
    },

    /**
     * Endpoint 33: Recruiter Get Job Status
     * GET /api/v1/jobs/{jobId}/status
     */
    getJobStatus(jobId) {
      return window.ApiClient.get(`/jobs/${jobId}/status`);
    },

    /**
     * Endpoint 34: Recruiter Get Parsed Job Data
     * GET /api/v1/jobs/{jobId}/parsed-data
     */
    getParsedJobData(jobId) {
      return window.ApiClient.get(`/jobs/${jobId}/parsed-data`);
    },

    /**
     * Helper: Poll job status until COMPLETED or FAILED
     */
    async pollJobUntilCompleted(jobId, onStatusUpdate = null, intervalMs = 3000, maxAttempts = 30) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await this.getJobStatus(jobId);
        if (onStatusUpdate) onStatusUpdate(res);

        if (res.status === "COMPLETED" || res.parsedDataAvailable === true) {
          const parsed = await this.getParsedJobData(jobId);
          return { status: "COMPLETED", statusData: res, parsedData: parsed };
        }

        if (res.status === "FAILED") {
          throw new Error(res.message || "Job description parsing failed.");
        }

        await new Promise((r) => setTimeout(r, intervalMs));
      }

      throw new Error("Job processing is taking longer than expected.");
    }
  };

  window.JobApi = JobApi;
})();
