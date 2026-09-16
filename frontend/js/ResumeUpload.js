document.addEventListener("DOMContentLoaded", function () {

    console.log("NexHire upload.js loaded successfully");


    /* =====================================================
       GET ELEMENTS
       ===================================================== */

    const resumeInput =
        document.getElementById("resumeInput");

    const browseBtn =
        document.getElementById("browseBtn");

    const dropZone =
        document.getElementById("dropZone");

    const selectedFile =
        document.getElementById("selectedFile");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const removeFile =
        document.getElementById("removeFile");

    const analyzeBtn =
        document.getElementById("analyzeBtn");

    const errorMessage =
        document.getElementById("errorMessage");

    const errorText =
        document.getElementById("errorText");

    const themeBtn =
        document.getElementById("themeBtn");

    const processingOverlay =
        document.getElementById("processingOverlay");

    const progressBar =
        document.getElementById("progressBar");

    const progressPercentage =
        document.getElementById("progressPercentage");

    const processingText =
        document.getElementById("processingText");


    /* =====================================================
       CHECK ELEMENTS
       ===================================================== */

    if (!resumeInput) {
        console.error("resumeInput not found");
        return;
    }

    if (!browseBtn) {
        console.error("browseBtn not found");
        return;
    }

    if (!dropZone) {
        console.error("dropZone not found");
        return;
    }

    if (!themeBtn) {
        console.error("themeBtn not found");
        return;
    }


    /* =====================================================
       VARIABLES
       ===================================================== */

    let selectedResume = null;

    const allowedExtensions = [
        "pdf",
        "docx",
        "txt"
    ];

    const maxFileSize =
        10 * 1024 * 1024;


    /* =====================================================
       THEME
       ===================================================== */

    function updateThemeButton() {

        const isLight =
            document.body.classList.contains(
                "light-preview"
            );

        if (isLight) {

            themeBtn.textContent = "☀";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeBtn.title =
                "Switch to dark mode";

        } else {

            themeBtn.textContent = "☾";

            themeBtn.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeBtn.title =
                "Switch to light mode";
        }
    }


    function loadTheme() {

        const savedTheme =
            localStorage.getItem(
                "nexhire-theme"
            );

        if (savedTheme === "light") {

            document.body.classList.add(
                "light-preview"
            );

        } else {

            document.body.classList.remove(
                "light-preview"
            );
        }

        updateThemeButton();
    }


    themeBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const isCurrentlyLight =
                document.body.classList.contains(
                    "light-preview"
                );

            if (isCurrentlyLight) {

                document.body.classList.remove(
                    "light-preview"
                );

                localStorage.setItem(
                    "nexhire-theme",
                    "dark"
                );

            } else {

                document.body.classList.add(
                    "light-preview"
                );

                localStorage.setItem(
                    "nexhire-theme",
                    "light"
                );
            }

            updateThemeButton();

        }
    );


    loadTheme();


    /* =====================================================
       BROWSE FILES
       ===================================================== */

    browseBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                "Browse Files clicked"
            );

            resumeInput.click();

        }
    );


    /* =====================================================
       CLICK DROP ZONE
       ===================================================== */

    dropZone.addEventListener(
        "click",
        function (event) {

            /*
             * Agar Browse Files button par click hua hai
             * to dobara input.click() nahi karna.
             */

            if (
                event.target.closest(
                    "#browseBtn"
                )
            ) {
                return;
            }

            console.log(
                "Drop zone clicked"
            );

            resumeInput.click();

        }
    );


    /* =====================================================
       KEYBOARD ACCESS
       ===================================================== */

    dropZone.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                resumeInput.click();
            }

        }
    );


    /* =====================================================
       FILE INPUT CHANGE
       ===================================================== */

    resumeInput.addEventListener(
        "change",
        function () {

            console.log(
                "File selected from picker"
            );

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

    dropZone.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            dropZone.classList.add(
                "dragging"
            );

        }
    );


    /* =====================================================
       DRAG LEAVE
       ===================================================== */

    dropZone.addEventListener(
        "dragleave",
        function () {

            dropZone.classList.remove(
                "dragging"
            );

        }
    );


    /* =====================================================
       DROP
       ===================================================== */

    dropZone.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            dropZone.classList.remove(
                "dragging"
            );

            const files =
                event.dataTransfer.files;

            if (
                files &&
                files.length > 0
            ) {

                handleFile(files[0]);
            }

        }
    );


    /* =====================================================
       HANDLE FILE
       ===================================================== */

    function handleFile(file) {

        hideError();

        if (!file) {
            return;
        }


        /* Get extension */

        const nameParts =
            file.name.split(".");

        const extension =
            nameParts.length > 1
                ? nameParts
                    .pop()
                    .toLowerCase()
                : "";


        /* Validate extension */

        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            showError(
                "Please upload a PDF, DOCX or TXT resume."
            );

            resetFile();

            return;
        }


        /* Validate size */

        if (
            file.size > maxFileSize
        ) {

            showError(
                "File size must be less than 10 MB."
            );

            resetFile();

            return;
        }


        /* Save file */

        selectedResume = file;


        /* Show file */

        showSelectedFile(file);


        console.log(
            "Valid resume selected:",
            file.name
        );

    }


    /* =====================================================
       SHOW SELECTED FILE
       ===================================================== */

    function showSelectedFile(file) {

        if (fileName) {

            fileName.textContent =
                file.name;
        }


        if (fileSize) {

            fileSize.textContent =
                formatFileSize(
                    file.size
                );
        }


        if (selectedFile) {

            selectedFile.hidden =
                false;
        }


        if (analyzeBtn) {

            analyzeBtn.disabled =
                false;
        }


        dropZone.hidden =
            true;

    }


    /* =====================================================
       FORMAT FILE SIZE
       ===================================================== */

    function formatFileSize(bytes) {

        if (bytes < 1024) {

            return bytes + " B";
        }


        if (
            bytes <
            1024 * 1024
        ) {

            return (
                bytes / 1024
            ).toFixed(1) +
            " KB";
        }


        return (
            bytes /
            (1024 * 1024)
        ).toFixed(1) +
        " MB";
    }


    /* =====================================================
       REMOVE FILE
       ===================================================== */

    if (removeFile) {

        removeFile.addEventListener(
            "click",
            function () {

                resetFile();

            }
        );

    }


    /* =====================================================
       RESET FILE
       ===================================================== */

    function resetFile() {

        selectedResume = null;


        resumeInput.value = "";


        if (selectedFile) {

            selectedFile.hidden =
                true;
        }


        if (analyzeBtn) {

            analyzeBtn.disabled =
                true;
        }


        dropZone.hidden =
            false;


        hideError();

    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(message) {

        if (errorText) {

            errorText.textContent =
                message;
        }


        if (errorMessage) {

            errorMessage.hidden =
                false;
        }

    }


    function hideError() {

        if (errorMessage) {

            errorMessage.hidden =
                true;
        }

    }


    /* =====================================================
       ANALYZE BUTTON
       ===================================================== */

    if (analyzeBtn) {

        analyzeBtn.addEventListener(
            "click",
            function () {

                if (!selectedResume) {

                    showError(
                        "Please select your resume first."
                    );

                    return;
                }


                startProcessing();

            }
        );

    }


    /* =====================================================
       PROCESSING
       ===================================================== */

    function startProcessing() {

        if (!processingOverlay) {
            return;
        }


        processingOverlay.hidden =
            false;


        if (analyzeBtn) {

            analyzeBtn.disabled =
                true;
        }


        let progress = 0;


        /*
         * Reset steps
         */

        resetProcessingSteps();


        /*
         * Initial state
         */

        progressBar.style.width =
            "0%";

        progressPercentage.textContent =
            "0%";


        processingText.textContent =
            "Reading your document...";


        /*
         * Demo processing
         *
         * Later yahan real API call lagegi:
         *
         * POST /api/v1/resumes/upload
         */

        const interval =
            setInterval(
                function () {

                    progress += 5;


                    if (progress > 100) {

                        progress = 100;
                    }


                    progressBar.style.width =
                        progress + "%";


                    progressPercentage.textContent =
                        progress + "%";


                    updateProcessingStep(
                        progress
                    );


                    if (
                        progress >= 100
                    ) {

                        clearInterval(
                            interval
                        );


                        processingText.textContent =
                            "Resume analysis completed!";


                        setTimeout(
                            function () {

                                /*
                                 * DEMO ONLY
                                 *
                                 * Backend connect hone ke baad
                                 * yahan result page open karna.
                                 */

                                window.location.href =
                                    "../dashboard/index.html";

                            },
                            1000
                        );

                    }

                },
                180
            );

    }


    /* =====================================================
       RESET PROCESSING STEPS
       ===================================================== */

    function resetProcessingSteps() {

        const steps = [
            "step1",
            "step2",
            "step3",
            "step4"
        ];


        steps.forEach(
            function (id) {

                const step =
                    document.getElementById(
                        id
                    );

                if (!step) {
                    return;
                }


                step.classList.remove(
                    "active"
                );

                step.classList.remove(
                    "completed"
                );

            }
        );


        const firstStep =
            document.getElementById(
                "step1"
            );


        if (firstStep) {

            firstStep.classList.add(
                "active"
            );
        }

    }


    /* =====================================================
       UPDATE PROCESSING STEPS
       ===================================================== */

    function updateProcessingStep(
        progress
    ) {

        const step1 =
            document.getElementById(
                "step1"
            );

        const step2 =
            document.getElementById(
                "step2"
            );

        const step3 =
            document.getElementById(
                "step3"
            );

        const step4 =
            document.getElementById(
                "step4"
            );


        /* Step 1 */

        if (progress >= 20) {

            step1.classList.remove(
                "active"
            );

            step1.classList.add(
                "completed"
            );
        }


        /* Step 2 */

        if (progress >= 25) {

            step2.classList.add(
                "active"
            );
        }


        if (progress >= 50) {

            step2.classList.remove(
                "active"
            );

            step2.classList.add(
                "completed"
            );
        }


        /* Step 3 */

        if (progress >= 50) {

            step3.classList.add(
                "active"
            );
        }


        if (progress >= 75) {

            step3.classList.remove(
                "active"
            );

            step3.classList.add(
                "completed"
            );
        }


        /* Step 4 */

        if (progress >= 75) {

            step4.classList.add(
                "active"
            );
        }


        if (progress >= 100) {

            step4.classList.remove(
                "active"
            );

            step4.classList.add(
                "completed"
            );
        }


        /* Text */

        if (progress < 25) {

            processingText.textContent =
                "Reading your document...";

        } else if (
            progress < 50
        ) {

            processingText.textContent =
                "Extracting information...";

        } else if (
            progress < 75
        ) {

            processingText.textContent =
                "Identifying your skills...";

        } else if (
            progress < 100
        ) {

            processingText.textContent =
                "Building your career profile...";

        } else {

            processingText.textContent =
                "Resume analysis completed!";
        }

    }


    console.log(
        "NexHire upload page initialized"
    );

});