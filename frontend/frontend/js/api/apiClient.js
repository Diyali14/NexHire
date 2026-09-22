/* =========================================================
   NexHire — Universal API Fetch Client
   ========================================================= */

(function () {
  "use strict";

  async function request(endpoint, options = {}) {
    const baseUrl = window.API_BASE_URL || "https://nexhire-backend-5zv7.onrender.com/api/v1";
    
    // Ensure endpoint starts with slash
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${path}`;

    const headers = window.NexAuth ? window.NexAuth.getAuthHeaders(options.headers || {}) : (options.headers || {});

    // Don't set Content-Type for FormData as browser sets boundary automatically
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    headers["Accept"] = headers["Accept"] || "application/json";

    const fetchOptions = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, fetchOptions);

      // 401 Unauthorized Handling
      if (response.status === 401) {
        if (window.NexAuth) {
          window.NexAuth.clearSession();
        }
        
        // Only redirect if not already on login page
        const pathName = window.location.pathname;
        if (!pathName.includes("login.html") && !pathName.includes("signup.html") && pathName !== "/" && !pathName.includes("index.html")) {
          const isRecruiter = pathName.includes("recruiter");
          const loginUrl = isRecruiter ? "/html/recruiter/login.html" : "/html/candidate/login.html";
          if (window.NexUtils) {
            window.NexUtils.showToast("Your session has expired. Please login again.", "error");
          }
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 1200);
        }

        const error = new Error("Session expired. Please login again.");
        error.status = 401;
        throw error;
      }

      // Handle binary response (e.g. resume PDF download)
      if (options.responseType === "blob") {
        if (!response.ok) {
          let errText = "Failed to download file.";
          try {
            const errJson = await response.json();
            errText = errJson.message || errText;
          } catch (e) {}
          const error = new Error(errText);
          error.status = response.status;
          throw error;
        }
        return response;
      }

      // 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse response body
      let data = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        const errorMsg = (data && (data.message || data.error)) || `API Request failed (${response.status})`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      // Network failure
      console.error(`Network error requesting ${url}:`, err);
      const networkError = new Error("Unable to connect to NexHire server. Please check your connection.");
      networkError.status = 0;
      throw networkError;
    }
  }

  const ApiClient = {
    get(endpoint, options = {}) {
      return request(endpoint, { ...options, method: "GET" });
    },

    post(endpoint, body, options = {}) {
      return request(endpoint, {
        ...options,
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body)
      });
    },

    put(endpoint, body, options = {}) {
      return request(endpoint, {
        ...options,
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body)
      });
    },

    delete(endpoint, options = {}) {
      return request(endpoint, { ...options, method: "DELETE" });
    },

    uploadFile(endpoint, fileField, file, extraData = {}, options = {}) {
      const formData = new FormData();
      formData.append(fileField, file);
      Object.keys(extraData).forEach((key) => {
        formData.append(key, extraData[key]);
      });

      return request(endpoint, {
        ...options,
        method: "POST",
        body: formData
      });
    },

    downloadStream(endpoint, options = {}) {
      return request(endpoint, {
        ...options,
        method: "GET",
        responseType: "blob"
      });
    }
  };

  window.ApiClient = ApiClient;
})();
