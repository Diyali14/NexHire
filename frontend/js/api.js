// =========================================================
// NexHire API Helper
// =========================================================

/*
    Returns the JWT token saved after candidate login.
*/

function getAuthToken() {
    return sessionStorage.getItem("token");
}


/*
    Creates headers for normal JSON API requests.
*/

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


/*
    Common API request function.

    Supports:
    - GET
    - POST
    - PUT
    - DELETE
    - FormData
*/

async function apiRequest(endpoint, options = {}) {

    const url =
        `${NEXHIRE_API_BASE_URL}${endpoint}`;

    const requestOptions = {
        ...options
    };

    const headers = {
        ...getJsonHeaders(),
        ...(options.headers || {})
    };


    /*
        If the body is FormData, DO NOT manually set
        Content-Type.

        The browser automatically creates:

        multipart/form-data; boundary=....

        This is required for Resume Upload.
    */

    if (options.body instanceof FormData) {

        delete headers["Content-Type"];

    } else if (options.body) {

        headers["Content-Type"] =
            "application/json";
    }


    requestOptions.headers = headers;


    let response;

    try {

        response = await fetch(
            url,
            requestOptions
        );

    } catch (error) {

        throw new Error(
            "Unable to connect to the NexHire server."
        );
    }


    /*
        Try to read the response.
    */

    let data = null;

    const contentType =
        response.headers.get("content-type") || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            data = await response.json();

        } catch (error) {

            data = null;
        }

    } else {

        try {

            const text =
                await response.text();

            data = text
                ? { message: text }
                : null;

        } catch (error) {

            data = null;
        }
    }


    /*
        Handle HTTP errors.
    */

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`;

        const error =
            new Error(message);

        error.status =
            response.status;

        error.data =
            data;

        throw error;
    }


    return data;
}


/*
    GET request
*/

async function apiGet(endpoint) {

    return apiRequest(
        endpoint,
        {
            method: "GET"
        }
    );
}


/*
    POST JSON request
*/

async function apiPost(
    endpoint,
    data
) {

    return apiRequest(
        endpoint,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


/*
    POST FormData request

    Used for Resume Upload.
*/

async function apiPostFormData(
    endpoint,
    formData
) {

    return apiRequest(
        endpoint,
        {
            method: "POST",
            body: formData
        }
    );
}


/*
    PUT JSON request
*/

async function apiPut(
    endpoint,
    data
) {

    return apiRequest(
        endpoint,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
}


/*
    DELETE request
*/

async function apiDelete(endpoint) {

    return apiRequest(
        endpoint,
        {
            method: "DELETE"
        }
    );
}