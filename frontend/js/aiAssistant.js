/* =========================================================
   NEXHIRE AI ASSISTANT JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const root = document.documentElement;

    const themeToggle = document.getElementById("themeToggle");
    const mobileToggle = document.getElementById("mobileToggle");
    const mobileNav = document.getElementById("mobileNav");
    const siteHeader = document.getElementById("siteHeader");

    const chatMessages = document.getElementById("chatMessages");
    const welcomeMessage = document.getElementById("welcomeMessage");

    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    const newChatBtn = document.getElementById("newChatBtn");
    const clearHistory = document.getElementById("clearHistory");

    const attachBtn = document.getElementById("attachBtn");
    const fileInput = document.getElementById("fileInput");


    /* =====================================================
       LUCIDE ICONS
       ===================================================== */

    function refreshIcons() {

        if (window.lucide) {
            lucide.createIcons();
        }

    }


    refreshIcons();


    /* =====================================================
       THEME
       ===================================================== */

    const THEME_KEY = "nexhire-theme";


    function getSystemTheme() {

        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";

    }


    function applyTheme(theme) {

        root.setAttribute("data-theme", theme);

        localStorage.setItem(
            THEME_KEY,
            theme
        );


        if (themeToggle) {

            themeToggle.innerHTML =
                theme === "dark"
                    ? '<i data-lucide="moon"></i>'
                    : '<i data-lucide="sun"></i>';

        }

        refreshIcons();

    }


    const savedTheme =
        localStorage.getItem(THEME_KEY);


    applyTheme(
        savedTheme || getSystemTheme()
    );


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                const current =
                    root.getAttribute("data-theme");

                const next =
                    current === "dark"
                        ? "light"
                        : "dark";

                applyTheme(next);

            }
        );

    }


    /* =====================================================
       SYSTEM THEME CHANGE
       ===================================================== */

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", event => {

            if (!localStorage.getItem(THEME_KEY)) {

                applyTheme(
                    event.matches
                        ? "dark"
                        : "light"
                );

            }

        });


    /* =====================================================
       HEADER SCROLL
       ===================================================== */

    function updateHeader() {

        if (!siteHeader) return;

        siteHeader.classList.toggle(
            "scrolled",
            window.scrollY > 18
        );

    }


    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (mobileToggle) {

        mobileToggle.addEventListener(
            "click",
            () => {

                mobileNav.classList.toggle("open");

                mobileToggle.innerHTML =
                    mobileNav.classList.contains("open")
                        ? '<i data-lucide="x"></i>'
                        : '<i data-lucide="menu"></i>';

                refreshIcons();

            }
        );

    }


    document.querySelectorAll(
        ".mobile-nav a"
    ).forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mobileNav.classList.remove("open");

                mobileToggle.innerHTML =
                    '<i data-lucide="menu"></i>';

                refreshIcons();

            }
        );

    });


    /* =====================================================
       TEXTAREA AUTO RESIZE
       ===================================================== */

    function resizeTextarea() {

        messageInput.style.height = "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                120
            ) + "px";

    }


    messageInput.addEventListener(
        "input",
        resizeTextarea
    );


    /* =====================================================
       TIME
       ===================================================== */

    function getTime() {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       ADD USER MESSAGE
       ===================================================== */

    function addUserMessage(text) {

        const row =
            document.createElement("div");

        row.className =
            "message-row user";


        row.innerHTML = `

            <div>

                <div class="message-bubble">
                    ${escapeHTML(text)}
                </div>

                <div class="message-time">
                    ${getTime()}
                </div>

            </div>

        `;


        chatMessages.appendChild(row);

        scrollToBottom();

    }


    /* =====================================================
       ADD AI MESSAGE
       ===================================================== */

    function addAssistantMessage(text) {

        const row =
            document.createElement("div");

        row.className =
            "message-row assistant";


        row.innerHTML = `

            <div class="message-avatar">
                <i data-lucide="sparkles"></i>
            </div>

            <div>

                <div class="message-bubble">
                    ${formatReply(text)}
                </div>

                <div class="message-time">
                    ${getTime()}
                </div>

            </div>

        `;


        chatMessages.appendChild(row);

        refreshIcons();

        scrollToBottom();

    }


    /* =====================================================
       TYPING INDICATOR
       ===================================================== */

    function addTyping() {

        const row =
            document.createElement("div");

        row.className =
            "message-row assistant";

        row.id = "typingIndicator";


        row.innerHTML = `

            <div class="message-avatar">
                <i data-lucide="sparkles"></i>
            </div>

            <div class="typing-bubble">

                <span></span>
                <span></span>
                <span></span>

            </div>

        `;


        chatMessages.appendChild(row);

        refreshIcons();

        scrollToBottom();

    }


    function removeTyping() {

        const typing =
            document.getElementById(
                "typingIndicator"
            );

        if (typing) {
            typing.remove();
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
       FORMAT AI RESPONSE
       ===================================================== */

    function formatReply(text) {

        let result =
            escapeHTML(text);


        result =
            result.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        result =
            result.replace(
                /\n/g,
                "<br>"
            );


        return result;

    }


    /* =====================================================
       AI RESPONSE
       DEMO FRONTEND LOGIC
       ===================================================== */

    function generateReply(question) {

        const q =
            question.toLowerCase();


        if (
            q.includes("resume") ||
            q.includes("cv")
        ) {

            return `
                I can help you improve your resume.
                
                Focus on these areas:
                
                **1. Keep it concise** — ideally one page for a fresher.
                
                **2. Highlight projects** — mention the technologies used and what you actually built.
                
                **3. Show measurable impact** — whenever possible, explain what your project achieved.
                
                **4. Match the job description** — highlight skills that are relevant to the position.
                
                If you upload your resume, a real backend can later analyze it section by section.
            `;

        }


        if (
            q.includes("interview") ||
            q.includes("java")
        ) {

            return `
                Sure! For a Java Software Developer interview, I would recommend preparing these areas:
                
                **Java:** OOP, Collections, Exception Handling, Strings, Multithreading and Java 8 basics.
                
                **DSA:** Arrays, Strings, Linked Lists, Stack/Queue, Trees, Binary Search and Hashing.
                
                **SQL:** Joins, GROUP BY, HAVING, subqueries and aggregate functions.
                
                We can also do a mock interview where I ask you one question at a time and give feedback on your answer.
            `;

        }


        if (
            q.includes("job") ||
            q.includes("apply") ||
            q.includes("career")
        ) {

            return `
                Based on a Software Developer fresher profile, you can focus on roles such as:
                
                **Software Developer**
                
                **Java Developer**
                
                **Backend Developer**
                
                **Full Stack Developer**
                
                **Associate Software Engineer**
                
                On the actual NexHire platform, this assistant can later use your profile, skills and job listings to provide personalized job recommendations.
            `;

        }


        if (
            q.includes("skill") ||
            q.includes("learn")
        ) {

            return `
                For a fresher targeting Software Development roles, build your skills in this order:
                
                **1. Core Java + OOP**
                
                **2. DSA**
                
                **3. SQL + DBMS**
                
                **4. OS + Computer Networks**
                
                **5. One development stack**
                
                **6. Git and basic software development practices**
                
                You don't need to master everything at once. Build strong fundamentals first and then add advanced technologies.
            `;

        }


        if (
            q.includes("prepare") ||
            q.includes("study")
        ) {

            return `
                Here's a simple preparation approach:
                
                **Morning:** DSA practice
                
                **Afternoon:** Java/OOP/SQL concepts
                
                **Evening:** Project development
                
                **Night:** Interview questions and revision
                
                For placements, focus on solving representative problems rather than trying to complete every possible DSA question.
            `;

        }


        if (
            q.includes("introduce") ||
            q.includes("introduction")
        ) {

            return `
                For a Software Developer interview introduction, keep it around 60–90 seconds.
                
                Start with your **education**, then mention your **technical skills**, followed by **projects**, and finally explain what type of opportunity you are looking for.
                
                Keep the introduction natural rather than memorizing every sentence.
            `;

        }


        return `
            That's something I can help you with.
            
            As your NexHire AI Career Assistant, I can help with **resume improvement, interview preparation, career planning, skill development and job search**.
            
            Tell me what you're currently working on and I'll guide you step by step.
        `;

    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage(text = null) {

        const message =
            text ||
            messageInput.value.trim();


        if (!message) return;


        // Remove welcome screen
        if (welcomeMessage) {
            welcomeMessage.remove();
        }


        addUserMessage(message);


        messageInput.value = "";

        resizeTextarea();


        addTyping();


        // Demo AI delay
        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    900
                )
        );


        removeTyping();


        const reply =
            generateReply(message);


        addAssistantMessage(reply);

    }


    sendBtn.addEventListener(
        "click",
        () => sendMessage()
    );


    /* =====================================================
       ENTER TO SEND
       ===================================================== */

    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    /* =====================================================
       SUGGESTION BUTTONS
       ===================================================== */

    document.querySelectorAll(
        "[data-prompt]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;

                sendMessage(prompt);

            }
        );

    });


    /* =====================================================
       NEW CHAT
       ===================================================== */

    newChatBtn.addEventListener(
        "click",
        () => {

            chatMessages.innerHTML = `

                <div class="welcome-message">

                    <div class="welcome-icon">
                        <i data-lucide="sparkles"></i>
                    </div>

                    <h2>How can I help you today?</h2>

                    <p>
                        I can help you prepare for interviews,
                        improve your resume, find relevant jobs,
                        and plan your career.
                    </p>

                    <div class="suggestion-grid">

                        <button class="suggestion"
                            data-prompt="How can I improve my resume?">

                            <i data-lucide="file-text"></i>

                            <span>
                                <strong>Improve my resume</strong>
                                <small>Get personalized suggestions</small>
                            </span>

                            <i data-lucide="arrow-up-right"></i>

                        </button>

                        <button class="suggestion"
                            data-prompt="Help me prepare for a Java interview">

                            <i data-lucide="code-2"></i>

                            <span>
                                <strong>Prepare for an interview</strong>
                                <small>Practice technical questions</small>
                            </span>

                            <i data-lucide="arrow-up-right"></i>

                        </button>

                        <button class="suggestion"
                            data-prompt="What jobs should I apply for?">

                            <i data-lucide="briefcase"></i>

                            <span>
                                <strong>Find suitable jobs</strong>
                                <small>Discover relevant opportunities</small>
                            </span>

                            <i data-lucide="arrow-up-right"></i>

                        </button>

                        <button class="suggestion"
                            data-prompt="What skills should I learn as a fresher?">

                            <i data-lucide="graduation-cap"></i>

                            <span>
                                <strong>Plan my skills</strong>
                                <small>Build your career roadmap</small>
                            </span>

                            <i data-lucide="arrow-up-right"></i>

                        </button>

                    </div>

                </div>

            `;


            attachSuggestionListeners();

            refreshIcons();

        }
    );


    /* =====================================================
       SUGGESTION LISTENER FUNCTION
       ===================================================== */

    function attachSuggestionListeners() {

        document.querySelectorAll(
            "[data-prompt]"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    sendMessage(
                        button.dataset.prompt
                    );

                }
            );

        });

    }


    /* =====================================================
       CLEAR HISTORY
       ===================================================== */

    clearHistory.addEventListener(
        "click",
        () => {

            const conversations =
                document.querySelector(
                    ".conversation-list"
                );

            conversations.innerHTML = "";

        }
    );


    /* =====================================================
       CONVERSATION CLICK
       ===================================================== */

    document.querySelectorAll(
        ".conversation"
    ).forEach(conversation => {

        conversation.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".conversation")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                conversation.classList.add("active");

            }
        );

    });


    /* =====================================================
       ATTACHMENT
       ===================================================== */

    attachBtn.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        () => {

            const file =
                fileInput.files[0];

            if (!file) return;


            if (welcomeMessage) {
                welcomeMessage.remove();
            }


            addUserMessage(
                `Uploaded file: ${file.name}`
            );


            addTyping();


            setTimeout(
                () => {

                    removeTyping();

                    addAssistantMessage(`
                        I received **${file.name}**.
                        
                        In the full NexHire application, this file can be sent to the backend so the AI can analyze your resume and provide personalized feedback.
                    `);

                },
                900
            );


            fileInput.value = "";

        }
    );


    /* =====================================================
       SCROLL
       ===================================================== */

    function scrollToBottom() {

        setTimeout(
            () => {

                chatMessages.scrollTop =
                    chatMessages.scrollHeight;

            },
            50
        );

    }


    /* =====================================================
       FINAL ICON REFRESH
       ===================================================== */

    refreshIcons();

});