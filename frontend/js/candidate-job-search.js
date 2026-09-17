/* =========================================================
   NEXHIRE - CANDIDATE JOB SEARCH
   ========================================================= */


/* =========================================================
   SAMPLE JOB DATA
   ========================================================= */

const jobs = [

    {
        id: 1,
        title: "Software Engineer",
        company: "ABC Technologies",
        location: "Kolkata",
        type: "Full Time",
        salary: "₹5-8 LPA",
        salaryValue: 8,
        posted: "2 days ago",
        skills: ["Java", "SQL", "Spring Boot"],
        description:
            "Work on scalable software applications and collaborate with development teams."
    },

    {
        id: 2,
        title: "Java Developer",
        company: "XYZ Technologies",
        location: "Bangalore",
        type: "Full Time",
        salary: "₹6-10 LPA",
        salaryValue: 10,
        posted: "1 day ago",
        skills: ["Java", "Spring", "MySQL"],
        description:
            "Develop and maintain Java-based enterprise applications."
    },

    {
        id: 3,
        title: "Frontend Developer",
        company: "TechNova",
        location: "Remote",
        type: "Full Time",
        salary: "₹4-7 LPA",
        salaryValue: 7,
        posted: "3 days ago",
        skills: ["HTML", "CSS", "JavaScript"],
        description:
            "Build responsive and user-friendly web interfaces."
    },

    {
        id: 4,
        title: "Software Engineering Intern",
        company: "Innovate Labs",
        location: "Hyderabad",
        type: "Internship",
        salary: "₹20,000/month",
        salaryValue: 2,
        posted: "5 days ago",
        skills: ["Java", "Python", "Git"],
        description:
            "Learn and contribute to real-world software development projects."
    },

    {
        id: 5,
        title: "Backend Developer",
        company: "CloudWorks",
        location: "Pune",
        type: "Full Time",
        salary: "₹7-11 LPA",
        salaryValue: 11,
        posted: "Today",
        skills: ["Java", "Spring Boot", "AWS"],
        description:
            "Develop backend services and cloud-based applications."
    }

];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

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

const profileBtn =
    document.getElementById("profileButton");

const profileMenu =
    document.getElementById("profileDropdown");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================================
   DISPLAY JOBS
   ========================================================= */

function displayJobs(jobArray) {

    jobList.innerHTML = "";


    resultCount.textContent =
        `${jobArray.length} job${jobArray.length !== 1 ? "s" : ""} found`;


    if (jobArray.length === 0) {

        noResults.classList.add("show");

        return;

    }


    noResults.classList.remove("show");


    jobArray.forEach(job => {

        const card =
            document.createElement("article");

        card.className =
            "job-card";


        const skillsHTML =
            job.skills
                .map(skill => `<span class="skill">${skill}</span>`)
                .join("");


        card.innerHTML = `

            <div class="job-card-top">

                <div class="company-logo">
                    ${job.company.charAt(0)}
                </div>

                <div class="job-main">

                    <h3 class="job-title">
                        ${job.title}
                    </h3>

                    <p class="company-name">
                        ${job.company}
                    </p>

                    <div class="job-meta">

                        <span class="job-type">
                            ${job.type}
                        </span>

                        <span class="job-location">
                            📍 ${job.location}
                        </span>

                        <span class="job-salary">
                            ${job.salary}
                        </span>

                    </div>

                </div>

            </div>


            <p class="job-description">
                ${job.description}
            </p>


            <div class="skills">
                ${skillsHTML}
            </div>


            <div class="job-footer">

                <span class="job-posted">
                    Posted ${job.posted}
                </span>

                <div class="job-actions">

                    <button
                        class="save-btn"
                        data-id="${job.id}"
                    >
                        Save
                    </button>

                    <button
                        class="view-btn"
                        data-id="${job.id}"
                    >
                        View Job
                    </button>

                </div>

            </div>

        `;


        jobList.appendChild(card);

    });


    attachJobEvents();
}


/* =========================================================
   JOB EVENTS
   ========================================================= */

function attachJobEvents() {

    const viewButtons =
        document.querySelectorAll(".view-btn");


    const saveButtons =
        document.querySelectorAll(".save-btn");


    viewButtons.forEach(button => {

        button.addEventListener("click", () => {

            const id =
                Number(button.dataset.id);

            openJobModal(id);

        });

    });


    saveButtons.forEach(button => {

        button.addEventListener("click", () => {

            button.classList.toggle("saved");


            if (button.classList.contains("saved")) {

                button.textContent =
                    "Saved";

            } else {

                button.textContent =
                    "Save";

            }

        });

    });

}


