/* =========================================================
   NEXHIRE — AUTHENTICATION
   Candidate & Recruiter Login / Signup
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const CANDIDATE_DASHBOARD = "candidate-dashboard.html";
    const RECRUITER_DASHBOARD = "recruiter_dashboard.html";


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }


    /* =====================================================
       THEME MANAGEMENT
       ===================================================== */

    function applyTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.setAttribute(
            "data-theme",
            selectedTheme
        );

        localStorage.setItem("nexhire-theme", selectedTheme);

        updateThemeButtons(selectedTheme);
    }


    function updateThemeButtons(theme) {
        const themeButtons = $$(
            "#themeToggle, .theme-toggle, [data-theme-toggle]"
        );

        themeButtons.forEach(function (button) {
            button.textContent = theme === "dark" ? "☀" : "☾";

            button.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );

            button.setAttribute(
                "title",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        });
    }


    function initializeTheme() {
        const savedTheme = localStorage.getItem("nexhire-theme") || "light";

        applyTheme(savedTheme);

        const themeButtons = $$(
            "#themeToggle, .theme-toggle, [data-theme-toggle]"
        );

        themeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const currentTheme =
                    document.documentElement.getAttribute("data-theme");

                applyTheme(currentTheme === "dark" ? "light" : "dark");
            });
        });
    }


    /* =====================================================
       ICON REFRESH
       ===================================================== */

    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }


    /* =====================================================
       MESSAGE HELPERS
       ===================================================== */

    function showMessage(message, type, form) {
        const messageBox =
            $("#authMessage", form) ||
            $("#formMessage", form) ||
            $(".auth-message", form) ||
            $("#authMessage") ||
            $("#formMessage");

        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = "auth-message " + (type || "info");
            messageBox.style.display = "block";
            messageBox.setAttribute("role", "alert");
        } else {
            // Fallback when the page does not contain a message element.
            console.log("[NexHire]", message);
        }
    }


    function clearMessage(form) {
        const messageBox =
            $("#authMessage", form) ||
            $("#formMessage", form) ||
            $(".auth-message", form) ||
            $("#authMessage") ||
            $("#formMessage");

        if (messageBox) {
            messageBox.textContent = "";
            messageBox.style.display = "none";
        }
    }


    /* =====================================================
       INPUT VALIDATION
       ===================================================== */

    function setFieldError(input, message) {
        if (!input) return;

        input.classList.add("error");
        input.setAttribute("aria-invalid", "true");

        let errorElement = input.parentElement
            ? $(".field-error", input.parentElement)
            : null;

        if (!errorElement) {
            errorElement = document.createElement("small");
            errorElement.className = "field-error";

            if (input.parentElement) {
                input.parentElement.appendChild(errorElement);
            }
        }

        errorElement.textContent = message;
        errorElement.style.display = "block";
    }


    function clearFieldError(input) {
        if (!input) return;

        input.classList.remove("error");
        input.removeAttribute("aria-invalid");

        const errorElement = input.parentElement
            ? $(".field-error", input.parentElement)
            : null;

        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
    }


    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }


    function validatePassword(password) {
        return typeof password === "string" && password.length >= 8;
    }


    function validateForm(form) {
        let isValid = true;

        const emailInput = $(
            'input[name="email"], input[type="email"], #email',
            form
        );

        const passwordInput = $(
            'input[name="password"], #password',
            form
        );

        const firstNameInput = $(
            'input[name="firstName"], #firstName',
            form
        );

        const lastNameInput = $(
            'input[name="lastName"], #lastName',
            form
        );

        const phoneInput = $(
            'input[name="phone"], input[type="tel"], #phone',
            form
        );

        const confirmPasswordInput = $(
            'input[name="confirmPassword"], #confirmPassword',
            form
        );

        const mode = (form.dataset.mode || "login").toLowerCase();

        [emailInput, passwordInput, firstNameInput, lastNameInput,
            phoneInput, confirmPasswordInput].forEach(clearFieldError);

        if (!emailInput || !emailInput.value.trim()) {
            setFieldError(emailInput, "Please enter your email address.");
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            setFieldError(emailInput, "Please enter a valid email address.");
            isValid = false;
        }

        if (!passwordInput || !passwordInput.value) {
            setFieldError(passwordInput, "Please enter your password.");
            isValid = false;
        } else if (!validatePassword(passwordInput.value)) {
            setFieldError(
                passwordInput,
                "Password must contain at least 8 characters."
            );
            isValid = false;
        }

        if (mode === "register") {
            if (!firstNameInput || !firstNameInput.value.trim()) {
                setFieldError(firstNameInput, "Please enter your first name.");
                isValid = false;
            }

            if (!lastNameInput || !lastNameInput.value.trim()) {
                setFieldError(lastNameInput, "Please enter your last name.");
                isValid = false;
            }

            if (phoneInput && phoneInput.value.trim()) {
                const phonePattern = /^[+]?[\d\s()-]{7,20}$/;

                if (!phonePattern.test(phoneInput.value.trim())) {
                    setFieldError(phoneInput, "Please enter a valid phone number.");
                    isValid = false;
                }
            }

            if (
                confirmPasswordInput &&
                confirmPasswordInput.value !== passwordInput.value
            ) {
                setFieldError(confirmPasswordInput, "Passwords do not match.");
                isValid = false;
            }
        }

        return isValid;
    }


    /* =====================================================
       PASSWORD VISIBILITY
       ===================================================== */

    function initializePasswordToggles() {
        const toggleButtons = $$(
            ".password-toggle, [data-password-toggle], #togglePassword"
        );

        toggleButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const targetId = button.dataset.target;
                let passwordInput = targetId
                    ? document.getElementById(targetId)
                    : button.parentElement
                        ? $("input", button.parentElement)
                        : null;

                if (!passwordInput) return;

                const isPassword = passwordInput.type === "password";

                passwordInput.type = isPassword ? "text" : "password";

                button.setAttribute(
                    "aria-label",
                    isPassword ? "Hide password" : "Show password"
                );

                button.setAttribute(
                    "title",
                    isPassword ? "Hide password" : "Show password"
                );

                refreshIcons();
            });
        });
    }


    /* =====================================================
       PASSWORD STRENGTH
       ===================================================== */

    function calculatePasswordStrength(password) {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (!password) {
            return {
                score: 0,
                label: ""
            };
        }

        if (score <= 2) {
            return {
                score: score,
                label: "Weak"
            };
        }

        if (score <= 4) {
            return {
                score: score,
                label: "Medium"
            };
        }

        return {
            score: score,
            label: "Strong"
        };
    }


    function initializePasswordStrength() {
        const passwordInput = $(
            'input[name="password"], #password'
        );

        const strengthText = $(
            "#passwordStrengthText, .password-strength-text"
        );

        const strengthBar = $(
            "#passwordStrengthBar, .password-strength-bar"
        );

        if (!passwordInput) return;

        passwordInput.addEventListener("input", function () {
            const result = calculatePasswordStrength(passwordInput.value);

            if (strengthText) {
                strengthText.textContent = result.label;
            }

            if (strengthBar) {
                const percentage = (result.score / 5) * 100;
                strengthBar.style.width = percentage + "%";
                strengthBar.setAttribute("aria-valuenow", String(result.score));
            }
        });
    }


    /* =====================================================
       AUTH RESPONSE HANDLING
       ===================================================== */

    function handleAuthResponse(data, role) {
        if (!data || typeof data !== "object") {
            throw new Error("The server returned an invalid response.");
        }

        const token = data.token || data.accessToken || data.access_token;

        if (!token) {
            throw new Error(
                "Authentication succeeded, but the server did not return a token."
            );
        }

        // Use the same token key expected by api.js.
        sessionStorage.setItem("token", token);

        const userId = data.id || data.userId || data.user_id;
        const userEmail = data.email || "";
        const firstName = data.firstName || data.first_name || "";
        const lastName = data.lastName || data.last_name || "";

        const roles = Array.isArray(data.roles) ? data.roles : [];
        const userRole = role || roles[0] || data.role || "";

        if (userId !== undefined && userId !== null) {
            sessionStorage.setItem("userId", String(userId));
        }

        if (userEmail) {
            sessionStorage.setItem("userEmail", userEmail);
        }

        if (firstName) {
            sessionStorage.setItem("firstName", firstName);
        }

        if (lastName) {
            sessionStorage.setItem("lastName", lastName);
        }

        if (userRole) {
            sessionStorage.setItem("userRole", String(userRole).toLowerCase());
        }

        sessionStorage.setItem("isAuthenticated", "true");
    }


    /* =====================================================
       API REQUEST
       Reuses the shared api.js helper.
       ===================================================== */

    async function request(path, payload) {
        if (typeof apiPost !== "function") {
            throw new Error(
                "API helper is unavailable. Check that config.js and api.js load before auth.js."
            );
        }

        return apiPost(path, payload);
    }


    /* =====================================================
       FORM SUBMISSION
       ===================================================== */

    async function submitAuth(form) {
        clearMessage(form);

        if (!validateForm(form)) {
            showMessage("Please correct the highlighted fields.", "error", form);
            return;
        }

        const role = (form.dataset.role || "candidate").toLowerCase();
        const mode = (form.dataset.mode || "login").toLowerCase();

        const emailInput = $(
            'input[name="email"], input[type="email"], #email',
            form
        );

        const passwordInput = $(
            'input[name="password"], #password',
            form
        );

        const firstNameInput = $(
            'input[name="firstName"], #firstName',
            form
        );

        const lastNameInput = $(
            'input[name="lastName"], #lastName',
            form
        );

        const phoneInput = $(
            'input[name="phone"], input[type="tel"], #phone',
            form
        );

        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        if (mode === "register") {
            payload.firstName = firstNameInput.value.trim();
            payload.lastName = lastNameInput.value.trim();

            if (phoneInput && phoneInput.value.trim()) {
                payload.phone = phoneInput.value.trim();
            }
        }

        const endpoint =
            mode === "register"
                ? `/auth/${role}/register`
                : `/auth/${role}/login`;

        const submitButton = $(
            'button[type="submit"], input[type="submit"]',
            form
        );

        const originalButtonText = submitButton
            ? submitButton.textContent
            : "";

        if (submitButton) {
            submitButton.disabled = true;

            if (submitButton.tagName.toLowerCase() === "input") {
                submitButton.value = "Please wait...";
            } else {
                submitButton.textContent = "Please wait...";
            }
        }

        try {
            const data = await request(endpoint, payload);

            handleAuthResponse(data, role);

            showMessage(
                mode === "register"
                    ? "Account created successfully. Redirecting..."
                    : "Login successful. Redirecting...",
                "success",
                form
            );

            const destination =
                role === "recruiter"
                    ? RECRUITER_DASHBOARD
                    : CANDIDATE_DASHBOARD;

            window.setTimeout(function () {
                window.location.href = destination;
            }, 700);

        } catch (error) {
            console.error("NexHire authentication error:", error);

            const status = error.status;
            let message = error.message || "Something went wrong. Please try again.";

            if (status === 400) {
                message = "Please check the information you entered.";
            } else if (status === 401) {
                message = "Invalid email or password. Please try again.";
            } else if (status === 403) {
                message = "You are not authorized to perform this action.";
            } else if (status === 409) {
                message = "An account with this email may already exist.";
            } else if (status >= 500) {
                message = "The server is having a problem. Please try again later.";
            }

            showMessage(message, "error", form);

        } finally {
            if (submitButton) {
                submitButton.disabled = false;

                if (submitButton.tagName.toLowerCase() === "input") {
                    submitButton.value = originalButtonText || "Submit";
                } else {
                    submitButton.textContent = originalButtonText || "Submit";
                }
            }
        }
    }


    /* =====================================================
       AUTH FORM INITIALIZATION
       ===================================================== */

    function initializeAuthForms() {
        const forms = $$(
            'form[data-role][data-mode], #loginForm, #signupForm, #registerForm'
        );

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                submitAuth(form);
            });

            $$("input", form).forEach(function (input) {
                input.addEventListener("input", function () {
                    clearFieldError(input);
                });
            });
        });
    }


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    function initializeForgotPassword() {
        const forgotLinks = $$(
            "#forgotPassword, .forgot-password, [data-forgot-password]"
        );

        forgotLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();

                const form = link.closest("form") || document;

                showMessage(
                    "Password reset is not connected yet. Please contact the NexHire team for assistance.",
                    "info",
                    form
                );
            });
        });
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    document.addEventListener("DOMContentLoaded", function () {
        initializeTheme();
        initializePasswordToggles();
        initializePasswordStrength();
        initializeAuthForms();
        initializeForgotPassword();
        refreshIcons();
    });

})();