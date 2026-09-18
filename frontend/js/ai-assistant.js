/* =========================================================
   NexHire - Candidate AI Assistant
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       THEME TOGGLE
       ===================================================== */

    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");

            if (themeToggle) {
                themeToggle.textContent = "☀";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );
            }
        } else {
            document.documentElement.removeAttribute("data-theme");

            if (themeToggle) {
                themeToggle.textContent = "☼";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark mode"
                );
            }
        }
    }

    const savedTheme = localStorage.getItem("nexhire-theme");

    if (savedTheme === "dark") {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {

            const currentTheme =
                document.documentElement.getAttribute("data-theme");

            if (currentTheme === "dark") {
                applyTheme("light");
                localStorage.setItem("nexhire-theme", "light");
            } else {
                applyTheme("dark");
                localStorage.setItem("nexhire-theme", "dark");
            }
        });
    }


    /* =====================================================
       PROFILE DROPDOWN
       ===================================================== */

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");

    if (profileButton && profileDropdown) {

        profileButton.addEventListener("click", function (event) {

            event.stopPropagation();

            profileDropdown.classList.toggle("open");
        });

        document.addEventListener("click", function (event) {

            if (
                !profileDropdown.contains(event.target) &&
                !profileButton.contains(event.target)
            ) {
                profileDropdown.classList.remove("open");
            }
        });
    }


    /* =====================================================
       CHAT ELEMENTS
       ===================================================== */

    const chatForm =
        document.getElementById("chatForm");

    const chatInput =
        document.getElementById("chatInput");

    const chatContainer =
        document.querySelector(".chat-container");

    const quickActions =
        document.querySelectorAll(".quick-action");


    /* =====================================================
       ADD MESSAGE
       ===================================================== */

    function addUserMessage(message) {

        const messageDiv =
            document.createElement("div");

        messageDiv.className = "user-message";

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHTML(message)}</p>
            </div>
        `;

        chatContainer.appendChild(messageDiv);

        scrollToBottom();
    }


    function addAIMessage(message) {

        const messageDiv =
            document.createElement("div");

        messageDiv.className = "ai-message";

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p>${message}</p>
            </div>
        `;

        chatContainer.appendChild(messageDiv);

        scrollToBottom();
    }


    /* =====================================================
       SCROLL CHAT TO BOTTOM
       ===================================================== */

    function scrollToBottom() {

        if (chatContainer) {

            chatContainer.scrollTop =
                chatContainer.scrollHeight;
        }
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* =====================================================
       AI RESPONSE
       ===================================================== */

    function getAIResponse(message) {

        const text =
            message.toLowerCase();


        /* Resume */

        if (
            text.includes("resume") ||
            text.includes("cv")
        ) {

            return `
                <p>
                    I can help you improve your resume.
                    Make sure it clearly shows your skills,
                    projects, education and achievements.
                </p>

                <p>
                    For a Software Engineer role, highlight
                    Java, SQL, DSA, web development and
                    relevant projects.
                </p>
            `;
        }


        /* Java */

        if (
            text.includes("java") ||
            text.includes("java interview")
        ) {

            return `
                <p>
                    Here are some important Java interview topics:
                </p>

                <p>
                    • OOP concepts<br>
                    • Collections Framework<br>
                    • Exception Handling<br>
                    • Multithreading<br>
                    • Java 8 features<br>
                    • Strings<br>
                    • JVM, JDK and JRE
                </p>
            `;
        }


        /* Interview */

        if (
            text.includes("interview") ||
            text.includes("preparation")
        ) {

            return `
                <p>
                    For interview preparation, focus on four areas:
                </p>

                <p>
                    1. Core Java<br>
                    2. DSA<br>
                    3. DBMS and SQL<br>
                    4. HR and communication
                </p>

                <p>
                    Practice explaining your projects clearly
                    because interviewers often ask follow-up
                    questions about them.
                </p>
            `;
        }


        /* Skills */

        if (
            text.includes("skill") ||
            text.includes("learn")
        ) {

            return `
                <p>
                    For a beginner Software Engineer profile,
                    focus on:
                </p>

                <p>
                    • Java<br>
                    • Data Structures & Algorithms<br>
                    • SQL<br>
                    • Git & GitHub<br>
                    • HTML, CSS & JavaScript<br>
                    • REST APIs<br>
                    • Basic Cloud concepts
                </p>
            `;
        }


        /* Jobs */

        if (
            text.includes("job") ||
            text.includes("career")
        ) {

            return `
                <p>
                    I can help you prepare for software engineering
                    jobs by working on your resume, skills,
                    interview preparation and project presentation.
                </p>

                <p>
                    You can also use the Job Search section to
                    explore available opportunities.
                </p>
            `;
        }


        /* Greeting */

        if (
            text.includes("hello") ||
            text.includes("hi") ||
            text.includes("hey")
        ) {

            return `
                <p>
                    Hello! 👋
                </p>

                <p>
                    What would you like help with today?
                    You can ask me about your resume,
                    Java interviews, skills or interview preparation.
                </p>
            `;
        }


        /* Default */

        return `
            <p>
                I can help you with:
            </p>

            <p>
                • Resume improvement<br>
                • Java interview questions<br>
                • Skills to learn<br>
                • Interview preparation<br>
                • Career guidance
            </p>

            <p>
                Try asking me one of these questions.
            </p>
        `;
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    function sendMessage(message) {

        if (!message || !message.trim()) {
            return;
        }

        const cleanMessage =
            message.trim();

        addUserMessage(cleanMessage);

        chatInput.value = "";


        /* Simulate AI thinking */

        const typingDiv =
            document.createElement("div");

        typingDiv.className = "ai-message";

        typingDiv.innerHTML = `
            <div class="message-bubble">
                <p>Thinking...</p>
            </div>
        `;

        chatContainer.appendChild(typingDiv);

        scrollToBottom();


        setTimeout(function () {

            typingDiv.remove();

            const response =
                getAIResponse(cleanMessage);

            addAIMessage(response);

        }, 700);
    }


    /* =====================================================
       FORM SUBMISSION
       ===================================================== */

    if (chatForm) {

        chatForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (chatInput) {

                sendMessage(chatInput.value);
            }
        });
    }


    /* =====================================================
       QUICK ACTION BUTTONS
       ===================================================== */

    quickActions.forEach(function (button) {

        button.addEventListener("click", function () {

            const message =
                button.textContent.trim();

            sendMessage(message);
        });
    });


    /* =====================================================
       ENTER KEY
       ===================================================== */

    if (chatInput) {

        chatInput.addEventListener("keydown", function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (chatForm) {
                    chatForm.requestSubmit();
                }
            }
        });
    }


    /* =====================================================
       INITIAL SCROLL
       ===================================================== */

    scrollToBottom();

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