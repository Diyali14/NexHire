/* =========================================================
   NexHire — Candidate Dashboard
   Backend Connected Version
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const API_BASE_URL =
        "https://nexhire-backend-5zv7.onrender.com/api/v1";


    /* =====================================================
       AUTH TOKEN
       ===================================================== */

    const token =
        sessionStorage.getItem("token");


    /* =====================================================
       COMMON API REQUEST
       ===================================================== */

    async function apiRequest(endpoint, options = {}) {

        const headers = {
            "Accept": "application/json",
            ...(options.headers || {})
        };

        if (options.body &&
            !(options.body instanceof FormData)) {

            headers["Content-Type"] =
                "application/json";
        }

        if (token) {

            headers["Authorization"] =
                "Bearer " + token;
        }

        let response;

        try {

            response = await fetch(
                API_BASE_URL + endpoint,
                {
                    ...options,
                    headers: headers
                }
            );

        } catch (error) {

            throw new Error(
                "Unable to connect to the NexHire server."
            );

        }


        let data = null;

        const contentType =
            response.headers.get("content-type") || "";


        if (
            contentType.includes("application/json")
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


    /* =====================================================
       THEME TOGGLE
       ===================================================== */

    const themeToggle =
        document.getElementById("themeToggle");


    const savedTheme =
        localStorage.getItem("nexhire-theme");


    function applyTheme(theme) {

        if (theme === "dark") {

            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );

            if (themeToggle) {

                themeToggle.textContent = "☀";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to light mode"
                );

            }

        } else {

            document.documentElement.removeAttribute(
                "data-theme"
            );

            if (themeToggle) {

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


    applyTheme(
        savedTheme || "light"
    );


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    document.documentElement.getAttribute(
                        "data-theme"
                    );

                const newTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";

                localStorage.setItem(
                    "nexhire-theme",
                    newTheme
                );

                applyTheme(newTheme);

            }
        );

    }


    /* =====================================================
       PROFILE DROPDOWN
       ===================================================== */

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    function closeProfileDropdown() {

        if (!profileDropdown) {
            return;
        }

        profileDropdown.classList.remove(
            "open"
        );

        if (profileButton) {

            profileButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    if (
        profileButton &&
        profileDropdown
    ) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const isOpen =
                    profileDropdown.classList.contains(
                        "open"
                    );


                if (isOpen) {

                    closeProfileDropdown();

                } else {

                    profileDropdown.classList.add(
                        "open"
                    );

                    profileButton.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !profileButton.contains(
                        event.target
                    ) &&
                    !profileDropdown.contains(
                        event.target
                    )
                ) {

                    closeProfileDropdown();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    closeProfileDropdown();

                }

            }
        );

    }


    /* =====================================================
       PROFILE LINKS
       ===================================================== */

    const profileLinks =
        profileDropdown?.querySelectorAll(
            'a[href="candidate-profile.html"]'
        );


    if (profileLinks) {

        profileLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeProfileDropdown();

                    }
                );

            }
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    window.confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {

                    return;

                }


                /* Clear authentication data */

                sessionStorage.removeItem(
                    "token"
                );

                sessionStorage.removeItem(
                    "candidateId"
                );

                sessionStorage.removeItem(
                    "candidateName"
                );

                sessionStorage.removeItem(
                    "resumeId"
                );

                sessionStorage.removeItem(
                    "selectedJobId"
                );


                localStorage.removeItem(
                    "candidateId"
                );

                localStorage.removeItem(
                    "candidateName"
                );

                localStorage.removeItem(
                    "resumeId"
                );


                /* Keep theme preference */

                window.location.href =
                    "candidate-login.html";

            }
        );

    }


    /* =====================================================
       LOAD CANDIDATE PROFILE
       GET /candidates/me
       ===================================================== */

    async function loadCandidateProfile() {

        if (!token) {

            console.warn(
                "No authentication token found."
            );

            return;

        }


        try {

            const profile =
                await apiRequest(
                    "/candidates/me"
                );


            console.log(
                "Candidate profile:",
                profile
            );


            updateProfileUI(profile);


        } catch (error) {

            console.error(
                "Failed to load candidate profile:",
                error
            );


            if (
                error.status === 401 ||
                error.status === 403
            ) {

                sessionStorage.removeItem(
                    "token"
                );

                window.location.href =
                    "candidate-login.html";

            }

        }

    }


    /* =====================================================
       UPDATE PROFILE UI
       ===================================================== */

    function updateProfileUI(profile) {

        if (!profile) {
            return;
        }


        const firstName =
            profile.firstName || "";


        const lastName =
            profile.lastName || "";


        const fullName =
            `${firstName} ${lastName}`
                .trim();


        const displayName =
            fullName ||
            firstName ||
            "Candidate";


        /* ---------------------------------------------
           Save candidate information locally
           --------------------------------------------- */

        if (firstName) {

            sessionStorage.setItem(
                "candidateName",
                displayName
            );

            localStorage.setItem(
                "candidateName",
                displayName
            );

        }


        if (profile.id) {

            sessionStorage.setItem(
                "candidateId",
                String(profile.id)
            );

            localStorage.setItem(
                "candidateId",
                String(profile.id)
            );

        }


        /* ---------------------------------------------
           Header name
           --------------------------------------------- */

        const headerName =
            document.getElementById(
                "headerName"
            );


        if (headerName) {

            headerName.textContent =
                firstName || "Candidate";

        }


        /* ---------------------------------------------
           Welcome name
           --------------------------------------------- */

        const welcomeName =
            document.getElementById(
                "welcomeName"
            );


        if (welcomeName) {

            welcomeName.textContent =
                (firstName || "Candidate") + ".";

        }


        /* ---------------------------------------------
           Full name
           --------------------------------------------- */

        const candidateFullName =
            document.getElementById(
                "candidateFullName"
            );


        if (candidateFullName) {

            candidateFullName.textContent =
                displayName;

        }


        /* ---------------------------------------------
           Avatar
           --------------------------------------------- */

        const initial =
            (firstName ||
                displayName ||
                "C")
                .charAt(0)
                .toUpperCase();


        const headerAvatar =
            document.getElementById(
                "headerAvatar"
            );


        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        if (headerAvatar) {

            headerAvatar.textContent =
                initial;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                initial;

        }


        /* ---------------------------------------------
           Profile bio
           --------------------------------------------- */

        const profileDescription =
            document.querySelector(
                ".profile-info > p"
            );


        if (
            profileDescription &&
            profile.bio
        ) {

            profileDescription.textContent =
                profile.bio;

        }

    }


    /* =====================================================
       LOAD RESUME INFORMATION
       GET /resumes
       ===================================================== */

    async function loadResumeInformation() {

        if (!token) {

            return;

        }


        try {

            const resumes =
                await apiRequest(
                    "/resumes"
                );


            console.log(
                "Resume API response:",
                resumes
            );


            let resumeList = [];


            if (Array.isArray(resumes)) {

                resumeList =
                    resumes;

            } else if (
                resumes &&
                Array.isArray(resumes.resumes)
            ) {

                resumeList =
                    resumes.resumes;

            } else if (
                resumes &&
                Array.isArray(resumes.content)
            ) {

                resumeList =
                    resumes.content;

            }


            if (resumeList.length === 0) {

                updateResumeStatus(
                    "Not Uploaded",
                    "Upload your resume"
                );

                return;

            }


            /*
             * Use the latest resume.
             */

            const latestResume =
                resumeList[0];


            const resumeId =
                latestResume.resumeId ??
                latestResume.id;


            if (resumeId) {

                sessionStorage.setItem(
                    "resumeId",
                    String(resumeId)
                );

                localStorage.setItem(
                    "resumeId",
                    String(resumeId)
                );

            }


            const status =
                latestResume.processingStatus ||
                latestResume.status ||
                "Uploaded";


            updateResumeStatus(
                formatResumeStatus(status),
                getResumeMessage(status)
            );


        } catch (error) {

            console.error(
                "Failed to load resume information:",
                error
            );

        }

    }


    /* =====================================================
       UPDATE RESUME STATUS
       ===================================================== */

    function updateResumeStatus(
        status,
        message
    ) {

        const resumeStatus =
            document.getElementById(
                "resumeStatus"
            );


        if (resumeStatus) {

            resumeStatus.textContent =
                status;

        }


        const resumeCard =
            resumeStatus?.closest(
                ".stat-card"
            );


        if (resumeCard) {

            const small =
                resumeCard.querySelector(
                    "small"
                );


            if (small && message) {

                small.textContent =
                    message;

            }

        }

    }


    /* =====================================================
       FORMAT RESUME STATUS
       ===================================================== */

    function formatResumeStatus(status) {

        if (!status) {

            return "Uploaded";

        }


        const normalized =
            String(status)
                .toUpperCase();


        switch (normalized) {

            case "QUEUED":
                return "Processing";

            case "PROCESSING":
                return "Processing";

            case "COMPLETED":
                return "Ready";

            case "FAILED":
                return "Failed";

            case "UPLOADED":
                return "Uploaded";

            default:
                return status;

        }

    }


    /* =====================================================
       RESUME MESSAGE
       ===================================================== */

    function getResumeMessage(status) {

        const normalized =
            String(status || "")
                .toUpperCase();


        switch (normalized) {

            case "QUEUED":
                return "Resume is being processed";

            case "PROCESSING":
                return "Resume is being analyzed";

            case "COMPLETED":
                return "Ready for analysis";

            case "FAILED":
                return "Processing failed";

            default:
                return "Resume available";

        }

    }


    /* =====================================================
       LOAD PARSED RESUME DATA
       GET /resumes/{resumeId}/parsed-data
       ===================================================== */

    async function loadParsedResume() {

        if (!token) {

            return;

        }


        const resumeId =
            sessionStorage.getItem(
                "resumeId"
            ) ||
            localStorage.getItem(
                "resumeId"
            );


        if (!resumeId) {

            console.log(
                "No resumeId found."
            );

            return;

        }


        try {

            const resumeData =
                await apiRequest(
                    "/resumes/" +
                    encodeURIComponent(resumeId) +
                    "/parsed-data"
                );


            console.log(
                "Parsed resume data:",
                resumeData
            );


            updateResumeData(
                resumeData
            );


        } catch (error) {

            console.log(
                "Parsed resume data is not available yet.",
                error
            );

        }

    }


    /* =====================================================
       UPDATE RESUME DATA
       ===================================================== */

    function updateResumeData(data) {

        if (!data) {

            return;

        }


        /*
         * Backend may return skills directly
         * or inside parsedData.
         */

        const parsedData =
            data.parsedData || data;


        const skills =
            data.skills ||
            parsedData.skills ||
            parsedData.skillSet ||
            parsedData.technicalSkills;


        if (Array.isArray(skills)) {

            updateSkills(
                skills
            );

        }


        const profile =
            data.profile ||
            parsedData.profile;


        if (profile) {

            updateResumeProfile(
                profile
            );

        }

    }


    /* =====================================================
       UPDATE SKILLS
       ===================================================== */

    function updateSkills(skills) {

        const validSkills =
            skills.filter(
                function (skill) {

                    return (
                        typeof skill === "string" &&
                        skill.trim() !== ""
                    );

                }
            );


        if (validSkills.length === 0) {

            return;

        }


        /* Remove duplicates */

        const uniqueSkills =
            [...new Set(
                validSkills.map(
                    skill =>
                        skill.trim()
                )
            )];


        const skillsCard =
            document.querySelector(
                ".skills-card"
            );


        if (skillsCard) {

            skillsCard.innerHTML = "";


            uniqueSkills.forEach(
                function (skill) {

                    const span =
                        document.createElement(
                            "span"
                        );

                    span.textContent =
                        skill;

                    skillsCard.appendChild(
                        span
                    );

                }
            );

        }


        /* Update skill count */

        const skillsCount =
            document.getElementById(
                "skillsCount"
            );


        if (skillsCount) {

            skillsCount.textContent =
                uniqueSkills.length +
                (
                    uniqueSkills.length === 1
                        ? " Skill"
                        : " Skills"
                );

        }

    }


    /* =====================================================
       UPDATE PROFILE FROM RESUME
       ===================================================== */

    function updateResumeProfile(profile) {

        if (!profile) {

            return;

        }


        const candidateFullName =
            document.getElementById(
                "candidateFullName"
            );


        const name =
            profile.name ||
            profile.fullName;


        if (
            candidateFullName &&
            name
        ) {

            candidateFullName.textContent =
                name;

        }

    }


    /* =====================================================
       PROFILE LINK HANDLING
       ===================================================== */

    document
        .querySelectorAll(
            'a[href="candidate-profile.html"]'
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeProfileDropdown();

                    }
                );

            }
        );


    /* =====================================================
       INITIALIZE DASHBOARD
       ===================================================== */

    if (!token) {

        console.warn(
            "Dashboard loaded without authentication token."
        );

        /*
         * We do not redirect immediately.
         * Authentication is handled by the team.
         */

    } else {

        loadCandidateProfile();

        loadResumeInformation();

        loadParsedResume();

    }


    /* =====================================================
       DASHBOARD READY
       ===================================================== */

    console.log(
        "NexHire Candidate Dashboard loaded successfully."
    );

});