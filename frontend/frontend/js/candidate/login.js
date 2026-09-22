/* =========================================================
   NexHire — Candidate Login Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("candidateLoginForm");
  const msgEl = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");

  // Redirect if already logged in as candidate
  if (window.NexAuth && window.NexAuth.isLoggedIn() && window.NexAuth.getRole() === "ROLE_CANDIDATE") {
    window.location.href = "dashboard.html";
    return;
  }

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

    const email = document.getElementById("email")?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      showMessage("Please fill in both email and password.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Logging in...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const data = await window.AuthApi.loginCandidate({ email, password });
      
      // Store session data
      window.NexAuth.setSession(data);

      showMessage("Login successful! Redirecting...", false);
      window.NexUtils.showToast("Welcome back! Redirecting to dashboard...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (err) {
      console.error("Candidate login error:", err);
      const errMsg = err.status === 401 ? "Invalid email or password." : (err.message || "Login failed. Please try again.");
      showMessage(errMsg, true);
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Login to Candidate Portal</span> <i data-lucide="arrow-right"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  });
});
