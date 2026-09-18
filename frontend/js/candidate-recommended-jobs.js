document.addEventListener("DOMContentLoaded", function () {

    /* ================= THEME ================= */

    const themeToggle = document.getElementById("themeToggle");

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
            }
        }
    }


    const savedTheme =
        localStorage.getItem("nexhire-theme");


    if (savedTheme === "dark") {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    document.documentElement.getAttribute(
                        "data-theme"
                    );


                if (currentTheme === "dark") {

                    applyTheme("light");

                    localStorage.setItem(
                        "nexhire-theme",
                        "light"
                    );

                } else {

                    applyTheme("dark");

                    localStorage.setItem(
                        "nexhire-theme",
                        "dark"
                    );
                }

            }
        );

    }



    /* ================= PROFILE DROPDOWN ================= */

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");


    if (profileButton && profileDropdown) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileDropdown.classList.toggle("open");

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !profileDropdown.contains(event.target) &&
                    !profileButton.contains(event.target)
                ) {

                    profileDropdown.classList.remove(
                        "open"
                    );

                }

            }
        );

    }



    

    /* ================= RECOMMENDED JOBS SEARCH ================= */

    const searchInput =
        document.getElementById("jobSearchInput");

    const recommendationCards =
        document.querySelectorAll(".recommendation-card");

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchText =
                searchInput.value.toLowerCase().trim();

            recommendationCards.forEach(function (card) {

                const jobText =
                    card.textContent.toLowerCase();

                if (jobText.includes(searchText)) {

                    card.style.display = "grid";

                } else {

                    card.style.display = "none";

                }

            });

        });

    }



    /* ================= SKILL INTERACTION ================= */

    const skillPills =
        document.querySelectorAll(".skill-pill");


    skillPills.forEach(function (skill) {

        skill.addEventListener(
            "click",
            function () {

                skill.classList.toggle(
                    "selected"
                );

            }
        );

    });

});

// ================= LOGOUT =================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {
            return;
        }

        // Remove temporary login/session data
        localStorage.removeItem("candidateId");
        localStorage.removeItem("candidateName");

        sessionStorage.clear();

        // Redirect to login page
        window.location.href = "candidate-login.html";
    });
}