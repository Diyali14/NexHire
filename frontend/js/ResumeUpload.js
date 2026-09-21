/* =========================================================
   NEXHIRE — CANDIDATE
   Resume Upload Page
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       THEME
       Light mode  → ☼
       Dark mode   → ☀
       ========================================================= */

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


    const savedTheme =
        localStorage.getItem("nexhire-theme");

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
                    document.documentElement.getAttribute(
                        "data-theme"
                    );

                const newTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";

                applyTheme(newTheme);

                localStorage.setItem(
                    "nexhire-theme",
                    newTheme
                );
            }
        );
    }


    /* =========================================================
       PROFILE DROPDOWN
       ========================================================= */

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");


    if (
        profileButton &&
        profileDropdown
    ) {

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
                    isOpen ? "true" : "false"
                );
            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !profileDropdown.contains(
                        event.target
                    ) &&
                    !profileButton.contains(
                        event.target
                    )
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
    }


    /* =========================================================
       RESUME UPLOAD ELEMENTS
       ========================================================= */

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

    const processingOverlay =
        document.getElementById("processingOverlay");


    /* =========================================================
       FILE RULES
       ========================================================= */

    const MAX_FILE_SIZE =
        5 * 1024 * 1024; // 5 MB

    const allowedExtensions = [
        "pdf",
        "jpeg",
        "jpg",
        "txt"
    ];


    /* =========================================================
       ERROR FUNCTIONS
       ========================================================= */

    function showError(message) {

        if (!uploadError) {
            return;
        }

        uploadError.textContent =
            message;

        uploadError.classList.add(
            "show"
        );
    }


    function clearError() {

        if (!uploadError) {
            return;
        }

        uploadError.textContent = "";

        uploadError.classList.remove(
            "show"
        );
    }


    /* =========================================================
       FILE SIZE FORMAT
       ========================================================= */

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


    /* =========================================================
       RESET SELECTED FILE
       ========================================================= */

    function resetSelectedFile() {

        if (resumeInput) {
            resumeInput.value = "";
        }

        if (selectedFile) {
            selectedFile.classList.remove("show");
        }

        if (fileName) {
            fileName.textContent = "";
        }

        if (fileSize) {
            fileSize.textContent = "";
        }

        if (analyzeButton) {
            analyzeButton.disabled = true;
        }
    }


    /* =========================================================
       HANDLE SELECTED FILE
       ========================================================= */

    function handleFile(file) {

        clearError();

        if (!file) {
            return;
        }


        /* Get extension */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        /* Check extension */

        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            showError(
                "Invalid file format. Please upload PDF, JPEG or TXT."
            );

            resetSelectedFile();

            return;
        }


        /* Check file size */

        if (file.size > MAX_FILE_SIZE) {

            showError(
                "File size must be less than 5 MB."
            );

            resetSelectedFile();

            return;
        }


        /* Show file information */

        if (fileName) {
            fileName.textContent =
                file.name;
        }

        if (fileSize) {
            fileSize.textContent =
                formatFileSize(file.size);
        }

        if (selectedFile) {
            selectedFile.classList.add("show");
        }

        if (analyzeButton) {
            analyzeButton.disabled = false;
        }
    }


    /* =========================================================
       CLICK TO UPLOAD
       ========================================================= */

    if (
        uploadZone &&
        resumeInput
    ) {

        uploadZone.addEventListener(
            "click",
            function () {

                resumeInput.click();
            }
        );


        /* File selected */

        resumeInput.addEventListener(
            "change",
            function () {

                if (
                    resumeInput.files &&
                    resumeInput.files.length > 0
                ) {

                    handleFile(
                        resumeInput.files[0]
                    );
                }
            }
        );


        /* =====================================================
           DRAG OVER
           ===================================================== */

        uploadZone.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                uploadZone.classList.add(
                    "dragover"
                );
            }
        );


        /* =====================================================
           DRAG LEAVE
           ===================================================== */

        uploadZone.addEventListener(
            "dragleave",
            function () {

                uploadZone.classList.remove(
                    "dragover"
                );
            }
        );


        /* =====================================================
           DROP
           ===================================================== */

        uploadZone.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();

                uploadZone.classList.remove(
                    "dragover"
                );


                const files =
                    event.dataTransfer.files;


                if (
                    !files ||
                    files.length === 0
                ) {
                    return;
                }


                const file =
                    files[0];


                /*
                   Put dropped file into
                   the input when supported.
                */

                try {

                    const dataTransfer =
                        new DataTransfer();

                    dataTransfer.items.add(
                        file
                    );

                    resumeInput.files =
                        dataTransfer.files;

                } catch (error) {

                    console.warn(
                        "Could not assign dropped file to input.",
                        error
                    );
                }


                handleFile(file);
            }
        );
    }


    /* =========================================================
       REMOVE FILE
       ========================================================= */

    if (removeFile) {

        removeFile.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                resetSelectedFile();

                clearError();
            }
        );
    }


    /* =========================================================
       UPLOAD RESUME TO BACKEND
       ========================================================= */

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            async function () {

                clearError();


                /* =================================================
                   CHECK FILE
                   ================================================= */

                if (
                    !resumeInput ||
                    !resumeInput.files ||
                    resumeInput.files.length === 0
                ) {

                    showError(
                        "Please select a resume first."
                    );

                    return;
                }


                const file =
                    resumeInput.files[0];


                /* =================================================
                   CHECK LOGIN
                   ================================================= */

                const token =
                    sessionStorage.getItem(
                        "token"
                    );


                console.log(
                    "Token available:",
                    !!token
                );


                if (!token) {

                    showError(
                        "Please login first."
                    );

                    return;
                }


                /* =================================================
                   CREATE FORM DATA
                   ================================================= */

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );


                /* =================================================
                   SHOW PROCESSING
                   ================================================= */

                if (processingOverlay) {

                    processingOverlay.classList.add(
                        "show"
                    );
                }

                analyzeButton.disabled = true;


                try {

                    /* =================================================
                       API CALL

                       POST /api/v1/resumes
                    ================================================= */

                    const result =
                        await apiPostFormData(
                            "/resumes",
                            formData
                        );


                    console.log(
                        "Resume API response:",
                        result
                    );


                    /* =================================================
                       HIDE PROCESSING
                    ================================================= */

                    if (processingOverlay) {

                        processingOverlay.classList.remove(
                            "show"
                        );
                    }


                    /* =================================================
                       SAVE RESUME ID
                    ================================================= */

                    if (
                        result &&
                        result.resumeId
                    ) {

                        localStorage.setItem(
                            "resumeId",
                            result.resumeId
                        );
                    }


                    /* =================================================
                       SUCCESS
                    ================================================= */

                    alert(
                        result &&
                        result.message
                            ? result.message
                            : "Resume uploaded successfully!"
                    );


                    /*
                       Keep button disabled because
                       the current file has already
                       been uploaded.
                    */

                    analyzeButton.disabled = true;


                } catch (error) {

                    console.error(
                        "Resume upload error:",
                        error
                    );


                    /* Hide processing */

                    if (processingOverlay) {

                        processingOverlay.classList.remove(
                            "show"
                        );
                    }


                    /* =================================================
                       AUTHENTICATION ERROR
                    ================================================= */

                    if (error.status === 401) {

                        showError(
                            "Your login session has expired. Please login again."
                        );

                    } else if (error.status === 403) {

                        showError(
                            "Access denied. Please login again."
                        );

                    } else {

                        showError(
                            error.message ||
                            "Unable to upload resume. Please try again."
                        );
                    }


                    analyzeButton.disabled = false;
                }
            }
        );
    }


    /* =========================================================
       GUIDELINES MODAL
       ========================================================= */

    const formatButton =
        document.getElementById("formatButton");

    const formatModal =
        document.getElementById("formatModal");

    const modalClose =
        document.getElementById("modalClose");

    const modalDone =
        document.getElementById("modalDone");


    function closeModal() {

        if (formatModal) {

            formatModal.classList.remove(
                "show"
            );
        }
    }


    if (formatButton) {

        formatButton.addEventListener(
            "click",
            function () {

                if (formatModal) {

                    formatModal.classList.add(
                        "show"
                    );
                }
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


    /* Close modal when clicking outside */

    if (formatModal) {

        formatModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    formatModal
                ) {

                    closeModal();
                }
            }
        );
    }


    /* =========================================================
       ESCAPE KEY
       ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeModal();

                if (profileDropdown) {

                    profileDropdown.classList.remove(
                        "open"
                    );
                }

                if (profileButton) {

                    profileButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );

});


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            /* Remove authentication */

            sessionStorage.removeItem(
                "token"
            );


            /* Remove candidate data */

            localStorage.removeItem(
                "resumeId"
            );

            localStorage.removeItem(
                "candidateId"
            );

            localStorage.removeItem(
                "candidateName"
            );


            /* Clear remaining session data */

            sessionStorage.clear();


            /* Redirect to login */

            window.location.href =
                "candidate-login.html";
        }
    );
}


/* =========================================================
   PARSED RESUME DATA
   TEST FROM BROWSER CONSOLE
   ========================================================= */

async function getParsedResumeData(resumeId) {

    try {

        console.log(
            "Fetching parsed resume data for resume:",
            resumeId
        );


        const data =
            await apiGet(
                `/resumes/${resumeId}/parsed-data`
            );


        console.log(
            "Parsed Resume Data:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "Parsed Resume API Error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   MAKE TEST FUNCTION AVAILABLE
   ========================================================= */

window.getParsedResumeData =
    getParsedResumeData;