/* =========================================================
   SEARCH JOBS
   ========================================================= */

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
        jobType.value;


    let filteredJobs =
        jobs.filter(job => {

            const searchableText = `

                ${job.title}
                ${job.company}
                ${job.location}
                ${job.skills.join(" ")}

            `.toLowerCase();


            const matchesKeyword =
                keyword === "" ||
                searchableText.includes(keyword);


            const matchesLocation =
                location === "" ||
                job.location
                    .toLowerCase()
                    .includes(location);


            const matchesType =
                selectedType === "all" ||
                job.type === selectedType;


            return (
                matchesKeyword &&
                matchesLocation &&
                matchesType
            );

        });


    sortFilteredJobs(filteredJobs);

}


/* =========================================================
   SORT JOBS
   ========================================================= */

function sortFilteredJobs(jobArray) {

    const sortValue =
        sortJobs.value;


    if (sortValue === "salary") {

        jobArray.sort(
            (a, b) =>
                b.salaryValue - a.salaryValue
        );

    }


    if (sortValue === "recent") {

        jobArray.sort(
            (a, b) =>
                a.id - b.id
        );

    }


    displayJobs(jobArray);

}


/* =========================================================
   SEARCH BUTTON
   ========================================================= */

searchBtn.addEventListener(
    "click",
    searchJobs
);


/* =========================================================
   SEARCH WITH ENTER
   ========================================================= */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchJobs();

        }

    }
);


locationInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchJobs();

        }

    }
);


/* =========================================================
   SORT
   ========================================================= */

sortJobs.addEventListener(
    "change",
    searchJobs
);


/* =========================================================
   JOB MODAL
   ========================================================= */

function openJobModal(id) {

    const job =
        jobs.find(
            item => item.id === id
        );


    if (!job) {
        return;
    }


    modalContent.innerHTML = `

        <h2 class="modal-title">
            ${job.title}
        </h2>

        <p class="modal-company">
            ${job.company} • ${job.location}
        </p>


        <div class="modal-section">

            <h4>
                Job Type
            </h4>

            <p>
                ${job.type}
            </p>

        </div>


        <div class="modal-section">

            <h4>
                Salary
            </h4>

            <p>
                ${job.salary}
            </p>

        </div>


        <div class="modal-section">

            <h4>
                Required Skills
            </h4>

            <p>
                ${job.skills.join(", ")}
            </p>

        </div>


        <div class="modal-section">

            <h4>
                Job Description
            </h4>

            <p>
                ${job.description}
            </p>

        </div>


        <button
            class="modal-apply"
            type="button"
            onclick="applyForJob(${job.id})"
        >
            Apply Now
        </button>

    `;


    jobModal.classList.add("show");

}


/* =========================================================
   APPLY
   ========================================================= */

function applyForJob(id) {

    const job =
        jobs.find(
            item => item.id === id
        );


    if (!job) {
        return;
    }


    alert(
        `Application started for ${job.title} at ${job.company}.`
    );

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeJobModal() {

    jobModal.classList.remove("show");

}


closeModal.addEventListener(
    "click",
    closeJobModal
);


jobModal.addEventListener(
    "click",
    event => {

        if (event.target === jobModal) {

            closeJobModal();

        }

    }
);


/* =========================================================
   PROFILE DROPDOWN
   ========================================================= */

profileBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        profileMenu.classList.toggle("open");

    }
);


document.addEventListener(
    "click",
    () => {

        profileMenu.classList.remove("open");

    }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeJobModal();

            profileMenu.classList.remove("open");

        }

    }
);


/* =========================================================
   DARK MODE
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("nexhire-theme");


    if (savedTheme === "dark") {

        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

        themeToggle.textContent = "☀";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

    } else {

        document.documentElement.removeAttribute(
            "data-theme"
        );

        themeToggle.textContent = "☼";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );

    }

}


/* =========================================================
   THEME TOGGLE
   ========================================================= */

themeToggle.addEventListener(
    "click",
    () => {

        const html =
            document.documentElement;


        const isDark =
            html.getAttribute("data-theme")
            === "dark";


        if (isDark) {

            html.removeAttribute(
                "data-theme"
            );

            localStorage.setItem(
                "nexhire-theme",
                "light"
            );

            themeToggle.textContent = "☼";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        } else {

            html.setAttribute(
                "data-theme",
                "dark"
            );

            localStorage.setItem(
                "nexhire-theme",
                "dark"
            );

            themeToggle.textContent = "☀";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        }

    }
);


/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadTheme();

displayJobs(jobs);