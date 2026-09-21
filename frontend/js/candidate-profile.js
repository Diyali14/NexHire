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

    const CHANGE_PASSWORD_ENDPOINT =
        "/candidates/me/change-password";


    const $ = (id) => document.getElementById(id);


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

    async function apiRequest(endpoint, options = {}) {

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

                data = JSON.parse(responseText);

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


            throw new Error(message);
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


        status.textContent = message;

        status.hidden = false;

        status.className =
            `status-message show ${type}`;


        window.clearTimeout(
            showMessage.timeout
        );


        showMessage.timeout =
            window.setTimeout(() => {

                status.classList.remove("show");

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

                themeToggle.textContent = "☀";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to light mode"
                );

            } else {

                themeToggle.textContent = "☼";

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
                    .getAttribute("data-theme");


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
                isOpen ? "false" : "true"
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
                "resumeId",
                "selectedJobId"
            ];


            keys.forEach((key) => {

                sessionStorage.removeItem(key);

                localStorage.removeItem(key);
            });


            const candidateKeys = [
                "candidate",
                "candidateProfile",
                "candidateData"
            ];


            candidateKeys.forEach((key) => {

                localStorage.removeItem(key);
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

        const element = $(id);


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
                fullName || "Candidate";
        }


        if ($("profileEmail")) {

            $("profileEmail")
                .textContent =
                profile.email || "";
        }


        if ($("headerName")) {

            $("headerName")
                .textContent =
                fullName || "Candidate";
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
            (completed / fields.length) * 100
        );
    }


    function updateCompletion(
        profile
    ) {

        const percentage =
            calculateCompletion(profile);


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
       POPULATE PROFILE
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


            /*
             * Supports both:
             *
             * {
             *   firstName: "...",
             *   lastName: "..."
             * }
             *
             * and:
             *
             * {
             *   data: {
             *      firstName: "...",
             *      lastName: "..."
             *   }
             * }
             */


            const profile =
                result.data &&
                typeof result.data === "object"
                    ? result.data
                    : result;


            originalProfile =
                { ...profile };


            populateProfileForm(
                profile
            );


            setFormEditing(false);


        } catch (error) {

            console.error(
                "Unable to load candidate profile:",
                error
            );


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

        isEditing = enabled;


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

                const field = $(id);


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

            setFormEditing(true);

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


            setFormEditing(false);


            showMessage(
                "Your changes were discarded.",
                "info"
            );
        }
    );


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


            const firstName =
                getInputValue("firstName");


            const lastName =
                getInputValue("lastName");


            if (!firstName || !lastName) {

                showMessage(
                    "First name and last name are required.",
                    "error"
                );

                return;
            }


            const updatedProfile = {

                firstName,

                lastName,

                phone:
                    getInputValue("phone"),

                linkedinUrl:
                    getInputValue("linkedinUrl"),

                githubUrl:
                    getInputValue("githubUrl"),

                bio:
                    getInputValue("bio")
            };


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


                let profile;


                if (
                    result &&
                    typeof result === "object"
                ) {

                    if (
                        result.data &&
                        typeof result.data === "object"
                    ) {

                        profile = result.data;

                    } else if (
                        result.firstName !== undefined ||
                        result.lastName !== undefined ||
                        result.email !== undefined
                    ) {

                        profile = result;

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


                originalProfile =
                    { ...profile };


                populateProfileForm(
                    profile
                );


                setFormEditing(false);


                showMessage(
                    "Your profile was updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Unable to save profile:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to save your profile.",
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
       CHANGE PASSWORD
       ===================================================== */

    const changePasswordForm =
        $("changePasswordForm");


    changePasswordForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const currentPassword =
                getInputValue(
                    "currentPassword"
                );


            const newPassword =
                getInputValue(
                    "newPassword"
                );


            const confirmPassword =
                getInputValue(
                    "confirmPassword"
                );


            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                showMessage(
                    "Please fill in all password fields.",
                    "error"
                );

                return;
            }


            if (newPassword.length < 8) {

                showMessage(
                    "Your new password must contain at least 8 characters.",
                    "error"
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                showMessage(
                    "The new passwords do not match.",
                    "error"
                );

                return;
            }


            if (
                currentPassword ===
                newPassword
            ) {

                showMessage(
                    "Your new password must be different from your current password.",
                    "error"
                );

                return;
            }


            const changeButton =
                $("changePasswordButton");


            const originalButtonText =
                changeButton?.textContent;


            if (changeButton) {

                changeButton.disabled =
                    true;

                changeButton.textContent =
                    "Updating...";
            }


            try {

                await apiRequest(
                    CHANGE_PASSWORD_ENDPOINT,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                currentPassword,
                                newPassword
                            })
                    }
                );


                changePasswordForm.reset();


                showMessage(
                    "Your password was changed successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Unable to change password:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to change your password.",
                    "error"
                );


            } finally {

                if (changeButton) {

                    changeButton.disabled =
                        false;

                    changeButton.textContent =
                        originalButtonText ||
                        "Update Password";
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