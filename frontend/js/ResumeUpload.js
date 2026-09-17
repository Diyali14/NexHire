/* =========================================================
   NEXHIRE - RESUME UPLOAD PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTS ================= */

    const themeBtn = document.getElementById("themeBtn");

    const dropZone = document.getElementById("dropZone");

    const browseBtn = document.getElementById("browseBtn");

    const resumeInput = document.getElementById("resumeInput");

    const selectedFile = document.getElementById("selectedFile");

    const fileName = document.getElementById("fileName");

    const fileSize = document.getElementById("fileSize");

    const fileIcon = document.getElementById("fileIcon");

    const removeFileBtn =
        document.getElementById("removeFileBtn");

    const errorMessage =
        document.getElementById("errorMessage");

    const analyzeBtn =
        document.getElementById("analyzeBtn");


    /* Format modal */

    const formatModal =
        document.getElementById("formatModal");

    const closeFormatModal =
        document.getElementById("closeFormatModal");

    const cancelFormatBtn =
        document.getElementById("cancelFormatBtn");

    const modalFormatButtons =
        document.querySelectorAll(".modal-format-btn");


    /* Processing */

    const processingOverlay =
        document.getElementById("processingOverlay");

    const processingText =
        document.getElementById("processingText");

    const progressBar =
        document.getElementById("progressBar");

    const progressPercentage =
        document.getElementById("progressPercentage");


    const steps = [
        document.getElementById("step1"),
        document.getElementById("step2"),
        document.getElementById("step3"),
        document.getElementById("step4")
    ];


    /* ================= STATE ================= */

    let currentFile = null;


    const MAX_FILE_SIZE =
        10 * 1024 * 1024;


    const ACCEPTED_EXTENSIONS = [
        ".pdf",
        ".docx",
        ".txt"
    ];


    /* =========================================================
       THEME
       ========================================================= */

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add("light-preview");

            themeBtn.textContent = "☾";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeBtn.setAttribute(
                "title",
                "Switch to dark mode"
            );

        } else {

            document.body.classList.remove("light-preview");

            themeBtn.textContent = "☀";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeBtn.setAttribute(
                "title",
                "Switch to light mode"
            );
        }
    }


    const savedTheme =
        localStorage.getItem("nexhire-theme") || "dark";


    applyTheme(savedTheme);


    themeBtn.addEventListener("click", () => {

        const isLight =
            document.body.classList.contains("light-preview");

        const nextTheme =
            isLight ? "dark" : "light";

        applyTheme(nextTheme);

        localStorage.setItem(
            "nexhire-theme",
            nextTheme
        );
    });


    /* =========================================================
       ERROR
       ========================================================= */

    function showError(message) {

        errorMessage.textContent = message;

        errorMessage.hidden = false;
    }


    function clearError() {

        errorMessage.textContent = "";

        errorMessage.hidden = true;
    }


    /* =========================================================
       FORMAT MODAL
       ========================================================= */

    function openFormatModal() {

        formatModal.hidden = false;

        document.body.style.overflow = "hidden";

        setTimeout(() => {

            closeFormatModal.focus();

        }, 0);
    }


    function closeFormatSelectionModal() {

        formatModal.hidden = true;

        document.body.style.overflow = "";
    }


    /* Browse Documents */

    browseBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();

        openFormatModal();
    });


    /* Clicking drop zone opens format popup */

    dropZone.addEventListener("click", (event) => {

        /*
         * If user clicked the Browse Documents button,
         * don't open the modal twice.
         */
        if (event.target.closest("#browseBtn")) {
            return;
        }

        openFormatModal();
    });


    /* Close button */

    closeFormatModal.addEventListener(
        "click",
        closeFormatSelectionModal
    );


    /* Cancel */

    cancelFormatBtn.addEventListener(
        "click",
        closeFormatSelectionModal
    );


    /* Click outside modal */

    formatModal.addEventListener("click", (event) => {

        if (event.target === formatModal) {

            closeFormatSelectionModal();
        }
    });


    /* Escape key */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            !formatModal.hidden
        ) {

            closeFormatSelectionModal();
        }
    });


    /* =========================================================
       FORMAT SELECTION
       ========================================================= */

    modalFormatButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const type =
                button.dataset.type;

            if (type === "pdf") {

                resumeInput.accept = ".pdf";

            } else if (type === "docx") {

                resumeInput.accept = ".docx";

            } else if (type === "txt") {

                resumeInput.accept = ".txt";

            }

            closeFormatSelectionModal();

            /*
             * Small delay ensures the modal closes visually
             * before the native file picker opens.
             */
            setTimeout(() => {

                resumeInput.click();

            }, 100);
        });

    });


    /* =========================================================
       FILE INPUT
       ========================================================= */

    resumeInput.addEventListener("change", () => {

        const file = resumeInput.files[0];

        if (!file) {
            return;
        }

        handleFile(file);
    });


    /* =========================================================
       FILE VALIDATION
       ========================================================= */

    function getExtension(file) {

        const name =
            file.name.toLowerCase();

        const lastDot =
            name.lastIndexOf(".");

        if (lastDot === -1) {
            return "";
        }

        return name.substring(lastDot);
    }


    function validateFile(file) {

        clearError();


        if (!file) {

            showError(
                "Please select a resume file."
            );

            return false;
        }


        const extension =
            getExtension(file);


        if (
            !ACCEPTED_EXTENSIONS.includes(extension)
        ) {

            showError(
                "Unsupported file type. Please upload a PDF, DOCX or TXT file."
            );

            return false;
        }


        if (file.size > MAX_FILE_SIZE) {

            showError(
                "File size exceeds 10 MB. Please choose a smaller resume."
            );

            return false;
        }


        return true;
    }


    /* =========================================================
       HANDLE FILE
       ========================================================= */

    function handleFile(file) {

        if (!validateFile(file)) {

            currentFile = null;

            selectedFile.hidden = true;

            analyzeBtn.disabled = true;

            resumeInput.value = "";

            return;
        }


        currentFile = file;


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatFileSize(file.size);


        fileIcon.textContent =
            getFileIcon(file);


        selectedFile.hidden = false;

        analyzeBtn.disabled = false;

        clearError();
    }


    /* File icon */

    function getFileIcon(file) {

        const extension =
            getExtension(file);


        if (extension === ".pdf") {
            return "📄";
        }


        if (extension === ".docx") {
            return "📝";
        }


        if (extension === ".txt") {
            return "📃";
        }


        return "📄";
    }


    /* File size */

    function formatFileSize(bytes) {

        if (bytes < 1024) {

            return `${bytes} B`;
        }


        if (bytes < 1024 * 1024) {

            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }


        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;
    }


    /* =========================================================
       DRAG & DROP
       ========================================================= */

    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            dropZone.classList.add(
                "drag-active"
            );
        }
    );


    dropZone.addEventListener(
        "dragenter",
        (event) => {

            event.preventDefault();

            dropZone.classList.add(
                "drag-active"
            );
        }
    );


    dropZone.addEventListener(
        "dragleave",
        (event) => {

            /*
             * Only remove the class when the pointer
             * actually leaves the drop zone.
             */
            if (
                !dropZone.contains(
                    event.relatedTarget
                )
            ) {

                dropZone.classList.remove(
                    "drag-active"
                );
            }
        }
    );


    dropZone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            dropZone.classList.remove(
                "drag-active"
            );


            const files =
                event.dataTransfer.files;


            if (!files || files.length === 0) {
                return;
            }


            handleFile(files[0]);
        }
    );


    /* =========================================================
       REMOVE FILE
       ========================================================= */

    removeFileBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            currentFile = null;

            resumeInput.value = "";

            selectedFile.hidden = true;

            analyzeBtn.disabled = true;

            clearError();
        }
    );


    /* =========================================================
       ANALYZE RESUME
       ========================================================= */

    analyzeBtn.addEventListener(
        "click",
        () => {

            if (!currentFile) {

                showError(
                    "Please select a resume before continuing."
                );

                return;
            }


            startProcessing();
        }
    );


    /* =========================================================
       DEMO PROCESSING
       ========================================================= */

    function startProcessing() {

        processingOverlay.hidden = false;

        document.body.style.overflow = "hidden";


        let progress = 0;


        const messages = [
            "Reading your document...",
            "Extracting information...",
            "Identifying your skills...",
            "Building your career profile..."
        ];


        steps.forEach((step, index) => {

            if (!step) {
                return;
            }

            step.classList.remove(
                "active",
                "completed"
            );

            if (index === 0) {

                step.classList.add(
                    "active"
                );
            }
        });


        progressBar.style.width = "0%";

        progressPercentage.textContent = "0%";

        processingText.textContent =
            messages[0];


        /*
         * Demo timer.
         *
         * Later this section will be replaced with:
         *
         * POST /api/v1/resumes/upload
         *
         * and Spring Boot → Python AI service.
         */
        const interval =
            setInterval(() => {

                progress += 5;


                progressBar.style.width =
                    `${progress}%`;


                progressPercentage.textContent =
                    `${progress}%`;


                updateProcessingStep(
                    progress,
                    messages
                );


                if (progress >= 100) {

                    clearInterval(interval);


                    setTimeout(() => {

                        /*
                         * Demo redirect.
                         *
                         * Replace this with the actual
                         * candidate dashboard / result page
                         * once backend integration is ready.
                         */
                        window.location.href =
                            "../dashboard/index.html";

                    }, 600);
                }

            }, 120);
    }


    /* =========================================================
       PROCESSING STEPS
       ========================================================= */

    function updateProcessingStep(
        progress,
        messages
    ) {

        let activeIndex = 0;


        if (progress >= 25) {
            activeIndex = 1;
        }

        if (progress >= 50) {
            activeIndex = 2;
        }

        if (progress >= 75) {
            activeIndex = 3;
        }


        processingText.textContent =
            messages[activeIndex];


        steps.forEach((step, index) => {

            if (!step) {
                return;
            }


            step.classList.remove(
                "active",
                "completed"
            );


            if (index < activeIndex) {

                step.classList.add(
                    "completed"
                );

            } else if (index === activeIndex) {

                step.classList.add(
                    "active"
                );
            }

        });


        /*
         * At 100%, mark all steps completed.
         */
        if (progress >= 100) {

            steps.forEach((step) => {

                if (!step) {
                    return;
                }

                step.classList.remove(
                    "active"
                );

                step.classList.add(
                    "completed"
                );

            });
        }
    }

});