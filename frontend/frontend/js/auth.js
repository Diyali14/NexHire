/* =========================================================
   NexHire — Centralized Authentication & Session Manager
   ========================================================= */

(function () {
  "use strict";

  const TOKEN_KEY = "nexhire_jwt_token";
  const USER_KEY = "nexhire_user_data";

  const NexAuth = {
    /**
     * Get stored JWT token string
     */
    getToken() {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
    },

    /**
     * Get stored user profile object
     */
    getUser() {
      try {
        const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.error("Failed to parse user session data:", e);
        return null;
      }
    },

    /**
     * Get user role string (e.g. ROLE_CANDIDATE or ROLE_RECRUITER)
     */
    getRole() {
      const user = this.getUser();
      if (!user) return null;
      let rawRole = user.role;
      if (!rawRole && Array.isArray(user.roles) && user.roles.length > 0) {
        rawRole = user.roles[0];
      }
      if (!rawRole) return null;
      if (rawRole === "CANDIDATE") return "ROLE_CANDIDATE";
      if (rawRole === "RECRUITER") return "ROLE_RECRUITER";
      return rawRole;
    },

    /**
     * Save authentication session after successful login/signup
     */
    setSession(data, remember = true) {
      if (!data || !data.token) return;

      const storage = remember ? localStorage : sessionStorage;

      // Extract single primary role
      let primaryRole = null;
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        primaryRole = data.roles[0];
      } else if (data.role) {
        primaryRole = data.role;
      }
      if (primaryRole === "CANDIDATE") primaryRole = "ROLE_CANDIDATE";
      if (primaryRole === "RECRUITER") primaryRole = "ROLE_RECRUITER";

      const userData = {
        id: data.id || data.userId || null,
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        roles: data.roles || (primaryRole ? [primaryRole] : []),
        role: primaryRole,
        tokenType: data.type || "Bearer"
      };

      storage.setItem(TOKEN_KEY, data.token);
      storage.setItem(USER_KEY, JSON.stringify(userData));

      // Also clean up any legacy session keys
      sessionStorage.removeItem("nexhire-access-token");
      sessionStorage.removeItem("nexhire-token");
    },

    /**
     * Clear all authentication data
     */
    clearSession() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem("nexhire-access-token");
      sessionStorage.removeItem("nexhire-token");
      sessionStorage.removeItem("nexhire-recruiter-token");
      sessionStorage.removeItem("nexhire-recruiter-session");
    },

    /**
     * Check if currently logged in
     */
    isLoggedIn() {
      return !!this.getToken();
    },

    /**
     * Construct Authorization headers for Fetch API
     */
    getAuthHeaders(customHeaders = {}) {
      const token = this.getToken();
      if (!token) {
        return { ...customHeaders };
      }
      return {
        ...customHeaders,
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`
      };
    },

    /**
     * Verify role-based authorization on protected pages
     * @param {string} requiredRole - 'ROLE_CANDIDATE' or 'ROLE_RECRUITER'
     * @param {string} loginRedirectPath - Path to redirect if unauthenticated
     */
    requireRole(requiredRole, loginRedirectPath) {
      const token = this.getToken();
      const role = this.getRole();

      if (!token || !role) {
        this.clearSession();
        window.location.href = loginRedirectPath;
        return false;
      }

      if (role !== requiredRole) {
        console.warn(`Access denied: required ${requiredRole}, but user has ${role}`);
        // Redirect candidate trying to access recruiter or vice versa
        if (role === "ROLE_CANDIDATE") {
          window.location.href = "/html/candidate/dashboard.html";
        } else if (role === "ROLE_RECRUITER") {
          window.location.href = "/html/recruiter/dashboard.html";
        } else {
          window.location.href = loginRedirectPath;
        }
        return false;
      }

      return true;
    },

    /**
     * Perform global logout and redirect
     */
    logout(targetRole = null) {
      this.clearSession();
      if (targetRole === "ROLE_RECRUITER") {
        window.location.href = "/html/recruiter/login.html";
      } else if (targetRole === "ROLE_CANDIDATE") {
        window.location.href = "/html/candidate/login.html";
      } else {
        window.location.href = "/index.html";
      }
    }
  };

  window.NexAuth = NexAuth;
})();