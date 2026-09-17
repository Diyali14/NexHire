/* =========================================================
   NexHire — Authentication JavaScript
   Shared by candidate/recruiter login and signup pages.
   ========================================================= */

(function () {
  "use strict";

  const root = document.documentElement;

  const API_BASE_URL =
    window.NEXHIRE_API_BASE_URL ||
    "https://nexhire-backend-5zv7.onrender.com/api/v1";

  /* =========================================================
     THEME
     ========================================================= */

  const systemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const applyTheme = (theme, persist = true) => {
    root.dataset.theme = theme;

    if (persist) {
      localStorage.setItem("nexhire-theme", theme);
    }

    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const dark = theme === "dark";

      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
    });
  };

  applyTheme(
    localStorage.getItem("nexhire-theme") || systemTheme(),
    false
  );

  /* =========================================================
     ICONS
     ========================================================= */

  function refreshIcons() {
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /* =========================================================
     MESSAGES & ERRORS
     ========================================================= */

  function setMessage(element, message, type) {
    if (!element) return;

    element.textContent = message || "";

    element.className =
      "form-message" +
      (message ? " show" : "") +
      (type ? ` ${type}` : "");
  }

  function setFieldError(input, message) {
    const field = input?.closest(".form-field");
    const error = field?.querySelector(".field-error");

    if (error) {
      error.textContent = message || "";
    }

    input?.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearErrors(form) {
    form
      .querySelectorAll(".field-error")
      .forEach((el) => (el.textContent = ""));

    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.setAttribute("aria-invalid", "false"));
  }

  /* =========================================================
     PASSWORD TOGGLE
     ========================================================= */

  function togglePassword(button) {
    const input = document.getElementById(button.dataset.target);

    if (!input) return;

    const show = input.type === "password";

    input.type = show ? "text" : "password";

    button.setAttribute(
      "aria-label",
      show ? "Hide password" : "Show password"
    );

    button.innerHTML = `<i data-lucide="${
      show ? "eye-off" : "eye"
    }"></i>`;

    refreshIcons();
  }

  /* =========================================================
     PASSWORD STRENGTH
     ========================================================= */

  function passwordScore(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }

  function updateStrength(input) {
    const wrapper = input
      .closest(".form-field")
      ?.querySelector(".password-strength");

    if (!wrapper) return;

    const bar = wrapper.querySelector(".strength-track span");
    const text = wrapper.querySelector(".strength-text");

    const score = passwordScore(input.value);

    const widths = [
      "0%",
      "20%",
      "40%",
      "60%",
      "80%",
      "100%",
    ];

    const labels = [
      "",
      "Very weak",
      "Weak",
      "Fair",
      "Strong",
      "Very strong",
    ];

    bar.style.width = widths[score];

    text.textContent = input.value
      ? `Password strength: ${labels[score]}`
      : "Use at least 8 characters with a mix of letters, numbers, and symbols.";
  }

  /* =========================================================
     FORM VALIDATION
     ========================================================= */

  function validate(form) {
    let valid = true;

    const email = form.querySelector('input[type="email"]');
    const password = form.querySelector('input[name="password"]');

    const confirm = form.querySelector(
      'input[name="confirmPassword"]'
    );

    const terms = form.querySelector('input[name="terms"]');

    if (email && !email.validity.valid) {
      setFieldError(email, "Please enter a valid email address.");
      valid = false;
    } else if (email) {
      setFieldError(email, "");
    }

    if (password && password.value.length < 8) {
      setFieldError(
        password,
        "Password must be at least 8 characters."
      );

      valid = false;
    } else if (password) {
      setFieldError(password, "");
    }

    if (confirm && confirm.value !== password?.value) {
      setFieldError(confirm, "Passwords do not match.");
      valid = false;
    } else if (confirm) {
      setFieldError(confirm, "");
    }

    if (terms && !terms.checked) {
      setFieldError(
        terms,
        "Please accept the Terms & Conditions and Privacy Policy."
      );

      valid = false;
    } else if (terms) {
      setFieldError(terms, "");
    }

    return valid;
  }

  /* =========================================================
     SERVER ERROR MESSAGE
     ========================================================= */

  function extractServerMessage(data, fallback) {
    if (!data) return fallback;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    if (data.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).find(
        (value) => typeof value === "string"
      );

      if (first) {
        return first;
      }
    }

    return fallback;
  }

  /* =========================================================
     CANDIDATE SIGNUP DATA
     ========================================================= */

  function collectCandidateSignupData(form) {
    const candidateData = {
      firstName:
        form.querySelector('input[name="firstName"]')?.value.trim() || "",

      lastName:
        form.querySelector('input[name="lastName"]')?.value.trim() || "",

      email:
        form.querySelector('input[name="email"]')?.value.trim() || "",

      phone:
        form.querySelector('input[name="phone"]')?.value.trim() || "",

      password:
        form.querySelector('input[name="password"]')?.value || "",

      confirmPassword:
        form.querySelector('input[name="confirmPassword"]')?.value || "",

      terms:
        form.querySelector('input[name="terms"]')?.checked || false,
    };

    console.log("Candidate Signup Data:");
    console.log({
      ...candidateData,
      password: "[hidden]",
      confirmPassword: "[hidden]",
    });

    return candidateData;
  }

  /* =========================================================
     RECRUITER SIGNUP DATA
     ========================================================= */

  function collectRecruiterSignupData(form) {
    const recruiterData = {
      firstName:
        form.querySelector('input[name="firstName"]')?.value.trim() || "",

      lastName:
        form.querySelector('input[name="lastName"]')?.value.trim() || "",

      email:
        form.querySelector('input[name="email"]')?.value.trim() || "",

      phone:
        form.querySelector('input[name="phone"]')?.value.trim() || "",

      password:
        form.querySelector('input[name="password"]')?.value || "",

      confirmPassword:
        form.querySelector('input[name="confirmPassword"]')?.value || "",

      terms:
        form.querySelector('input[name="terms"]')?.checked || false,
    };

    console.log("Recruiter Signup Data:");
    console.log({
      ...recruiterData,
      password: "[hidden]",
      confirmPassword: "[hidden]",
    });

    return recruiterData;
  }

  /* =========================================================
     LOGIN DATA COLLECTION
     ========================================================= */

  function collectLoginData(form, role) {
    const loginData = {
      email:
        form.querySelector('input[name="email"]')?.value.trim() || "",

      password:
        form.querySelector('input[name="password"]')?.value || "",
    };

    console.log(
      `${role.charAt(0).toUpperCase() + role.slice(1)} Login Data:`
    );

    console.log({
      ...loginData,
      password: "[hidden]",
    });

    return loginData;
  }

  /* =========================================================
     BACKEND RESPONSE
     ========================================================= */

  function handleAuthResponse(data) {
    if (!data || typeof data !== "object") return;

    const accessToken = data.accessToken || data.token;

    if (typeof accessToken === "string" && accessToken) {
      sessionStorage.setItem(
        "nexhire-access-token",
        accessToken
      );
    }
  }

  /* =========================================================
     API REQUEST
     ========================================================= */

  async function request(path, payload) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      credentials: "include",

      body: JSON.stringify(payload),
    });

    let data = null;

    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const error = new Error(
        extractServerMessage(
          data,
          "Unable to complete the request. Please try again."
        )
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }

  /* =========================================================
     SUBMIT BUTTON
     ========================================================= */

  function setSubmitting(form, submitting, defaultText) {
    const button = form.querySelector(
      "button[type='submit']"
    );

    if (!button) return;

    button.disabled = submitting;

    button.innerHTML = submitting
      ? `<i data-lucide="loader-circle" class="spin-icon"></i>${
          form.dataset.mode === "login"
            ? "Signing in..."
            : "Creating account..."
        }`
      : `<i data-lucide="${
          form.dataset.mode === "login"
            ? "arrow-right"
            : "user-plus"
        }"></i>${defaultText}`;

    refreshIcons();
  }

  /* =========================================================
     REDIRECT
     ========================================================= */

  function redirectAfterAuth(role) {
    window.location.href =
      role === "candidate"
        ? "candidate-dashboard.html"
        : "recruiter_dashboard.html";
  }

  /* =========================================================
     AUTH FORM SUBMISSION
     ========================================================= */

  async function submitAuth(form) {
    clearErrors(form);

    const message = form.querySelector(".form-message");

    setMessage(message, "", "");

    if (!validate(form)) {
      return;
    }

    const role = form.dataset.role;
    const mode = form.dataset.mode;

    /* =====================================================
       COLLECT & PRINT FORM OBJECT
       ===================================================== */

    if (mode === "login") {
      collectLoginData(form, role);
    }

    if (role === "candidate" && mode === "register") {
      collectCandidateSignupData(form);
    }

    if (role === "recruiter" && mode === "register") {
      collectRecruiterSignupData(form);
    }

    /* =====================================================
       API PAYLOAD
       ===================================================== */

    const email =
      form.querySelector('input[type="email"]')?.value.trim();

    const password =
      form.querySelector('input[name="password"]')?.value;

    const payload = {
      email,
      password,
    };

    /* =====================================================
       ADD SIGNUP FIELDS
       ===================================================== */

    if (mode === "register") {
      const firstName =
        form
          .querySelector('input[name="firstName"]')
          ?.value.trim() || "";

      const lastName =
        form
          .querySelector('input[name="lastName"]')
          ?.value.trim() || "";

      const phone =
        form
          .querySelector('input[name="phone"]')
          ?.value.trim() || "";

      payload.firstName = firstName;
      payload.lastName = lastName;
      payload.phone = phone;
    }

    const path =
      mode === "login"
        ? `/auth/${role}/login`
        : `/auth/${role}/register`;

    setSubmitting(form, true);

    try {
      const data = await request(path, payload);

      handleAuthResponse(data);

      setMessage(
        message,
        mode === "login"
          ? "Signed in successfully. Redirecting..."
          : "Account created successfully. Redirecting...",
        "success"
      );

      window.setTimeout(
        () => redirectAfterAuth(role),
        350
      );
    } catch (error) {
      const messageText =
        error.status === 401
          ? "Invalid email or password."
          : error.status === 409
          ? "An account with this email already exists."
          : error.message ||
            "Unable to connect to the server. Please try again.";

      setMessage(message, messageText, "error");

      setSubmitting(
        form,
        false,
        form.dataset.mode === "login"
          ? "Login"
          : role === "recruiter"
          ? "Create Recruiter Account"
          : "Create Account"
      );
    }
  }

  /* =========================================================
     PAGE INITIALIZATION
     ========================================================= */

  document.addEventListener("DOMContentLoaded", () => {
    refreshIcons();

    /* Theme toggle */

    document
      .querySelectorAll(".theme-toggle")
      .forEach((button) => {
        button.addEventListener("click", () => {
          applyTheme(
            root.dataset.theme === "dark"
              ? "light"
              : "dark"
          );
        });
      });

    /* System theme change */

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        if (!localStorage.getItem("nexhire-theme")) {
          applyTheme(
            event.matches ? "dark" : "light",
            false
          );
        }
      });

    /* Password visibility */

    document
      .querySelectorAll(".password-toggle")
      .forEach((button) => {
        button.addEventListener("click", () => {
          togglePassword(button);
        });
      });

    /* Password strength */

    document
      .querySelectorAll('input[name="password"]')
      .forEach((input) => {
        input.addEventListener("input", () => {
          updateStrength(input);
        });
      });

    /* Authentication forms */

    document
      .querySelectorAll("form[data-auth-form]")
      .forEach((form) => {
        form.addEventListener("submit", (event) => {
          event.preventDefault();

          submitAuth(form);
        });

        /* Field validation on blur */

        form.querySelectorAll("input").forEach((input) => {
          input.addEventListener("blur", () => {
            if (
              input.type === "email" &&
              input.value &&
              !input.validity.valid
            ) {
              setFieldError(
                input,
                "Please enter a valid email address."
              );
            }

            if (
              input.name === "confirmPassword" &&
              input.value !==
                form.querySelector(
                  'input[name="password"]'
                )?.value
            ) {
              setFieldError(
                input,
                "Passwords do not match."
              );
            }
          });
        });
      });

    /* Forgot password */

    document
      .querySelectorAll(".forgot-password-link")
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();

          const message =
            document.querySelector(".form-message");

          setMessage(
            message,
            "Password reset is ready for the backend forgot-password flow. No reset has been performed.",
            ""
          );
        });
      });
  });
})();