/* =========================================================
   NexHire — Candidate Profile & Settings Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.NexAuth.requireRole("ROLE_CANDIDATE", "login.html")) {
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
    window.NexAuth.logout("ROLE_CANDIDATE");
  });

  await loadProfile();

  document.getElementById("profileForm")?.addEventListener("submit", handleProfileUpdate);
  document.getElementById("changePasswordForm")?.addEventListener("submit", handleChangePassword);
  document.getElementById("resetPasswordForm")?.addEventListener("submit", handleResetPassword);
});

async function loadProfile() {
  try {
    // Endpoint 5: GET /api/v1/candidates/me
    const profile = await window.CandidateApi.getProfile();
    if (!profile) return;

    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("linkedinUrl").value = profile.linkedinUrl || "";
    document.getElementById("githubUrl").value = profile.githubUrl || "";
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("resetEmail").value = profile.email || "";
  } catch (err) {
    console.error("Load candidate profile error:", err);
    window.NexUtils.showToast("Failed to load candidate profile.", "error");
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
  const linkedinUrl = document.getElementById("linkedinUrl")?.value.trim();
  const githubUrl = document.getElementById("githubUrl")?.value.trim();
  const bio = document.getElementById("bio")?.value.trim();

  try {
    if (msg) msg.className = "form-message";
    if (btn) btn.disabled = true;

    // Endpoint 6: PUT /api/v1/candidates/me
    const updated = await window.CandidateApi.updateProfile({
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
      githubUrl,
      bio
    });

    if (msg) {
      msg.textContent = "Profile updated successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Profile changes saved!", "success");
  } catch (err) {
    console.error("Update candidate profile error:", err);
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

    // Endpoint 7: POST /api/v1/candidates/me/change-password
    const res = await window.CandidateApi.changePassword(oldPassword, newPassword);

    if (msg) {
      msg.textContent = res.message || "Password changed successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Password updated successfully!", "success");
    document.getElementById("changePasswordForm").reset();
  } catch (err) {
    console.error("Change password error:", err);
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

    // Endpoint 8: POST /api/v1/candidates/me/password-reset
    const res = await window.CandidateApi.resetPassword(email, newPassword);

    if (msg) {
      msg.textContent = res.message || "Password reset successfully!";
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Password reset successfully!", "success");
    document.getElementById("resetPasswordForm").reset();
  } catch (err) {
    console.error("Reset password error:", err);
    if (msg) {
      msg.textContent = err.message || "Failed to reset password.";
      msg.className = "form-message show error";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}
