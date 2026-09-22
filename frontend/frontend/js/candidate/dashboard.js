/* =========================================================
   NexHire — Candidate Dashboard Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  // Role Guard
  if (!window.NexAuth.requireRole("ROLE_CANDIDATE", "login.html")) {
    return;
  }

  // Sidebar & Mobile Navigation
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

  // Load Data
  await loadCandidateDashboard();
});

async function loadCandidateDashboard() {
  try {
    // 1. Fetch Candidate Profile (Endpoint 5)
    const profile = await window.CandidateApi.getProfile();
    renderCandidateProfile(profile);

    // 2. Fetch Resumes List (Endpoint 10)
    const resumes = await window.ResumeApi.getAllResumes();
    renderResumeSummary(resumes, profile);

    // 3. Fetch Candidate Applications (Endpoint 18)
    const apps = await window.ApplicationApi.getAllCandidateApplications();
    const statAppsCount = document.getElementById("statAppsCount");
    if (statAppsCount) {
      statAppsCount.textContent = Array.isArray(apps) ? apps.length : 0;
    }

    // 4. Fetch Available Jobs Preview (Endpoint 14)
    const jobs = await window.JobApi.searchCandidateJobs("", "recent");
    renderAvailableJobsPreview(jobs);

  } catch (err) {
    console.error("Dashboard data load error:", err);
    window.NexUtils.showToast("Unable to load profile data. " + (err.message || ""), "error");
  }
}

function renderCandidateProfile(profile) {
  if (!profile) return;

  const firstName = profile.firstName || "Candidate";
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || "Candidate";

  const greetingEl = document.getElementById("welcomeGreeting");
  const nameEl = document.getElementById("candidateFullName");
  const bioEl = document.getElementById("candidateBio");
  const emailEl = document.getElementById("candidateEmail");
  const phoneEl = document.getElementById("candidatePhone");
  const userNameText = document.getElementById("userNameText");
  const userAvatar = document.getElementById("userAvatar");

  if (greetingEl) greetingEl.textContent = `Welcome back, ${firstName}!`;
  if (nameEl) nameEl.textContent = fullName;
  if (bioEl) bioEl.textContent = profile.bio || "No bio provided yet.";
  if (emailEl) emailEl.innerHTML = `<i data-lucide="mail" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${window.NexUtils.escapeHTML(profile.email || '')}`;
  if (phoneEl) phoneEl.innerHTML = `<i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${window.NexUtils.escapeHTML(profile.phone || 'Not provided')}`;
  if (userNameText) userNameText.textContent = firstName;
  if (userAvatar) userAvatar.textContent = firstName.charAt(0).toUpperCase();

  if (window.lucide) window.lucide.createIcons();
}

function renderResumeSummary(resumes, profile) {
  const statResumesCount = document.getElementById("statResumesCount");
  const statResumeStatus = document.getElementById("statResumeStatus");
  const statSkillsCount = document.getElementById("statSkillsCount");
  const parsedSkillsContainer = document.getElementById("parsedSkillsContainer");

  const count = Array.isArray(resumes) ? resumes.length : 0;
  if (statResumesCount) statResumesCount.textContent = count;

  let hasUploadedResume = count > 0;
  let completedResume = null;

  if (hasUploadedResume) {
    completedResume = resumes.find((r) => r.processingStatus === "COMPLETED" || r.status === "COMPLETED");
    if (statResumeStatus) {
      statResumeStatus.textContent = completedResume ? `Active: ${completedResume.fileName}` : `${count} file(s) uploaded`;
    }
  } else if (statResumeStatus) {
    statResumeStatus.textContent = "No resume uploaded";
  }

  // Calculate Deterministic Profile Completion
  let score = 0;
  if (profile.email) score += 20;
  if (profile.firstName && profile.lastName) score += 20;
  if (profile.phone) score += 15;
  if (profile.linkedinUrl) score += 15;
  if (profile.githubUrl) score += 10;
  if (profile.bio) score += 10;
  if (hasUploadedResume) score += 10;

  const percentEl = document.getElementById("completionPercent");
  const barEl = document.getElementById("completionBar");
  if (percentEl) percentEl.textContent = `${score}%`;
  if (barEl) barEl.style.width = `${score}%`;

  // Fetch parsed data if completed resume exists
  if (completedResume) {
    window.ResumeApi.getParsedResumeData(completedResume.resumeId)
      .then((parsed) => {
        if (!parsed) return;
        const skills = parsed.skills || [];
        if (statSkillsCount) statSkillsCount.textContent = skills.length;

        if (parsedSkillsContainer) {
          if (skills.length === 0) {
            parsedSkillsContainer.innerHTML = '<p style="color: var(--text-muted);">No skills extracted from resume.</p>';
          } else {
            parsedSkillsContainer.innerHTML = window.NexUtils.renderSkillChips(skills);
          }
        }
      })
      .catch((e) => {
        console.warn("Could not fetch parsed data for resume:", e);
      });
  }
}

function renderAvailableJobsPreview(jobs) {
  const container = document.getElementById("dashboardJobsList");
  if (!container) return;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    window.NexUtils.renderEmptyState(container, "No Available Jobs", "No jobs have been posted yet.");
    return;
  }

  // Display top 3 recent jobs
  const recentThree = jobs.slice(0, 3);
  let html = `<div style="display: grid; gap: 12px;">`;

  recentThree.forEach((job) => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md); flex-wrap: wrap; gap: 8px;">
        <div>
          <strong style="font-size: 1rem;">${window.NexUtils.escapeHTML(job.jobTitle)}</strong>
          <div style="font-size: 0.8125rem; color: var(--text-muted);">
            ${window.NexUtils.escapeHTML(job.companyName || "Tech Corp")} &bull; Experience: ${window.NexUtils.escapeHTML(job.experienceRequired || "N/A")}
          </div>
        </div>
        <a href="job-details.html?jobId=${job.jobId}" class="button button-secondary button-small">View Job</a>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
