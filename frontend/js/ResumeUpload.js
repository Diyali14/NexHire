document.addEventListener("DOMContentLoaded", function () {

    /* ================= THEME ================= */

    const themeToggle =
        document.getElementById("themeToggle");


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

                profileDropdown.classList.toggle(
                    "open"
                );

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



    /* ================= RESUME UPLOAD ================= */

    const uploadZone =
        document.getElementById("uploadZone");

    const resumeInput =
        document.getElementById("resumeInput");

    const selectedFile =
        document.getElementById("selectedFile");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const removeFile =
        document.getElementById("removeFile");

    const uploadError =
        document.getElementById("uploadError");

    const analyzeButton =
        document.getElementById("analyzeButton");


    const MAX_FILE_SIZE =
        5 * 1024 * 1024;


    const allowedExtensions = [
        "pdf",
        "docx",
        "txt"
    ];



    function showError(message) {

        uploadError.textContent = message;

        uploadError.classList.add("show");

    }


    function clearError() {

        uploadError.textContent = "";

        uploadError.classList.remove("show");

    }



    function formatFileSize(bytes) {

        if (bytes < 1024) {

            return bytes + " B";

        }

        if (bytes < 1024 * 1024) {

            return (
                (bytes / 1024).toFixed(1) +
                " KB"
            );

        }

        return (
            (bytes / (1024 * 1024)).toFixed(2) +
            " MB"
        );

    }



    function handleFile(file) {

        clearError();

        if (!file) {
            return;
        }


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (!allowedExtensions.includes(extension)) {

            showError(
                "Invalid file format. Please upload PDF, DOCX or TXT."
            );

            resumeInput.value = "";

            return;

        }


        if (file.size > MAX_FILE_SIZE) {

            showError(
                "File size must be less than 5 MB."
            );

            resumeInput.value = "";

            return;

        }


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatFileSize(file.size);


        selectedFile.classList.add("show");


        analyzeButton.disabled = false;

    }



    if (uploadZone && resumeInput) {

        uploadZone.addEventListener(
            "click",
            function () {

                resumeInput.click();

            }
        );


        resumeInput.addEventListener(
            "change",
            function () {

                if (resumeInput.files.length > 0) {

                    handleFile(
                        resumeInput.files[0]
                    );

                }

            }
        );


        uploadZone.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                uploadZone.classList.add(
                    "dragover"
                );

            }
        );


        uploadZone.addEventListener(
            "dragleave",
            function () {

                uploadZone.classList.remove(
                    "dragover"
                );

            }
        );


        uploadZone.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();

                uploadZone.classList.remove(
                    "dragover"
                );


                const files =
                    event.dataTransfer.files;


                if (files.length > 0) {

                    handleFile(files[0]);

                }

            }
        );

    }



    /* ================= REMOVE FILE ================= */

    if (removeFile) {

        removeFile.addEventListener(
            "click",
            function () {

                resumeInput.value = "";

                selectedFile.classList.remove(
                    "show"
                );

                analyzeButton.disabled = true;

                clearError();

            }
        );

    }



    /* ================= UPLOAD / PROCESS ================= */

    const processingOverlay =
        document.getElementById(
            "processingOverlay"
        );


    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            function () {

                if (
                    !resumeInput.files ||
                    resumeInput.files.length === 0
                ) {

                    showError(
                        "Please select a resume first."
                    );

                    return;

                }


                processingOverlay.classList.add(
                    "show"
                );


                /*
                 * Frontend demonstration only.
                 *
                 * Later this section will send
                 * the resume to the backend API.
                 */

                setTimeout(
                    function () {

                        processingOverlay.classList.remove(
                            "show"
                        );

                        alert(
                            "Resume uploaded successfully!"
                        );

                    },
                    1500
                );

            }
        );

    }



    /* ================= GUIDELINES MODAL ================= */

    const formatButton =
        document.getElementById(
            "formatButton"
        );

    const formatModal =
        document.getElementById(
            "formatModal"
        );

    const modalClose =
        document.getElementById(
            "modalClose"
        );

    const modalDone =
        document.getElementById(
            "modalDone"
        );


    function closeModal() {

        formatModal.classList.remove(
            "show"
        );

    }


    if (formatButton) {

        formatButton.addEventListener(
            "click",
            function () {

                formatModal.classList.add(
                    "show"
                );

            }
        );

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalDone) {

        modalDone.addEventListener(
            "click",
            closeModal
        );

    }


    if (formatModal) {

        formatModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === formatModal
                ) {

                    closeModal();

                }

            }
        );

    }

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