document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       ELEMENTS
       ========================= */

    const themeToggle = document.getElementById("themeToggle");
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");


    /* =========================
       THEME FUNCTIONS
       ========================= */

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


    /* =========================
       LOAD SAVED THEME
       ========================= */

    const savedTheme =
        localStorage.getItem("nexhire-theme");

    if (savedTheme === "dark") {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }


    /* =========================
       THEME BUTTON
       ========================= */

    if (themeToggle) {

        themeToggle.addEventListener("click", function () {

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

        });
    }


    /* =========================
       PROFILE DROPDOWN
       ========================= */

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

});