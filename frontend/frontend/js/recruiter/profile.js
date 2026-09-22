/* =========================================================
   NexHire — Recruiter Profile & Settings Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.NexAuth.requireRole("ROLE_RECRUITER", "login.html")) {
    return;
  }

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  mobileMenuBtn?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    window.NexAuth.logout("ROLE_RECRUITER");
  });

  await loadProfile();

  document.getElementById("recruiterProfileForm")?.addEventListener("submit", handleProfileUpdate);
  document.getElementById("changePasswordForm")?.addEventListener("submit", handleChangePassword);
  document.getElementById("resetPasswordForm")?.addEventListener("submit", handleResetPassword);
});

async function loadProfile() {
  try {
    // Endpoint 24: GET /api/v1/recruiters/me
    const profile = await window.RecruiterApi.getProfile();
    if (!profile) return;

    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("companyName").value = profile.companyName || "";
    document.getElementById("designation").value = profile.designation || "";
    document.getElementById("resetEmail").value = profile.email || "";
  } catch (err) {
    console.error("Load recruiter profile error:", err);
    window.NexUtils.showToast("Failed to load recruiter profile.", "error");
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const msg = document.getElementById("profileMsg");
  const btn = document.getElementById("saveProfileBtn");

  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const email = document.getElementById("email")?.value.trim(); // Read-only preserved
  const phone = document.getElementById("phone")?.value.trim();
  const companyName = document.getElementById("companyName")?.value.trim();
  const designation = document.getElementById("designation")?.value.trim();

  try {
    if (msg) msg.className = "form-message";
    if (btn) btn.disabled = true;

    // Endpoint 25: PUT /api/v1/recruiters/me
    const updated = await window.RecruiterApi.updateProfile({
      firstName,
      lastName,
      email,
      phone,
      companyName,
      designation
    });

    if (msg) {
      msg.textContent = "Recruiter profile updated successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Profile changes saved!", "success");
  } catch (err) {
    console.error("Update recruiter profile error:", err);
    if (msg) {
      msg.textContent = err.message || "Failed to update profile.";
      msg.className = "form-message show error";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const msg = document.getElementById("changePassMsg");
  const btn = document.getElementById("changePassBtn");

  const oldPassword = document.getElementById("oldPassword")?.value;
  const newPassword = document.getElementById("newPassword")?.value;

  if (!oldPassword || !newPassword) return;

  try {
    if (msg) msg.className = "form-message";
    if (btn) btn.disabled = true;

    // Endpoint 26: POST /api/v1/recruiters/me/change-password
    const res = await window.RecruiterApi.changePassword(oldPassword, newPassword);

    if (msg) {
      msg.textContent = res.message || "Password changed successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Password updated successfully!", "success");
    document.getElementById("changePasswordForm").reset();
  } catch (err) {
    console.error("Change recruiter password error:", err);
    if (msg) {
      msg.textContent = err.message || "Failed to change password.";
      msg.className = "form-message show error";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleResetPassword(e) {
  e.preventDefault();
  const msg = document.getElementById("resetPassMsg");
  const btn = document.getElementById("resetPassBtn");

  const email = document.getElementById("resetEmail")?.value.trim();
  const newPassword = document.getElementById("resetNewPassword")?.value;

  if (!email || !newPassword) return;

  try {
    if (msg) msg.className = "form-message";
    if (btn) btn.disabled = true;

    // Endpoint 27: POST /api/v1/recruiters/me/password-reset
    const res = await window.RecruiterApi.resetPassword(email, newPassword);

    if (msg) {
      msg.textContent = res.message || "Password reset successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Password reset successfully!", "success");
    document.getElementById("resetPasswordForm").reset();
  } catch (err) {
    console.error("Reset recruiter password error:", err);
    if (msg) {
      msg.textContent = err.message || "Failed to reset password.";
      msg.className = "form-message show error";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}
