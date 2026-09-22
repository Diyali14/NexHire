// =========================================================
// NexHire API Helper
// =========================================================

"use strict";


// =========================================================
// AUTHENTICATION TOKEN
// =========================================================

function getAuthToken() {
    return sessionStorage.getItem("token");
}


// =========================================================
// JSON HEADERS
// =========================================================

function getJsonHeaders() {

    const headers = {
        "Accept": "application/json"
    };

    const token = getAuthToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}


// =========================================================
// COMMON API REQUEST
// =========================================================

async function apiRequest(endpoint, options = {}) {

    const url = `${NEXHIRE_API_BASE_URL}${endpoint}`;

    const headers = {
        ...getJsonHeaders(),
        ...(options.headers || {})
    };

    const isFormData = options.body instanceof FormData;

    if (isFormData) {

        // Let the browser set the multipart boundary.
        delete headers["Content-Type"];

    } else if (
        options.body &&
        typeof options.body === "string"
    ) {

        headers["Content-Type"] = "application/json";
    }

    let response;

    try {

        response = await fetch(url, {
            ...options,
            headers
        });

    } catch (error) {

        throw new Error(
            "Unable to connect to the NexHire server. Please check your internet connection."
        );
    }

    // -----------------------------------------------------
    // HANDLE RESPONSE
    // -----------------------------------------------------

    if (response.status === 204) {
        return null;
    }

    const contentType =
        response.headers.get("content-type") || "";

    let data = null;

    if (contentType.includes("application/json")) {

        try {
            data = await response.json();
        } catch {
            data = null;
        }

    } else {

        try {

            const text = await response.text();

            data = text
                ? { message: text }
                : null;

        } catch {
            data = null;
        }
    }

    // -----------------------------------------------------
    // HANDLE ERRORS
    // -----------------------------------------------------

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`;

        const error = new Error(message);

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}


// =========================================================
// GET REQUEST
// =========================================================

async function apiGet(endpoint) {

    return apiRequest(endpoint, {
        method: "GET"
    });
}


// =========================================================
// POST JSON REQUEST
// =========================================================

async function apiPost(endpoint, data) {

    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
    });
}


// =========================================================
// POST FORMDATA REQUEST
// =========================================================

async function apiPostFormData(endpoint, formData) {

    return apiRequest(endpoint, {
        method: "POST",
        body: formData
    });
}


// =========================================================
// PUT JSON REQUEST
// =========================================================

async function apiPut(endpoint, data) {

    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}


// =========================================================
// DELETE REQUEST
// =========================================================

async function apiDelete(endpoint) {

    return apiRequest(endpoint, {
        method: "DELETE"
    });
}


// =========================================================
// DOWNLOAD BINARY FILE
// =========================================================

async function apiDownload(endpoint) {

    const url = `${NEXHIRE_API_BASE_URL}${endpoint}`;

    let response;

    try {

        response = await fetch(url, {
            method: "GET",
            headers: {
                ...getJsonHeaders()
            }
        });

    } catch {

        throw new Error(
            "Unable to connect to the NexHire server."
        );
    }

    if (!response.ok) {

        let message = `Download failed: ${response.status}`;

        try {

            const data = await response.json();

            message =
                data?.message ||
                data?.error ||
                message;

        } catch {
            // Keep the fallback message.
        }

        const error = new Error(message);

        error.status = response.status;

        throw error;
    }

    return await response.blob();
}