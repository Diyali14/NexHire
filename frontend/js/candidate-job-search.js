/* =========================================================
   NEXHIRE — CANDIDATE JOB SEARCH
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

    const closeModal =
        document.getElementById("closeModal");

    const modalContent =
        document.getElementById("modalContent");

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");

    const themeToggle =
        document.getElementById("themeToggle");

    const logoutButton =
        document.getElementById("logoutButton");


    /* =====================================================
       STATE
       ===================================================== */

    let jobs = [];

    let filteredJobs = [];


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        if (value === null || value === undefined) {
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
            return "Date unavailable";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
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
            .filter(skill =>
                typeof skill === "string"
            )
            .map(skill =>
                skill.trim()
            )
            .filter(Boolean);
    }


    /* =====================================================
       GET COMPANY INITIAL
       ===================================================== */

    function getCompanyInitial(company) {

        if (!company) {
            return "C";
        }

        return company
            .trim()
            .charAt(0)
            .toUpperCase();
    }


    /* =====================================================
       LOAD JOBS
       ===================================================== */

    async function loadJobs() {

        jobList.innerHTML = `
            <div class="loading-state">
                Loading available jobs...
            </div>
        `;

        noResults.hidden = true;

        try {

            const response =
                await apiGet("/candidates/jobs");

            if (!Array.isArray(response)) {

                throw new Error(
                    "Invalid jobs response from server."
                );
            }


            jobs = response.map(job => {

                return {

                    jobId: job.jobId,

                    jobTitle:
                        job.jobTitle ||
                        "Untitled Job",

                    company:
                        job.companyName ||
                        "",

                    jobDescription:
                        job.jobDescription ||
                        "No description provided.",

                    experienceRequired:
                        job.experienceRequired ||
                        "",

                    educationRequired:
                        job.educationRequired ||
                        "",

                    processingStatus:
                        job.processingStatus ||
                        "UNKNOWN",

                    createdAt:
                        job.createdAt ||
                        null,

                    updatedAt:
                        job.updatedAt ||
                        null,

                    skills:
                        normalizeSkills(
                            job.skills
                        ),

                    location:
                        job.location ||
                        "",

                    type:
                        job.type ||
                        "",

                    salary:
                        job.salary ||
                        ""
                };

            });


            /* newest first */

            jobs.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );


            searchJobs();

        } catch (error) {

            console.error(
                "Failed to load jobs:",
                error
            );

            jobList.innerHTML = "";

            resultCount.textContent =
                "Unable to load jobs";

            noResults.hidden = false;

            noResults.querySelector("h3").textContent =
                "Unable to load jobs";

            noResults.querySelector("p").textContent =
                error.message ||
                "Please try again later.";
        }
    }


    /* =====================================================
       SEARCH JOBS
       ===================================================== */

    function searchJobs() {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        const location =
            locationInput.value
                .trim()
                .toLowerCase();

        const selectedType =
            jobType.value
                .trim()
                .toLowerCase();


        filteredJobs =
            jobs.filter(job => {

                /* -----------------------------------------
                   KEYWORD
                   ----------------------------------------- */

                const searchableText = [

                    job.jobTitle,

                    job.company,

                    job.jobDescription,

                    job.experienceRequired,

                    job.educationRequired,

                    ...job.skills

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesKeyword =
                    !keyword ||
                    searchableText.includes(keyword);


                /* -----------------------------------------
                   LOCATION
                   ----------------------------------------- */

                const jobLocation =
                    String(
                        job.location || ""
                    ).toLowerCase();

                const matchesLocation =
                    !location ||
                    !jobLocation ||
                    jobLocation.includes(location);


                /* -----------------------------------------
                   JOB TYPE
                   ----------------------------------------- */

                const jobTypeValue =
                    String(
                        job.type || ""
                    ).toLowerCase();

                const matchesType =
                    !selectedType ||
                    !jobTypeValue ||
                    jobTypeValue === selectedType;


                return (
                    matchesKeyword &&
                    matchesLocation &&
                    matchesType
                );

            });


        sortFilteredJobs();

        displayJobs(filteredJobs);
    }


    /* =====================================================
       SORT JOBS
       ===================================================== */

    function sortFilteredJobs() {

        const sortValue =
            sortJobs.value;


        if (
            sortValue === "default" ||
            sortValue === "recent"
        ) {

            filteredJobs.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );

            return;
        }


        /*
         * Salary sorting cannot be performed reliably
         * because the supplied API response does not
         * currently provide a usable salary field.
         */
    }


    /* =====================================================
       DISPLAY JOBS
       ===================================================== */

    function displayJobs(jobArray) {

        /* reset no-result text */

        noResults.querySelector("h3").textContent =
            "No jobs found";

        noResults.querySelector("p").textContent =
            "Try changing your search filters.";


        resultCount.textContent =
            `${jobArray.length} ${
                jobArray.length === 1
                    ? "job"
                    : "jobs"
            } found`;


        if (jobArray.length === 0) {

            jobList.innerHTML = "";

            noResults.hidden = false;

            return;
        }


        noResults.hidden = true;


        jobList.innerHTML =
            jobArray.map(job => {

                const skillsHtml =
                    job.skills.length > 0

                        ? job.skills
                            .map(skill => `
                                <span class="skill-tag">
                                    ${escapeHtml(skill)}
                                </span>
                            `)
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

                        <div class="job-top">


                            <div class="job-heading">

                                <div class="company-avatar">
                                    ${escapeHtml(
                                        getCompanyInitial(
                                            job.company
                                        )
                                    )}
                                </div>


                                <div>

                                    <h3 class="job-title">
                                        ${escapeHtml(
                                            job.jobTitle
                                        )}
                                    </h3>

                                    <div class="job-company">
                                        ${escapeHtml(
                                            job.company ||
                                            "Company not specified"
                                        )}
                                    </div>

                                </div>

                            </div>


                            <div class="job-actions">

                                <button
                                    type="button"
                                    class="save-button"
                                    data-save-id="${escapeHtml(job.jobId)}">

                                    ♡ Save

                                </button>


                                <button
                                    type="button"
                                    class="view-button"
                                    data-view-id="${escapeHtml(job.jobId)}">

                                    View Job

                                </button>

                            </div>

                        </div>


                        <!-- META -->

                        <div class="job-meta">

                            ${
                                job.type
                                    ? `
                                        <span class="job-meta-item">
                                            ◈
                                            ${escapeHtml(job.type)}
                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                job.location
                                    ? `
                                        <span class="job-meta-item">
                                            ◉
                                            ${escapeHtml(job.location)}
                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                job.experienceRequired
                                    ? `
                                        <span class="job-meta-item">
                                            ▣
                                            ${escapeHtml(
                                                job.experienceRequired
                                            )}
                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                job.salary
                                    ? `
                                        <span class="job-meta-item">
                                            ₹
                                            ${escapeHtml(job.salary)}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        <!-- DESCRIPTION -->

                        <p class="job-description">

                            ${escapeHtml(
                                job.jobDescription
                            )}

                        </p>


                        <!-- SKILLS -->

                        <div class="job-skills">

                            ${skillsHtml}

                        </div>


                        <!-- FOOTER -->

                        <div class="job-footer">

                            <span>
                                Posted:
                                ${formatDate(
                                    job.createdAt
                                )}
                            </span>

                            <span>
                                ${escapeHtml(
                                    job.processingStatus
                                )}
                            </span>

                        </div>

                    </article>

                `;

            }).join("");


        attachJobButtons();
    }


    /* =====================================================
       JOB BUTTON EVENTS
       ===================================================== */

    function attachJobButtons() {


        /* -----------------------------------------
           SAVE
           ----------------------------------------- */

        document
            .querySelectorAll(
                "[data-save-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        if (
                            this.classList.contains(
                                "saved"
                            )
                        ) {

                            this.classList.remove(
                                "saved"
                            );

                            this.textContent =
                                "♡ Save";

                        } else {

                            this.classList.add(
                                "saved"
                            );

                            this.textContent =
                                "♥ Saved";
                        }

                    }
                );

            });


        /* -----------------------------------------
           VIEW JOB
           ----------------------------------------- */

        document
            .querySelectorAll(
                "[data-view-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const jobId =
                            this.dataset.viewId;

                        openJobDetails(jobId);

                    }
                );

            });

    }


    /* =====================================================
       OPEN JOB DETAILS
       ===================================================== */

    async function openJobDetails(jobId) {

        modalContent.innerHTML = `

            <div class="loading-state">
                Loading job details...
            </div>

        `;

        jobModal.hidden = false;

        document.body.style.overflow =
            "hidden";


        try {

            const job =
                await apiGet(
                    `/candidates/jobs/${encodeURIComponent(
                        jobId
                    )}`
                );


            const skills =
                normalizeSkills(
                    job.skills
                );


            const skillsHtml =
                skills.length > 0

                    ? skills
                        .map(skill => `
                            <span class="skill-tag">
                                ${escapeHtml(skill)}
                            </span>
                        `)
                        .join("")

                    : `
                        <span class="skill-tag">
                            Skills not specified
                        </span>
                    `;


            modalContent.innerHTML = `

                <div class="modal-job-header">

                    <h2 class="modal-job-title">

                        ${escapeHtml(
                            job.jobTitle ||
                            "Untitled Job"
                        )}

                    </h2>


                    <div class="modal-company">

                        ${escapeHtml(
                            job.companyName ||
                            "Company not specified"
                        )}

                    </div>

                </div>


                <!-- INFORMATION -->

                <div class="modal-info-grid">


                    <div class="modal-info-item">

                        <span class="modal-info-label">
                            Job ID
                        </span>

                        <span class="modal-info-value">
                            ${escapeHtml(
                                job.jobId ||
                                jobId
                            )}
                        </span>

                    </div>


                    <div class="modal-info-item">

                        <span class="modal-info-label">
                            Status
                        </span>

                        <span class="modal-info-value">
                            ${escapeHtml(
                                job.processingStatus ||
                                "UNKNOWN"
                            )}
                        </span>

                    </div>


                    <div class="modal-info-item">

                        <span class="modal-info-label">
                            Experience
                        </span>

                        <span class="modal-info-value">
                            ${escapeHtml(
                                job.experienceRequired ||
                                "Not specified"
                            )}
                        </span>

                    </div>


                    <div class="modal-info-item">

                        <span class="modal-info-label">
                            Education
                        </span>

                        <span class="modal-info-value">
                            ${escapeHtml(
                                job.educationRequired ||
                                "Not specified"
                            )}
                        </span>

                    </div>


                    ${
                        job.location
                            ? `
                                <div class="modal-info-item">

                                    <span class="modal-info-label">
                                        Location
                                    </span>

                                    <span class="modal-info-value">
                                        ${escapeHtml(
                                            job.location
                                        )}
                                    </span>

                                </div>
                              `
                            : ""
                    }


                    ${
                        job.type
                            ? `
                                <div class="modal-info-item">

                                    <span class="modal-info-label">
                                        Job Type
                                    </span>

                                    <span class="modal-info-value">
                                        ${escapeHtml(
                                            job.type
                                        )}
                                    </span>

                                </div>
                              `
                            : ""
                    }

                </div>



                <!-- DESCRIPTION -->

                <div class="modal-section">

                    <h4>
                        Job Description
                    </h4>

                    <p>

                        ${escapeHtml(
                            job.jobDescription ||
                            "No description provided."
                        )}

                    </p>

                </div>



                <!-- SKILLS -->

                <div class="modal-section">

                    <h4>
                        Required Skills
                    </h4>

                    <div class="modal-skills">

                        ${skillsHtml}

                    </div>

                </div>



                <!-- DATES -->

                <div class="modal-section">

                    <h4>
                        Job Information
                    </h4>

                    <p>

                        Posted:
                        ${formatDate(
                            job.createdAt
                        )}

                        <br>

                        Updated:
                        ${formatDate(
                            job.updatedAt
                        )}

                    </p>

                </div>



                <!-- APPLY -->

                <button
                    type="button"
                    class="modal-apply-button"
                    id="applyNowButton">

                    Apply Now

                </button>

            `;


            const applyButton =
                document.getElementById(
                    "applyNowButton"
                );


            if (applyButton) {

                applyButton.addEventListener(
                    "click",
                    function () {

                        alert(
                            "Application submission is not connected yet. Please provide the backend application API endpoint and request format."
                        );

                    }
                );

            }


        } catch (error) {

            console.error(
                "Failed to load job details:",
                error
            );


            modalContent.innerHTML = `

                <div class="no-results">

                    <div class="no-results-icon">
                        !
                    </div>

                    <h3>
                        Unable to load job
                    </h3>

                    <p>
                        ${
                            escapeHtml(
                                error.message ||
                                "Please try again."
                            )
                        }
                    </p>

                </div>

            `;

        }

    }


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    function closeJobModal() {

        jobModal.hidden = true;

        document.body.style.overflow = "";
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
                    event.target === jobModal
                ) {

                    closeJobModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                !jobModal.hidden
            ) {

                closeJobModal();

            }

        }
    );


    /* =====================================================
       SEARCH EVENTS
       ===================================================== */

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            searchJobs
        );

    }


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


    if (jobType) {

        jobType.addEventListener(
            "change",
            searchJobs
        );

    }


    if (sortJobs) {

        sortJobs.addEventListener(
            "change",
            function () {

                sortFilteredJobs();

                displayJobs(
                    filteredJobs
                );

            }
        );

    }


    /* =====================================================
       PROFILE DROPDOWN
       ===================================================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const isOpen =
                    profileDropdown.classList.toggle(
                        "open"
                    );

                profileButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                profileDropdown &&
                profileButton &&
                !profileDropdown.contains(event.target) &&
                !profileButton.contains(event.target)
            ) {

                profileDropdown.classList.remove(
                    "open"
                );

                profileButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       THEME
       ===================================================== */

    function applyTheme(theme) {

        if (theme === "dark") {

            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );


            if (themeToggle) {

                /*
                 * Your requested icon convention:
                 * Dark mode -> ☀
                 */

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

        } else {

            document.documentElement.removeAttribute(
                "data-theme"
            );


            if (themeToggle) {

                /*
                 * Your requested icon convention:
                 * Light mode -> ☼
                 */

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
        );


    applyTheme(
        savedTheme === "dark"
            ? "dark"
            : "light"
    );


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    document.documentElement
                        .getAttribute(
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


                localStorage.removeItem(
                    "candidateId"
                );

                localStorage.removeItem(
                    "candidateName"
                );

                localStorage.removeItem(
                    "resumeId"
                );


                sessionStorage.clear();


                window.location.href =
                    "candidate-login.html";

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadJobs();

});