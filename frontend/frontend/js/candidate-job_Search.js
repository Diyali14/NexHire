/* =========================================================
   NEXHIRE - SEARCH JOBS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const themeBtn =
        document.getElementById("themeBtn");

    const searchInput =
        document.getElementById("searchInput");

    const searchBtn =
        document.getElementById("searchBtn");

    const locationFilter =
        document.getElementById("locationFilter");

    const experienceFilter =
        document.getElementById("experienceFilter");

    const jobTypeFilter =
        document.getElementById("jobTypeFilter");

    const salaryFilter =
        document.getElementById("salaryFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const clearBtn =
        document.getElementById("clearBtn");

    const emptyClearBtn =
        document.getElementById("emptyClearBtn");

    const jobsContainer =
        document.getElementById("jobsContainer");

    const emptyState =
        document.getElementById("emptyState");

    const jobCount =
        document.getElementById("jobCount");

    const resultSummary =
        document.getElementById("resultSummary");


    /* =====================================================
       MODAL ELEMENTS
    ===================================================== */

    const jobModal =
        document.getElementById("jobModal");

    const closeModal =
        document.getElementById("closeModal");

    const modalLogo =
        document.getElementById("modalLogo");

    const modalCompany =
        document.getElementById("modalCompany");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalLocation =
        document.getElementById("modalLocation");

    const modalType =
        document.getElementById("modalType");

    const modalExperience =
        document.getElementById("modalExperience");

    const modalMatch =
        document.getElementById("modalMatch");

    const modalSkills =
        document.getElementById("modalSkills");

    const modalDescription =
        document.getElementById("modalDescription");

    const applyBtn =
        document.getElementById("applyBtn");

    const saveBtn =
        document.getElementById("saveBtn");


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");


    /* =====================================================
       DEMO JOB DATA
       
       Later this will come from:
       GET /api/v1/jobs
       
       Match score will come from backend / AI service.
    ===================================================== */

    const jobs = [

        {
            id: 1,

            title: "Software Engineer",

            company: "Google",

            logo: "G",

            location: "Bengaluru",

            type: "Full-time",

            experience: "0-2",

            salary: 18,

            salaryText: "₹12 - ₹18 LPA",

            skills: [
                "Java",
                "Spring Boot",
                "SQL",
                "REST API"
            ],

            match: 94,

            postedDays: 2,

            description:
                "Work with engineering teams to design, build and maintain scalable software systems. The role involves backend development, API design and collaboration across product teams."
        },


        {
            id: 2,

            title: "Java Backend Developer",

            company: "Cognizant",

            logo: "C",

            location: "Hyderabad",

            type: "Full-time",

            experience: "0-2",

            salary: 11,

            salaryText: "₹7 - ₹11 LPA",

            skills: [
                "Java",
                "Spring Boot",
                "PostgreSQL",
                "Microservices"
            ],

            match: 91,

            postedDays: 1,

            description:
                "Join a backend engineering team focused on enterprise applications and distributed services. Work with Java, Spring Boot, databases and REST APIs."
        },


        {
            id: 3,

            title: "Full Stack Developer",

            company: "Infosys",

            logo: "I",

            location: "Pune",

            type: "Full-time",

            experience: "2-5",

            salary: 14,

            salaryText: "₹9 - ₹14 LPA",

            skills: [
                "JavaScript",
                "Java",
                "React",
                "SQL"
            ],

            match: 87,

            postedDays: 4,

            description:
                "Develop and maintain full-stack applications while working closely with product and engineering teams. Experience across frontend and backend technologies is useful."
        },


        {
            id: 4,

            title: "Backend Engineer",

            company: "Microsoft",

            logo: "M",

            location: "Bengaluru",

            type: "Full-time",

            experience: "2-5",

            salary: 22,

            salaryText: "₹15 - ₹22 LPA",

            skills: [
                "Java",
                "Python",
                "Azure",
                "REST API"
            ],

            match: 84,

            postedDays: 3,

            description:
                "Build reliable backend services and APIs for large-scale applications. Collaborate with engineers to improve performance, reliability and developer productivity."
        },


        {
            id: 5,

            title: "Software Developer Intern",

            company: "TCS",

            logo: "T",

            location: "Chennai",

            type: "Internship",

            experience: "fresher",

            salary: 5,

            salaryText: "₹3 - ₹5 LPA",

            skills: [
                "Java",
                "Python",
                "SQL",
                "Git"
            ],

            match: 82,

            postedDays: 5,

            description:
                "A software development internship focused on learning engineering practices, writing code, debugging applications and working with experienced development teams."
        },


        {
            id: 6,

            title: "Junior Java Developer",

            company: "Accenture",

            logo: "A",

            location: "Mumbai",

            type: "Full-time",

            experience: "0-2",

            salary: 9,

            salaryText: "₹6 - ₹9 LPA",

            skills: [
                "Java",
                "Spring",
                "SQL",
                "Git"
            ],

            match: 79,

            postedDays: 7,

            description:
                "Work on Java-based business applications and services. The position provides opportunities to develop backend programming and enterprise application skills."
        },


        {
            id: 7,

            title: "Python Developer",

            company: "Deloitte",

            logo: "D",

            location: "Delhi",

            type: "Full-time",

            experience: "2-5",

            salary: 15,

            salaryText: "₹10 - ₹15 LPA",

            skills: [
                "Python",
                "FastAPI",
                "PostgreSQL",
                "Docker"
            ],

            match: 76,

            postedDays: 6,

            description:
                "Develop backend services using Python and modern API frameworks. Contribute to service design, database integration and application deployment."
        },


        {
            id: 8,

            title: "Remote Backend Developer",

            company: "TechNova",

            logo: "T",

            location: "Remote",

            type: "Contract",

            experience: "2-5",

            salary: 16,

            salaryText: "₹11 - ₹16 LPA",

            skills: [
                "Node.js",
                "PostgreSQL",
                "REST API",
                "AWS"
            ],

            match: 73,

            postedDays: 9,

            description:
                "Work remotely with a distributed engineering team to develop backend services, APIs and database integrations for a growing technology platform."
        }

    ];


    /* =====================================================
       STATE
    ===================================================== */

    let filteredJobs = [...jobs];

    let selectedJob = null;

    const savedJobs = new Set();


    /* =====================================================
       THEME
    ===================================================== */

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add(
                "light-preview"
            );

            themeBtn.textContent = "☾";

            themeBtn.title =
                "Switch to dark mode";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        } else {

            document.body.classList.remove(
                "light-preview"
            );

            themeBtn.textContent = "☀";

            themeBtn.title =
                "Switch to light mode";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        }
    }


    const savedTheme =
        localStorage.getItem(
            "nexhire-theme"
        ) || "dark";


    applyTheme(savedTheme);


    themeBtn.addEventListener(
        "click",
        () => {

            const isLight =
                document.body.classList.contains(
                    "light-preview"
                );


            const nextTheme =
                isLight
                    ? "dark"
                    : "light";


            applyTheme(nextTheme);


            localStorage.setItem(
                "nexhire-theme",
                nextTheme
            );
        }
    );


    /* =====================================================
       FILTER JOBS
    ===================================================== */

    function filterJobs() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const location =
            locationFilter.value;


        const experience =
            experienceFilter.value;


        const jobType =
            jobTypeFilter.value;


        const salary =
            salaryFilter.value;


        filteredJobs =
            jobs.filter(job => {

                const searchableText = [

                    job.title,

                    job.company,

                    job.location,

                    ...job.skills

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );


                const matchesLocation =
                    location === "all" ||
                    job.location === location;


                const matchesExperience =
                    experience === "all" ||
                    job.experience === experience;


                const matchesType =
                    jobType === "all" ||
                    job.type === jobType;


                const matchesSalary =
                    checkSalary(
                        job.salary,
                        salary
                    );


                return (
                    matchesSearch &&
                    matchesLocation &&
                    matchesExperience &&
                    matchesType &&
                    matchesSalary
                );

            });


        sortJobs();

        renderJobs();

        updateSummary();
    }


    /* =====================================================
       SALARY
    ===================================================== */

    function checkSalary(
        salary,
        selectedSalary
    ) {

        if (
            selectedSalary === "all"
        ) {
            return true;
        }


        if (
            selectedSalary === "0-5"
        ) {

            return salary < 5;
        }


        if (
            selectedSalary === "5-10"
        ) {

            return (
                salary >= 5 &&
                salary <= 10
            );
        }


        if (
            selectedSalary === "10-15"
        ) {

            return (
                salary > 10 &&
                salary <= 15
            );
        }


        if (
            selectedSalary === "15+"
        ) {

            return salary > 15;
        }


        return true;
    }


    /* =====================================================
       SORT
    ===================================================== */

    function sortJobs() {

        const sort =
            sortFilter.value;


        if (sort === "match") {

            filteredJobs.sort(
                (a, b) =>
                    b.match - a.match
            );
        }


        if (sort === "recent") {

            filteredJobs.sort(
                (a, b) =>
                    a.postedDays -
                    b.postedDays
            );
        }


        if (sort === "salary") {

            filteredJobs.sort(
                (a, b) =>
                    b.salary - a.salary
            );
        }
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderJobs() {

        jobsContainer.innerHTML = "";


        if (
            filteredJobs.length === 0
        ) {

            jobsContainer.hidden = true;

            emptyState.hidden = false;

            return;
        }


        jobsContainer.hidden = false;

        emptyState.hidden = true;


        filteredJobs.forEach(
            job => {

                jobsContainer.appendChild(
                    createJobCard(job)
                );
            }
        );
    }


    /* =====================================================
       JOB CARD
    ===================================================== */

    function createJobCard(job) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "job-card";


        const saved =
            savedJobs.has(job.id);


        card.innerHTML = `

            <div class="company-logo">
                ${escapeHTML(job.logo)}
            </div>


            <div class="job-info">

                <h3 class="job-title">
                    ${escapeHTML(job.title)}
                </h3>


                <div class="company-name">
                    ${escapeHTML(job.company)}
                </div>


                <div class="job-meta">

                    <span>
                        ◎ ${escapeHTML(job.location)}
                    </span>

                    <span>•</span>

                    <span>
                        ${escapeHTML(job.type)}
                    </span>

                    <span>•</span>

                    <span>
                        ${escapeHTML(job.salaryText)}
                    </span>

                </div>


                <div class="job-skills">

                    ${job.skills
                        .map(skill => `
                            <span class="skill">
                                ${escapeHTML(skill)}
                            </span>
                        `)
                        .join("")}

                </div>

            </div>


            <div class="job-side">

                <div class="match">

                    <span class="match-label">
                        Matching Score
                    </span>

                    <strong class="match-score">
                        ${job.match}%
                    </strong>

                </div>


                <div class="job-actions">

                    <button
                        type="button"
                        class="save-btn ${
                            saved ? "saved" : ""
                        }"
                        data-save="${job.id}"
                        title="Save Job"
                    >
                        ${saved ? "♥" : "♡"}
                    </button>


                    <button
                        type="button"
                        class="view-btn"
                        data-view="${job.id}"
                    >
                        View Job
                    </button>

                </div>

            </div>

        `;


        /* View */

        card
            .querySelector("[data-view]")
            .addEventListener(
                "click",
                () => openJobModal(job)
            );


        /* Save */

        card
            .querySelector("[data-save]")
            .addEventListener(
                "click",
                () => toggleSaved(job.id)
            );


        return card;
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* =====================================================
       SAVE JOB
    ===================================================== */

    function toggleSaved(jobId) {

        if (
            savedJobs.has(jobId)
        ) {

            savedJobs.delete(jobId);

        } else {

            savedJobs.add(jobId);
        }


        renderJobs();


        if (
            selectedJob &&
            selectedJob.id === jobId
        ) {

            updateModalSaveButton();
        }
    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary() {

        const count =
            filteredJobs.length;


        jobCount.textContent =
            `${count} ${
                count === 1
                    ? "job"
                    : "jobs"
            }`;


        if (
            count === jobs.length
        ) {

            resultSummary.textContent =
                "Showing all available jobs";

        } else {

            resultSummary.textContent =
                `Showing ${count} matching ${
                    count === 1
                        ? "opportunity"
                        : "opportunities"
                }`;
        }
    }


    /* =====================================================
       CLEAR
    ===================================================== */

    function clearFilters() {

        searchInput.value = "";

        locationFilter.value =
            "all";

        experienceFilter.value =
            "all";

        jobTypeFilter.value =
            "all";

        salaryFilter.value =
            "all";

        sortFilter.value =
            "match";


        filterJobs();
    }


    clearBtn.addEventListener(
        "click",
        clearFilters
    );


    emptyClearBtn.addEventListener(
        "click",
        clearFilters
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    searchBtn.addEventListener(
        "click",
        filterJobs
    );


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                filterJobs();
            }
        }
    );


    [
        locationFilter,
        experienceFilter,
        jobTypeFilter,
        salaryFilter
    ].forEach(filter => {

        filter.addEventListener(
            "change",
            filterJobs
        );

    });


    sortFilter.addEventListener(
        "change",
        () => {

            sortJobs();

            renderJobs();
        }
    );


    /* =====================================================
       JOB MODAL
    ===================================================== */

    function openJobModal(job) {

        selectedJob = job;


        modalLogo.textContent =
            job.logo;


        modalCompany.textContent =
            job.company;


        modalTitle.textContent =
            job.title;


        modalLocation.textContent =
            job.location;


        modalType.textContent =
            job.type;


        modalExperience.textContent =
            formatExperience(
                job.experience
            );


        modalMatch.textContent =
            `${job.match}%`;


        modalDescription.textContent =
            job.description;


        modalSkills.innerHTML =
            job.skills
                .map(skill => `
                    <span class="modal-skill">
                        ${escapeHTML(skill)}
                    </span>
                `)
                .join("");


        updateModalSaveButton();


        jobModal.hidden = false;

        document.body.style.overflow =
            "hidden";
    }


    function closeJobModal() {

        jobModal.hidden = true;

        document.body.style.overflow =
            "";

        selectedJob = null;
    }


    closeModal.addEventListener(
        "click",
        closeJobModal
    );


    jobModal.addEventListener(
        "click",
        event => {

            if (
                event.target === jobModal
            ) {

                closeJobModal();
            }
        }
    );


    /* =====================================================
       EXPERIENCE FORMAT
    ===================================================== */

    function formatExperience(
        experience
    ) {

        if (
            experience === "fresher"
        ) {

            return "Fresher";
        }


        if (
            experience === "0-2"
        ) {

            return "0 - 2 years";
        }


        if (
            experience === "2-5"
        ) {

            return "2 - 5 years";
        }


        if (
            experience === "5+"
        ) {

            return "5+ years";
        }


        return experience;
    }


    /* =====================================================
       MODAL SAVE
    ===================================================== */

    function updateModalSaveButton() {

        if (!selectedJob) {
            return;
        }


        const saved =
            savedJobs.has(
                selectedJob.id
            );


        saveBtn.textContent =
            saved
                ? "♥ Saved"
                : "♡ Save Job";
    }


    saveBtn.addEventListener(
        "click",
        () => {

            if (!selectedJob) {
                return;
            }


            toggleSaved(
                selectedJob.id
            );


            updateModalSaveButton();
        }
    );


    /* =====================================================
       APPLY
    ===================================================== */

    applyBtn.addEventListener(
        "click",
        () => {

            if (!selectedJob) {
                return;
            }


            applyBtn.innerHTML =
                "Application Started ✓";


            applyBtn.disabled =
                true;


            /*
             * Later:
             *
             * POST
             * /api/v1/applications
             *
             * {
             *     jobId: selectedJob.id
             * }
             */
        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            logoutModal.hidden =
                false;

            document.body.style.overflow =
                "hidden";
        }
    );


    cancelLogout.addEventListener(
        "click",
        () => {

            logoutModal.hidden =
                true;

            document.body.style.overflow =
                "";
        }
    );


    logoutModal.addEventListener(
        "click",
        event => {

            if (
                event.target === logoutModal
            ) {

                logoutModal.hidden =
                    true;

                document.body.style.overflow =
                    "";
            }
        }
    );


    confirmLogout.addEventListener(
        "click",
        () => {

            /*
             * Later:
             *
             * localStorage.removeItem(...)
             * and redirect to login.
             */

            window.location.href =
                "../login/login.html";
        }
    );


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (
                !jobModal.hidden
            ) {

                closeJobModal();

                return;
            }


            if (
                !logoutModal.hidden
            ) {

                logoutModal.hidden =
                    true;

                document.body.style.overflow =
                    "";
            }
        }
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    filterJobs();

});