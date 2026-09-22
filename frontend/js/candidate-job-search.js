/* =========================================================
   NEXHIRE — CANDIDATE JOB SEARCH
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const jobList =
        document.getElementById("jobList");

    const resultCount =
        document.getElementById("resultCount");

    const noResults =
        document.getElementById("noResults");

    const searchInput =
        document.getElementById("searchInput");

    const locationInput =
        document.getElementById("locationInput");

    const jobType =
        document.getElementById("jobType");

    const searchBtn =
        document.getElementById("searchBtn");

    const sortJobs =
        document.getElementById("sortJobs");

    const jobModal =
        document.getElementById("jobModal");

    const modalContent =
        document.getElementById("modalContent");

    const closeModal =
        document.getElementById("closeModal");

    const themeToggle =
        document.getElementById("themeToggle");

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");

    const logoutButton =
        document.getElementById("logoutButton");

    const headerName =
        document.getElementById("headerName");

    const headerAvatar =
        document.getElementById("headerAvatar");


    /* =====================================================
       STATE
       ===================================================== */

    let jobs = [];

    let filteredJobs = [];


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not specified";
        }

        const date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "Not specified";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       NORMALIZE SKILLS
       ===================================================== */

    function normalizeSkills(skills) {

        if (!Array.isArray(skills)) {
            return [];
        }

        return skills
            .map(function (skill) {

                if (typeof skill === "string") {
                    return skill;
                }

                if (
                    skill &&
                    typeof skill === "object"
                ) {

                    return (
                        skill.name ||
                        skill.normalizedName ||
                        ""
                    );
                }

                return "";

            })
            .filter(Boolean);
    }


    /* =====================================================
       COMPANY INITIAL
       ===================================================== */

    function getCompanyInitial(companyName) {

        if (!companyName) {
            return "N";
        }

        return companyName
            .trim()
            .charAt(0)
            .toUpperCase();
    }


    /* =====================================================
       GET AUTH TOKEN
       ===================================================== */

    function getAuthToken() {

        return (
            sessionStorage.getItem("token") ||
            localStorage.getItem("token")
        );
    }


    /* =====================================================
       GET RESUME ID
       ===================================================== */

    function getResumeId() {

        return (
            sessionStorage.getItem("resumeId") ||
            localStorage.getItem("resumeId")
        );
    }


    /* =====================================================
       LOAD CANDIDATE DATA
       Data comes from Candidate Dashboard
       ===================================================== */

    function loadCandidateFromDashboard() {

        const storedProfile =
            sessionStorage.getItem(
                "candidateProfile"
            );


        if (!storedProfile) {

            console.warn(
                "Candidate profile data not found in sessionStorage."
            );

            return;
        }


        try {

            const profile =
                JSON.parse(storedProfile);


            const firstName =
                profile.firstName || "";

            const lastName =
                profile.lastName || "";


            const fullName =
                `${firstName} ${lastName}`.trim();


            /* =================================================
               UPDATE HEADER NAME
               ================================================= */

            if (headerName) {

                headerName.textContent =
                    fullName || "Candidate";

            }


            /* =================================================
               UPDATE HEADER AVATAR
               ================================================= */

            if (headerAvatar) {

                if (firstName) {

                    headerAvatar.textContent =
                        firstName
                            .charAt(0)
                            .toUpperCase();

                } else if (lastName) {

                    headerAvatar.textContent =
                        lastName
                            .charAt(0)
                            .toUpperCase();

                } else {

                    headerAvatar.textContent =
                        "C";

                }

            }


            console.log(
                "Candidate data loaded from dashboard:",
                profile
            );


        } catch (error) {

            console.error(
                "Failed to read candidate profile:",
                error
            );

        }

    }


    /* =====================================================
       LOAD JOBS
       ===================================================== */

    async function loadJobs() {

        try {

            if (jobList) {

                jobList.innerHTML = `
                    <div class="loading-state">
                        Loading jobs...
                    </div>
                `;

            }


            console.log(
                "Loading candidate jobs..."
            );


            const response =
                await apiGet(
                    "/candidates/jobs"
                );


            console.log(
                "Jobs API Response:",
                response
            );


            /*
             * Backend may return either:
             *
             * [
             *   {...}
             * ]
             *
             * or
             *
             * {
             *   content: [...]
             * }
             */

            let jobData = response;


            if (
                response &&
                !Array.isArray(response) &&
                Array.isArray(response.content)
            ) {

                jobData =
                    response.content;

            }


            if (!Array.isArray(jobData)) {

                throw new Error(
                    "Invalid jobs response from server."
                );

            }


            jobs =
                jobData.map(function (job) {

                    return {

                        jobId:
                            job.jobId ||
                            job.id,

                        jobTitle:
                            job.jobTitle ||
                            job.title ||
                            "Untitled Job",

                        companyName:
                            job.companyName ||
                            job.company ||
                            "Company",

                        jobDescription:
                            job.jobDescription ||
                            job.description ||
                            "No description available.",

                        experienceRequired:
                            job.experienceRequired ||
                            job.experience ||
                            "Not specified",

                        educationRequired:
                            job.educationRequired ||
                            job.education ||
                            "Not specified",

                        skills:
                            normalizeSkills(
                                job.skills
                            ),

                        processingStatus:
                            job.processingStatus ||
                            "",

                        location:
                            job.location ||
                            job.city ||
                            job.jobLocation ||
                            "",

                        jobType:
                            job.jobType ||
                            job.type ||
                            "",

                        salary:
                            job.salary,

                        salaryMax:
                            job.salaryMax,

                        createdAt:
                            job.createdAt,

                        updatedAt:
                            job.updatedAt

                    };

                });


            filteredJobs =
                [...jobs];


            sortFilteredJobs();

            displayJobs();


            console.log(
                "Candidate jobs loaded successfully."
            );


        } catch (error) {

            console.error(
                "Load Jobs Error:",
                error
            );


            if (jobList) {

                jobList.innerHTML = `
                    <div class="loading-state">
                        Failed to load jobs.
                        Please try again.
                    </div>
                `;

            }

        }

    }


    /* =====================================================
       SEARCH JOBS
       ===================================================== */

    function searchJobs() {

        const keyword =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const location =
            locationInput
                ? locationInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedJobType =
            jobType
                ? jobType.value
                    .trim()
                    .toLowerCase()
                : "";


        filteredJobs =
            jobs.filter(function (job) {


                /* =========================================
                   SEARCHABLE TEXT
                   ========================================= */

                const searchableText = (

                    (job.jobTitle || "") +
                    " " +
                    (job.companyName || "") +
                    " " +
                    (job.jobDescription || "") +
                    " " +
                    (job.experienceRequired || "") +
                    " " +
                    (job.educationRequired || "") +
                    " " +
                    (job.location || "") +
                    " " +
                    (job.jobType || "") +
                    " " +
                    (job.skills || []).join(" ")

                ).toLowerCase();


                const keywordMatch =
                    !keyword ||
                    searchableText.includes(
                        keyword
                    );


                /* =========================================
                   LOCATION
                   ========================================= */

                const jobLocation =
                    String(
                        job.location || ""
                    ).toLowerCase();


                const locationMatch =
                    !location ||
                    jobLocation.includes(
                        location
                    );


                /* =========================================
                   JOB TYPE
                   ========================================= */

                const currentJobType =
                    String(
                        job.jobType || ""
                    ).toLowerCase();


                let jobTypeMatch = true;


                if (selectedJobType) {

                    jobTypeMatch =
                        currentJobType ===
                        selectedJobType;

                }


                return (
                    keywordMatch &&
                    locationMatch &&
                    jobTypeMatch
                );

            });


        sortFilteredJobs();

        displayJobs();

    }


    /* =====================================================
       SORT JOBS
       ===================================================== */

    function sortFilteredJobs() {

        const sortValue =
            sortJobs
                ? sortJobs.value
                : "default";


        if (
            sortValue === "recent" ||
            sortValue === "default"
        ) {

            filteredJobs.sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            a.createdAt || 0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.createdAt || 0
                        ).getTime();


                    return dateB - dateA;

                }
            );

        }


        else if (
            sortValue === "salary"
        ) {

            filteredJobs.sort(
                function (a, b) {

                    const salaryA =
                        Number(
                            a.salaryMax ||
                            a.salary ||
                            0
                        );


                    const salaryB =
                        Number(
                            b.salaryMax ||
                            b.salary ||
                            0
                        );


                    return salaryB - salaryA;

                }
            );

        }

    }


    /* =====================================================
       DISPLAY JOBS
       ===================================================== */

    function displayJobs() {

        if (!jobList) {
            return;
        }


        if (resultCount) {

            resultCount.textContent =
                `${filteredJobs.length} ${
                    filteredJobs.length === 1
                        ? "job"
                        : "jobs"
                } found`;

        }


        if (
            filteredJobs.length === 0
        ) {

            jobList.innerHTML = "";


            if (noResults) {

                noResults.hidden =
                    false;

            }

            return;

        }


        if (noResults) {

            noResults.hidden =
                true;

        }


        jobList.innerHTML =
            filteredJobs.map(
                function (job) {


                    const skillsHtml =
                        job.skills.length > 0

                        ? job.skills
                            .slice(0, 5)
                            .map(
                                function (skill) {

                                    return `
                                        <span class="skill-tag">
                                            ${escapeHtml(skill)}
                                        </span>
                                    `;

                                }
                            )
                            .join("")

                        : `
                            <span class="skill-tag">
                                Skills not specified
                            </span>
                        `;


                    return `
                        <article
                            class="job-card"
                            data-job-id="${escapeHtml(job.jobId)}">

                            <div class="job-card-header">

                                <div class="company-avatar">
                                    ${escapeHtml(
                                        getCompanyInitial(
                                            job.companyName
                                        )
                                    )}
                                </div>

                                <div class="job-card-title">

                                    <h3>
                                        ${escapeHtml(
                                            job.jobTitle
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHtml(
                                            job.companyName
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div class="job-card-info">

                                <span>
                                    Experience:
                                    ${escapeHtml(
                                        job.experienceRequired
                                    )}
                                </span>

                                <span>
                                    Education:
                                    ${escapeHtml(
                                        job.educationRequired
                                    )}
                                </span>

                            </div>


                            <div class="job-card-skills">

                                ${skillsHtml}

                            </div>


                            <div class="job-card-footer">

                                <span class="job-date">
                                    Posted:
                                    ${escapeHtml(
                                        formatDate(
                                            job.createdAt
                                        )
                                    )}
                                </span>


                                <button
                                    type="button"
                                    class="view-job-button"
                                    data-job-id="${escapeHtml(
                                        job.jobId
                                    )}">

                                    View Job

                                </button>

                            </div>

                        </article>
                    `;

                }
            ).join("");


        attachJobButtons();

    }


    /* =====================================================
       ATTACH VIEW JOB BUTTONS
       ===================================================== */

    function attachJobButtons() {

        const viewButtons =
            document.querySelectorAll(
                ".view-job-button"
            );


        viewButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const jobId =
                            this.getAttribute(
                                "data-job-id"
                            );


                        if (jobId) {

                            openJobDetails(
                                jobId
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       OPEN JOB DETAILS
       ===================================================== */

    async function openJobDetails(jobId) {

        if (
            !jobModal ||
            !modalContent
        ) {
            return;
        }


        jobModal.hidden = false;


        modalContent.innerHTML = `
            <div class="loading-state">
                Loading job details...
            </div>
        `;


        try {

            console.log(
                "Loading job details:",
                jobId
            );


            const job =
                await apiGet(
                    `/candidates/jobs/${encodeURIComponent(
                        jobId
                    )}`
                );


            console.log(
                "Job Details Response:",
                job
            );


            const skills =
                normalizeSkills(
                    job.skills
                );


            const skillsHtml =
                skills.length > 0

                ? skills.map(
                    function (skill) {

                        return `
                            <span class="skill-tag">
                                ${escapeHtml(skill)}
                            </span>
                        `;

                    }
                ).join("")

                : `
                    <span class="skill-tag">
                        Skills not specified
                    </span>
                `;


            /* =================================================
               MODAL HTML
               ================================================= */

            modalContent.innerHTML = `

                <div class="job-detail-container">


                    <!-- JOB TITLE -->

                    <div class="job-detail-heading">

                        <div class="company-avatar large">

                            ${escapeHtml(
                                getCompanyInitial(
                                    job.companyName
                                )
                            )}

                        </div>


                        <div>

                            <h3>
                                ${escapeHtml(
                                    job.jobTitle ||
                                    "Untitled Job"
                                )}
                            </h3>


                            <p>
                                ${escapeHtml(
                                    job.companyName ||
                                    "Company"
                                )}
                            </p>

                        </div>

                    </div>


                    <!-- JOB INFORMATION -->

                    <div class="job-detail-info">


                        <div class="detail-item">

                            <strong>
                                Experience
                            </strong>

                            <span>
                                ${escapeHtml(
                                    job.experienceRequired ||
                                    "Not specified"
                                )}
                            </span>

                        </div>


                        <div class="detail-item">

                            <strong>
                                Education
                            </strong>

                            <span>
                                ${escapeHtml(
                                    job.educationRequired ||
                                    "Not specified"
                                )}
                            </span>

                        </div>


                        <div class="detail-item">

                            <strong>
                                Posted
                            </strong>

                            <span>
                                ${escapeHtml(
                                    formatDate(
                                        job.createdAt
                                    )
                                )}
                            </span>

                        </div>


                    </div>


                    <!-- DESCRIPTION -->

                    <div class="job-detail-section">

                        <h4>
                            Job Description
                        </h4>


                        <p>
                            ${escapeHtml(
                                job.jobDescription ||
                                "No description available."
                            )}
                        </p>

                    </div>


                    <!-- SKILLS -->

                    <div class="job-detail-section">

                        <h4>
                            Required Skills
                        </h4>


                        <div class="job-skills">

                            ${skillsHtml}

                        </div>

                    </div>


                    <!-- APPLY -->

                    <div class="job-detail-actions">

                        <button
                            type="button"
                            class="modal-apply-button"
                            id="applyNowButton">

                            Apply Now

                        </button>

                    </div>


                </div>

            `;


            /* =================================================
               GET APPLY BUTTON
               ================================================= */

            const applyButton =
                document.getElementById(
                    "applyNowButton"
                );


            if (!applyButton) {
                return;
            }


            /* =================================================
               APPLY BUTTON CLICK
               ================================================= */

            applyButton.addEventListener(
                "click",
                function () {

                    applyForJob(
                        job.jobId ||
                        jobId,
                        applyButton
                    );

                }
            );


            /* =================================================
               CHECK EXISTING APPLICATION
               ================================================= */

            await checkExistingApplication(
                job.jobId ||
                jobId,
                applyButton
            );


        } catch (error) {

            console.error(
                "Job Details Error:",
                error
            );


            modalContent.innerHTML = `

                <div class="loading-state">

                    Failed to load job details.

                    <br><br>

                    ${escapeHtml(
                        error.message ||
                        "Please try again."
                    )}

                </div>

            `;

        }

    }


    /* =====================================================
       CHECK EXISTING APPLICATION

       Endpoint:
       GET /candidates/jobs/{jobId}/application
       ===================================================== */

    async function checkExistingApplication(
        jobId,
        applyButton
    ) {

        if (!applyButton) {
            return null;
        }


        const token =
            getAuthToken();


        if (!token) {

            console.log(
                "User is not logged in. Skipping application status check."
            );

            return null;

        }


        const numericJobId =
            Number(jobId);


        if (
            !numericJobId ||
            numericJobId <= 0
        ) {

            console.error(
                "Invalid job ID:",
                jobId
            );

            return null;

        }


        try {

            console.log(
                "Checking existing application for job:",
                numericJobId
            );


            const response =
                await fetch(
                    `${NEXHIRE_API_BASE_URL}/candidates/jobs/${numericJobId}/application`,
                    {
                        method: "GET",

                        headers: {

                            "Accept":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }
                );


            /* =================================================
               404 = NOT APPLIED
               ================================================= */

            if (
                response.status === 404
            ) {

                console.log(
                    "No existing application for job:",
                    numericJobId
                );

                return null;

            }


            let data = {};


            try {

                data =
                    await response.json();

            } catch (error) {

                console.warn(
                    "Could not parse application status response.",
                    error
                );

            }


            console.log(
                "Application Status Response:",
                data
            );


            if (!response.ok) {

                console.warn(
                    "Application status request failed:",
                    response.status,
                    data
                );

                return null;

            }


            /* =================================================
               EXISTING APPLICATION FOUND
               ================================================= */

            if (
                data &&
                data.applicationId
            ) {

                applyButton.textContent =
                    "✓ Applied";


                applyButton.disabled =
                    true;


                applyButton.classList.add(
                    "applied"
                );


                /* =============================================
                   SAVE APPLICATION INFORMATION
                   ============================================= */

                if (
                    data.applicationId
                ) {

                    sessionStorage.setItem(
                        "applicationId",
                        data.applicationId
                    );

                }


                if (
                    data.jobId
                ) {

                    sessionStorage.setItem(
                        "appliedJobId",
                        data.jobId
                    );

                }


                if (
                    data.resumeId
                ) {

                    sessionStorage.setItem(
                        "appliedResumeId",
                        data.resumeId
                    );

                }


                if (
                    data.status
                ) {

                    sessionStorage.setItem(
                        "applicationStatus",
                        data.status
                    );

                }


                console.log(
                    "Application already exists."
                );


                console.log(
                    "Application Status:",
                    data.status
                );


                if (
                    data.overallScore !== null &&
                    data.overallScore !== undefined
                ) {

                    console.log(
                        "Overall Match Score:",
                        data.overallScore
                    );

                }


                return data;

            }


            return null;


        } catch (error) {

            console.warn(
                "Could not check application status:",
                error
            );

            return null;

        }

    }


    /* =====================================================
       APPLY FOR JOB

       Endpoint:
       POST /jobs/{jobId}/apply
       ===================================================== */

    async function applyForJob(
        jobId,
        applyButton
    ) {

        try {


            /* =================================================
               GET TOKEN
               ================================================= */

            const token =
                getAuthToken();


            if (!token) {

                alert(
                    "Please login first."
                );


                window.location.href =
                    "candidate-login.html";


                return;

            }


            /* =================================================
               GET RESUME ID
               ================================================= */

            let resumeId =
                getResumeId();


            if (!resumeId) {

                alert(
                    "Please upload and process your resume before applying for a job."
                );


                window.location.href =
                    "ResumeUpload.html";


                return;

            }


            resumeId =
                Number(resumeId);


            /* =================================================
               VALIDATE JOB ID
               ================================================= */

            const numericJobId =
                Number(jobId);


            if (
                !numericJobId ||
                numericJobId <= 0
            ) {

                alert(
                    "Invalid job ID."
                );

                return;

            }


            /* =================================================
               VALIDATE RESUME ID
               ================================================= */

            if (
                !resumeId ||
                resumeId <= 0
            ) {

                alert(
                    "Invalid resume ID."
                );

                return;

            }


            console.log(
                "===================================="
            );


            console.log(
                "APPLYING FOR JOB"
            );


            console.log(
                "Job ID:",
                numericJobId
            );


            console.log(
                "Resume ID:",
                resumeId
            );


            console.log(
                "===================================="
            );


            /* =================================================
               CHECK RESUME PROCESSING STATUS
               ================================================= */

            if (applyButton) {

                applyButton.disabled =
                    true;

                applyButton.textContent =
                    "Checking Resume...";

            }


            const statusResponse =
                await fetch(
                    `${NEXHIRE_API_BASE_URL}/resumes/${resumeId}/status`,
                    {
                        method: "GET",

                        headers: {

                            "Accept":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }
                );


            let statusData = {};


            try {

                statusData =
                    await statusResponse.json();

            } catch (error) {

                console.warn(
                    "Could not parse resume status response.",
                    error
                );

            }


            console.log(
                "Resume Status Response:",
                statusData
            );


            if (!statusResponse.ok) {

                throw new Error(
                    statusData.message ||
                    statusData.error ||
                    "Unable to check resume processing status."
                );

            }


            const resumeStatus =
                String(
                    statusData.status ||
                    ""
                ).toUpperCase();


            console.log(
                "Resume Processing Status:",
                resumeStatus
            );


            /* =================================================
               RESUME NOT COMPLETED
               ================================================= */

            if (
                resumeStatus !== "COMPLETED"
            ) {

                if (applyButton) {

                    applyButton.disabled =
                        false;

                    applyButton.textContent =
                        "Apply Now";

                }


                if (
                    resumeStatus === "QUEUED" ||
                    resumeStatus === "PROCESSING"
                ) {

                    alert(
                        "Your resume is still being processed. Please wait until processing is completed and then apply."
                    );

                } else {

                    alert(
                        `Your resume is not ready yet. Current status: ${
                            resumeStatus ||
                            "UNKNOWN"
                        }`
                    );

                }


                return;

            }


            /* =================================================
               RESUME COMPLETED
               ================================================= */

            if (applyButton) {

                applyButton.disabled =
                    true;

                applyButton.textContent =
                    "Applying...";

            }


            /* =================================================
               APPLY API
               POST /jobs/{jobId}/apply
               ================================================= */

            const response =
                await fetch(
                    `${NEXHIRE_API_BASE_URL}/jobs/${numericJobId}/apply`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                resumeId:
                                    resumeId

                            })

                    }
                );


            /* =================================================
               READ RESPONSE
               ================================================= */

            let data = {};


            try {

                data =
                    await response.json();

            } catch (error) {

                console.warn(
                    "Could not parse application response.",
                    error
                );

            }


            console.log(
                "Application API Response:",
                data
            );


            /* =================================================
               HANDLE ERROR
               ================================================= */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    `Application failed with status ${response.status}.`
                );

            }


            /* =================================================
               SUCCESS
               ================================================= */

            console.log(
                "Application submitted successfully:",
                data
            );


            /* =================================================
               SAVE APPLICATION ID
               ================================================= */

            if (
                data.applicationId
            ) {

                sessionStorage.setItem(
                    "applicationId",
                    data.applicationId
                );

            }


            /* =================================================
               SAVE JOB ID
               ================================================= */

            if (
                data.jobId
            ) {

                sessionStorage.setItem(
                    "appliedJobId",
                    data.jobId
                );

            }


            /* =================================================
               SAVE RESUME ID
               ================================================= */

            if (
                data.resumeId
            ) {

                sessionStorage.setItem(
                    "appliedResumeId",
                    data.resumeId
                );

            }


            /* =================================================
               SAVE APPLICATION STATUS
               ================================================= */

            if (
                data.status
            ) {

                sessionStorage.setItem(
                    "applicationStatus",
                    data.status
                );

            }


            /* =================================================
               UPDATE BUTTON
               ================================================= */

            if (applyButton) {

                applyButton.textContent =
                    "✓ Applied";

                applyButton.disabled =
                    true;

                applyButton.classList.add(
                    "applied"
                );

            }


            /* =================================================
               SUCCESS ALERT
               ================================================= */

            alert(
                data.message ||
                "Application submitted successfully."
            );


        } catch (error) {

            console.error(
                "Apply Job Error:",
                error
            );


            /* =================================================
               RESTORE BUTTON
               ================================================= */

            if (applyButton) {

                applyButton.disabled =
                    false;

                applyButton.textContent =
                    "Apply Now";

                applyButton.classList.remove(
                    "applied"
                );

            }


            /* =================================================
               ERROR MESSAGE
               ================================================= */

            alert(
                error.message ||
                "Failed to apply for this job."
            );

        }

    }


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    function closeJobModal() {

        if (!jobModal) {
            return;
        }


        jobModal.hidden =
            true;


        if (modalContent) {

            modalContent.innerHTML =
                "";

        }

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeJobModal
        );

    }


    if (jobModal) {

        jobModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    jobModal
                ) {

                    closeJobModal();

                }

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                jobModal &&
                !jobModal.hidden
            ) {

                closeJobModal();

            }

        }
    );


    /* =====================================================
       SEARCH BUTTON
       ===================================================== */

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            searchJobs
        );

    }


    /* =====================================================
       SEARCH INPUT
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    searchJobs();

                }

            }
        );

    }


    /* =====================================================
       LOCATION INPUT
       ===================================================== */

    if (locationInput) {

        locationInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    searchJobs();

                }

            }
        );

    }


    /* =====================================================
       JOB TYPE
       ===================================================== */

    if (jobType) {

        jobType.addEventListener(
            "change",
            searchJobs
        );

    }


    /* =====================================================
       SORT
       ===================================================== */

    if (sortJobs) {

        sortJobs.addEventListener(
            "change",
            function () {

                sortFilteredJobs();

                displayJobs();

            }
        );

    }


    /* =====================================================
       PROFILE DROPDOWN
       ===================================================== */

    if (
        profileButton &&
        profileDropdown
    ) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const isOpen =
                    profileButton.getAttribute(
                        "aria-expanded"
                    ) === "true";


                profileButton.setAttribute(
                    "aria-expanded",
                    String(!isOpen)
                );


                profileDropdown.classList.toggle(
                    "show"
                );

            }
        );


        document.addEventListener(
            "click",
            function () {

                profileButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                profileDropdown.classList.remove(
                    "show"
                );

            }
        );


        profileDropdown.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmed) {
                    return;
                }


                /* =========================================
                   SESSION STORAGE
                   ========================================= */

                sessionStorage.removeItem(
                    "token"
                );

                sessionStorage.removeItem(
                    "userId"
                );

                sessionStorage.removeItem(
                    "userEmail"
                );

                sessionStorage.removeItem(
                    "firstName"
                );

                sessionStorage.removeItem(
                    "lastName"
                );

                sessionStorage.removeItem(
                    "userRole"
                );

                sessionStorage.removeItem(
                    "isAuthenticated"
                );

                sessionStorage.removeItem(
                    "candidateId"
                );

                sessionStorage.removeItem(
                    "candidateName"
                );

                sessionStorage.removeItem(
                    "candidateProfile"
                );

                sessionStorage.removeItem(
                    "resumeId"
                );

                sessionStorage.removeItem(
                    "applicationId"
                );

                sessionStorage.removeItem(
                    "appliedJobId"
                );

                sessionStorage.removeItem(
                    "appliedResumeId"
                );

                sessionStorage.removeItem(
                    "applicationStatus"
                );


                /* =========================================
                   LOCAL STORAGE
                   ========================================= */

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "userId"
                );

                localStorage.removeItem(
                    "userEmail"
                );

                localStorage.removeItem(
                    "firstName"
                );

                localStorage.removeItem(
                    "lastName"
                );

                localStorage.removeItem(
                    "userRole"
                );

                localStorage.removeItem(
                    "isAuthenticated"
                );


                /* =========================================
                   REDIRECT
                   ========================================= */

                window.location.href =
                    "candidate-login.html";

            }

        );

    }


    /* =====================================================
       THEME
       ===================================================== */

    function applyTheme(theme) {

        if (
            theme === "dark"
        ) {

            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );


            if (themeToggle) {

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

            }

        }

        else {

            document.documentElement.removeAttribute(
                "data-theme"
            );


            if (themeToggle) {

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
        ) ||
        "light";


    applyTheme(
        savedTheme
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


                applyTheme(
                    newTheme
                );

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadCandidateFromDashboard();

    loadJobs();


    console.log(
        "NexHire Candidate Job Search loaded successfully."
    );

});