/* =========================================================
   NexHire — Authentication API Module (Endpoints 1-4)
   ========================================================= */

(function () {
  "use strict";

  const AuthApi = {
    /**
     * Endpoint 1: Candidate Registration
     * POST /api/v1/auth/candidate/register
     */
    registerCandidate(data) {
      return window.ApiClient.post("/auth/candidate/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });
    },

    /**
     * Endpoint 2: Candidate Login
     * POST /api/v1/auth/candidate/login
     */
    loginCandidate(data) {
      return window.ApiClient.post("/auth/candidate/login", {
        email: data.email,
        password: data.password
      });
    },

    /**
     * Endpoint 3: Recruiter Registration
     * POST /api/v1/auth/recruiter/register
     */
    registerRecruiter(data) {
      return window.ApiClient.post("/auth/recruiter/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });
    },

    /**
     * Endpoint 4: Recruiter Login
     * POST /api/v1/auth/recruiter/login
     */
    loginRecruiter(data) {
      return window.ApiClient.post("/auth/recruiter/login", {
        email: data.email,
        password: data.password
      });
    }
  };

  window.AuthApi = AuthApi;
})();
