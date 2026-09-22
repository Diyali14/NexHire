/* =========================================================
   NEXHIRE — CANDIDATE PROFILE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";


    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const API_BASE_URL =
        window.NEXHIRE_API_BASE_URL ||
        "https://nexhire-backend-5zv7.onrender.com/api/v1";

    const PROFILE_ENDPOINT = "/candidates/me";

    const $ = (id) =>
        document.getElementById(id);

    let originalProfile = {};

    let isEditing = false;


    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    function getAuthToken() {

        return (
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken")
        );
    }


    function requireLogin() {

        const token = getAuthToken();

        if (!token) {

            window.location.href =
                "candidate-login.html";

            return false;
        }

        return true;
    }


    /* =====================================================
       API REQUEST
       ===================================================== */

    async function apiRequest(
        endpoint,
        options = {}
    ) {

        const token = getAuthToken();

        const headers = {
            ...(options.headers || {})
        };


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }


        if (
            options.body &&
            !(options.body instanceof FormData) &&
            !headers["Content-Type"]
        ) {

            headers["Content-Type"] =
                "application/json";
        }


        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


        const responseText =
            await response.text();


        let data = null;


        if (responseText) {

            try {

                data =
                    JSON.parse(responseText);

            } catch {

                data = responseText;
            }
        }


        if (!response.ok) {

            let message =
                `Request failed with status ${response.status}`;


            if (
                typeof data === "object" &&
                data !== null
            ) {

                message =
                    data.message ||
                    data.error ||
                    data.detail ||
                    message;

            } else if (data) {

                message = data;
            }


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


    /* =====================================================
       STATUS MESSAGE
       ===================================================== */

    function showMessage(
        message,
        type = "info"
    ) {

        const status =
            $("statusMessage");


        if (!status) {

            alert(message);

            return;
        }


        status.textContent =
            message;

        status.hidden = false;

        status.className =
            `status-message show ${type}`;


        window.clearTimeout(
            showMessage.timeout
        );


        showMessage.timeout =
            window.setTimeout(() => {

                status.classList.remove(
                    "show"
                );

                status.hidden = true;

            }, 5000);
    }


    /* =====================================================
       THEME
       ===================================================== */

    const themeToggle =
        $("themeToggle");


    function applyTheme(theme) {

        const selectedTheme =
            theme === "dark"
                ? "dark"
                : "light";


        if (selectedTheme === "dark") {

            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            document.documentElement.removeAttribute(
                "data-theme"
            );
        }


        localStorage.setItem(
            "nexhire-theme",
            selectedTheme
        );


        if (themeToggle) {

            if (selectedTheme === "dark") {

                themeToggle.textContent =
                    "☀";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to light mode"
                );

            } else {

                themeToggle.textContent =
                    "☼";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to dark mode"
                );
            }
        }
    }


    const savedTheme =
        localStorage.getItem(
            "nexhire-theme"
        ) || "light";


    applyTheme(savedTheme);


    themeToggle?.addEventListener(
        "click",
        () => {

            const currentTheme =
                document.documentElement
                    .getAttribute(
                        "data-theme"
                    );


            const newTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";


            applyTheme(newTheme);
        }
    );


    /* =====================================================
       PROFILE DROPDOWN
       ===================================================== */

    const profileButton =
        $("profileButton");

    const profileDropdown =
        $("profileDropdown");


    profileButton?.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            if (!profileDropdown) {
                return;
            }


            const isOpen =
                profileDropdown.classList
                    .contains("show");


            profileDropdown.classList.toggle(
                "show"
            );


            profileButton.setAttribute(
                "aria-expanded",
                isOpen
                    ? "false"
                    : "true"
            );
        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                profileDropdown &&
                !profileDropdown.contains(
                    event.target
                ) &&
                !profileButton?.contains(
                    event.target
                )
            ) {

                profileDropdown.classList.remove(
                    "show"
                );


                profileButton?.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );


    /* =====================================================
       LOGOUT
       ===================================================== */

    $("logoutButton")?.addEventListener(
        "click",
        () => {

            const keys = [

                "token",
                "accessToken",

                "candidateId",
                "candidateName",
                "candidateEmail",

                "resumeId",
                "selectedJobId",

                "userId",
                "userEmail",

                "firstName",
                "lastName",

                "userRole",
                "isAuthenticated"
            ];


            keys.forEach((key) => {

                sessionStorage.removeItem(
                    key
                );

                localStorage.removeItem(
                    key
                );
            });


            const candidateKeys = [

                "candidate",
                "candidateProfile",
                "candidateData"
            ];


            candidateKeys.forEach((key) => {

                localStorage.removeItem(
                    key
                );
            });


            window.location.href =
                "candidate-login.html";
        }
    );


    /* =====================================================
       PROFILE HELPERS
       ===================================================== */

    function getInitials(
        firstName,
        lastName
    ) {

        const first =
            String(firstName || "")
                .trim()
                .charAt(0);


        const last =
            String(lastName || "")
                .trim()
                .charAt(0);


        return (
            first + last
        ).toUpperCase() || "C";
    }


    function setInputValue(
        id,
        value
    ) {

        const element =
            $(id);


        if (element) {

            element.value =
                value ?? "";
        }
    }


    function getInputValue(id) {

        return (
            $(id)?.value.trim() || ""
        );
    }


    function setAvatar(
        firstName,
        lastName
    ) {

        const initials =
            getInitials(
                firstName,
                lastName
            );


        const profileAvatar =
            $("profileAvatar");

        const headerAvatar =
            $("headerAvatar");


        if (profileAvatar) {

            profileAvatar.textContent =
                initials;
        }


        if (headerAvatar) {

            headerAvatar.textContent =
                initials;
        }
    }


    /* =====================================================
       PROFILE SUMMARY
       ===================================================== */

    function updateProfileSummary(
        profile
    ) {

        const firstName =
            profile.firstName || "";


        const lastName =
            profile.lastName || "";


        const fullName =
            `${firstName} ${lastName}`
                .trim();


        if ($("profileFullName")) {

            $("profileFullName")
                .textContent =
                fullName ||
                "Candidate";
        }


        if ($("profileEmail")) {

            $("profileEmail")
                .textContent =
                profile.email || "";
        }


        if ($("headerName")) {

            $("headerName")
                .textContent =
                fullName ||
                "Candidate";
        }


        setAvatar(
            firstName,
            lastName
        );
    }


    /* =====================================================
       PROFILE COMPLETION
       ===================================================== */

    function calculateCompletion(
        profile
    ) {

        const fields = [

            profile.firstName,
            profile.lastName,
            profile.email,
            profile.phone,
            profile.linkedinUrl,
            profile.githubUrl,
            profile.bio
        ];


        const completed =
            fields.filter(
                (value) => {

                    return (
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                    );
                }
            ).length;


        return Math.round(
            (completed /
                fields.length) *
                100
        );
    }


    function updateCompletion(
        profile
    ) {

        const percentage =
            calculateCompletion(
                profile
            );


        if ($("completionPercentage")) {

            $("completionPercentage")
                .textContent =
                `${percentage}%`;
        }


        if ($("completionBar")) {

            $("completionBar")
                .style.width =
                `${percentage}%`;
        }


        if ($("completionProgress")) {

            $("completionProgress")
                .setAttribute(
                    "aria-valuenow",
                    String(percentage)
                );
        }


        if ($("completionMessage")) {

            if (percentage === 100) {

                $("completionMessage")
                    .textContent =
                    "Your profile is complete. Great work!";

            } else if (percentage >= 70) {

                $("completionMessage")
                    .textContent =
                    `Your profile is ${percentage}% complete. Add a few more details.`;

            } else {

                $("completionMessage")
                    .textContent =
                    `Your profile is ${percentage}% complete. Add the missing details to improve it.`;
            }
        }
    }


    /* =====================================================
       POPULATE PROFILE FORM
       ===================================================== */

    function populateProfileForm(
        profile
    ) {

        setInputValue(
            "firstName",
            profile.firstName
        );


        setInputValue(
            "lastName",
            profile.lastName
        );


        setInputValue(
            "email",
            profile.email
        );


        setInputValue(
            "phone",
            profile.phone
        );


        setInputValue(
            "linkedinUrl",
            profile.linkedinUrl
        );


        setInputValue(
            "githubUrl",
            profile.githubUrl
        );


        setInputValue(
            "bio",
            profile.bio
        );


        updateProfileSummary(
            profile
        );


        updateCompletion(
            profile
        );
    }


    /* =====================================================
       LOAD PROFILE
       ===================================================== */

    async function loadProfile() {

        try {

            const result =
                await apiRequest(
                    PROFILE_ENDPOINT
                );


            if (
                !result ||
                typeof result !== "object"
            ) {

                throw new Error(
                    "The server returned an invalid profile."
                );
            }


            const profile =
                result.data &&
                typeof result.data === "object"
                    ? result.data
                    : result;


            originalProfile =
                {
                    ...profile
                };


            populateProfileForm(
                profile
            );


            setFormEditing(
                false
            );


        } catch (error) {

            console.error(
                "Unable to load candidate profile:",
                error
            );


            if (
                error.status === 401
            ) {

                sessionStorage.clear();

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "accessToken"
                );

                window.location.href =
                    "candidate-login.html";

                return;
            }


            showMessage(
                error.message ||
                "Unable to load your profile.",
                "error"
            );
        }
    }


    /* =====================================================
       EDIT MODE
       ===================================================== */

    const profileForm =
        $("profileForm");


    const editProfileButton =
        $("editProfileButton");


    const cancelEditButton =
        $("cancelEditButton");


    const formActions =
        $("formActions");


    function setFormEditing(
        enabled
    ) {

        isEditing =
            enabled;


        const editableFields = [

            "firstName",
            "lastName",
            "phone",
            "linkedinUrl",
            "githubUrl",
            "bio"
        ];


        editableFields.forEach(
            (id) => {

                const field =
                    $(id);


                if (field) {

                    field.disabled =
                        !enabled;
                }
            }
        );


        if (formActions) {

            formActions.hidden =
                !enabled;
        }


        if (editProfileButton) {

            editProfileButton.hidden =
                enabled;
        }
    }


    editProfileButton?.addEventListener(
        "click",
        () => {

            setFormEditing(
                true
            );


            showMessage(
                "You can now edit your profile.",
                "info"
            );


            $("firstName")?.focus();
        }
    );


    cancelEditButton?.addEventListener(
        "click",
        () => {

            populateProfileForm(
                originalProfile
            );


            setFormEditing(
                false
            );


            showMessage(
                "Your changes were discarded.",
                "info"
            );
        }
    );


    /* =====================================================
       URL VALIDATION
       ===================================================== */

    function isValidLinkedInUrl(
        value
    ) {

        if (!value) {
            return true;
        }


        try {

            const url =
                new URL(value);


            return (
                url.protocol === "https:" &&
                (
                    url.hostname ===
                        "linkedin.com" ||
                    url.hostname.endsWith(
                        ".linkedin.com"
                    )
                )
            );

        } catch {

            return false;
        }
    }


    function isValidGitHubUrl(
        value
    ) {

        if (!value) {
            return true;
        }


        try {

            const url =
                new URL(value);


            return (
                url.protocol === "https:" &&
                (
                    url.hostname ===
                        "github.com" ||
                    url.hostname.endsWith(
                        ".github.com"
                    )
                )
            );

        } catch {

            return false;
        }
    }


    /* =====================================================
       SAVE PROFILE
       ===================================================== */

    profileForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!isEditing) {
                return;
            }


            /* =============================================
               BASIC VALUES
               ============================================= */

            const firstName =
                getInputValue(
                    "firstName"
                );


            const lastName =
                getInputValue(
                    "lastName"
                );


            const phone =
                getInputValue(
                    "phone"
                );


            const linkedinUrl =
                getInputValue(
                    "linkedinUrl"
                );


            const githubUrl =
                getInputValue(
                    "githubUrl"
                );


            const bio =
                getInputValue(
                    "bio"
                );


            /* =============================================
               REQUIRED FIELD VALIDATION
               ============================================= */

            if (
                !firstName ||
                !lastName
            ) {

                showMessage(
                    "First name and last name are required.",
                    "error"
                );

                return;
            }


            /* =============================================
               LINKEDIN VALIDATION
               ============================================= */

            if (
                !isValidLinkedInUrl(
                    linkedinUrl
                )
            ) {

                showMessage(
                    "Please enter a valid LinkedIn URL, for example: https://www.linkedin.com/in/your-profile",
                    "error"
                );

                $("linkedinUrl")?.focus();

                return;
            }


            /* =============================================
               GITHUB VALIDATION
               ============================================= */

            if (
                !isValidGitHubUrl(
                    githubUrl
                )
            ) {

                showMessage(
                    "Please enter a valid GitHub URL, for example: https://github.com/your-username",
                    "error"
                );

                $("githubUrl")?.focus();

                return;
            }


            /* =============================================
               API PAYLOAD
               ============================================= */

            const updatedProfile = {

                firstName:
                    firstName,

                lastName:
                    lastName,

                phone:
                    phone || null,

                linkedinUrl:
                    linkedinUrl || null,

                githubUrl:
                    githubUrl || null,

                bio:
                    bio || null
            };


            console.log(
                "Profile update payload:",
                updatedProfile
            );


            /* =============================================
               SAVE BUTTON
               ============================================= */

            const saveButton =
                $("saveProfileButton");


            const originalButtonText =
                saveButton?.textContent;


            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";
            }


            /* =============================================
               SAVE TO BACKEND
               ============================================= */

            try {

                const result =
                    await apiRequest(
                        PROFILE_ENDPOINT,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(
                                    updatedProfile
                                )
                        }
                    );


                /* =========================================
                   HANDLE RESPONSE
                   ========================================= */

                let profile;


                if (
                    result &&
                    typeof result === "object"
                ) {

                    if (
                        result.data &&
                        typeof result.data === "object"
                    ) {

                        profile =
                            result.data;

                    } else if (
                        result.firstName !== undefined ||
                        result.lastName !== undefined ||
                        result.email !== undefined
                    ) {

                        profile =
                            result;

                    } else {

                        profile = {

                            ...originalProfile,

                            ...updatedProfile
                        };
                    }

                } else {

                    profile = {

                        ...originalProfile,

                        ...updatedProfile
                    };
                }


                /* =========================================
                   UPDATE LOCAL PROFILE
                   ========================================= */

                originalProfile =
                    {
                        ...profile
                    };


                populateProfileForm(
                    profile
                );


                setFormEditing(
                    false
                );


                showMessage(
                    "Your profile was updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Unable to save profile:",
                    error
                );


                /* =========================================
                   BACKEND VALIDATION MESSAGE
                   ========================================= */

                let errorMessage =
                    error.message ||
                    "Unable to save your profile.";


                if (
                    error.data &&
                    typeof error.data === "object"
                ) {

                    errorMessage =
                        error.data.message ||
                        error.data.error ||
                        errorMessage;
                }


                showMessage(
                    errorMessage,
                    "error"
                );


            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        originalButtonText ||
                        "Save Changes";
                }
            }
        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    if (requireLogin()) {

        loadProfile();
    }

});