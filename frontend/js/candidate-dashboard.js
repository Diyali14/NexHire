/* =========================================================
   NexHire — Candidate Dashboard
   ========================================================= */


// =========================================================
// THEME TOGGLE
// =========================================================

const themeToggle =
    document.getElementById("themeToggle");

const savedTheme =
    localStorage.getItem("nexhire-theme");


if (savedTheme === "dark") {

    document.documentElement
        .setAttribute("data-theme", "dark");

}


themeToggle.addEventListener("click", () => {

    const currentTheme =
        document.documentElement
            .getAttribute("data-theme");


    if (currentTheme === "dark") {

        document.documentElement
            .removeAttribute("data-theme");

        localStorage.setItem(
            "nexhire-theme",
            "light"
        );

    } else {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

        localStorage.setItem(
            "nexhire-theme",
            "dark"
        );

    }

});


// =========================================================
// PROFILE DROPDOWN
// =========================================================

const profileButton =
    document.getElementById("profileButton");

const profileDropdown =
    document.getElementById("profileDropdown");


profileButton.addEventListener("click", (event) => {

    event.stopPropagation();

    profileDropdown.classList.toggle("open");

});


document.addEventListener("click", (event) => {

    if (
        !profileButton.contains(event.target) &&
        !profileDropdown.contains(event.target)
    ) {

        profileDropdown.classList.remove("open");

    }

});