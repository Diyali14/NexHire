/* =========================================================
   NexHire — Recruiter Signup Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recruiterSignupForm");
  const msgEl = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPass = passwordInput.type === "password";
      passwordInput.type = isPass ? "text" : "password";
      togglePasswordBtn.innerHTML = `<i data-lucide="${isPass ? "eye-off" : "eye"}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  function showMessage(msg, isError = true) {
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.className = `form-message show ${isError ? "error" : "success"}`;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msgEl) msgEl.className = "form-message";

    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const password = passwordInput?.value;

    if (!firstName || !lastName || !email || !phone || !password) {
      showMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      showMessage("Password must be at least 8 characters long.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Creating Workspace...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const data = await window.AuthApi.registerRecruiter({
        firstName,
        lastName,
        email,
        phone,
        password
      });

      window.NexAuth.setSession(data);

      showMessage("Registration successful! Redirecting...", false);
      window.NexUtils.showToast("Recruiter workspace created! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error("Recruiter signup error:", err);
      const errMsg = err.status === 400 ? (err.message || "Email is already taken.") : (err.message || "Registration failed. Please try again.");
      showMessage(errMsg, true);
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Create Recruiter Workspace</span> <i data-lucide="arrow-right"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  });
});
