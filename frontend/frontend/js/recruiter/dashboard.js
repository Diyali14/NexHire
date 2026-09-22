/* =========================================================
   NexHire — Recruiter Dashboard Controller
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

  await loadRecruiterDashboard();
});

async function loadRecruiterDashboard() {
  try {
    // 1. Endpoint 24: GET /api/v1/recruiters/me
    const profile = await window.RecruiterApi.getProfile();
    renderRecruiterProfile(profile);

    // 2. Endpoint 29: GET /api/v1/jobs
    const jobs = await window.JobApi.getRecruiterJobs();
    renderRecruiterJobsSummary(jobs);
  } catch (err) {
    console.error("Recruiter dashboard data error:", err);
    window.NexUtils.showToast("Unable to load recruiter dashboard. " + (err.message || ""), "error");
  }
}

function renderRecruiterProfile(profile) {
  if (!profile) return;

  const firstName = profile.firstName || "Recruiter";
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || "Recruiter";

  const greetingEl = document.getElementById("recruiterGreeting");
  const nameEl = document.getElementById("recruiterFullName");
  const desigEl = document.getElementById("recruiterDesignation");
  const compEl = document.getElementById("recruiterCompany");
  const emailEl = document.getElementById("recruiterEmail");
  const phoneEl = document.getElementById("recruiterPhone");
  const nameText = document.getElementById("recruiterNameText");
  const avatar = document.getElementById("recruiterAvatar");

  const hour = new Date().getHours();
  let timeStr = "Good morning";
  if (hour >= 12 && hour < 17) timeStr = "Good afternoon";
  if (hour >= 17) timeStr = "Good evening";

  if (greetingEl) greetingEl.textContent = `${timeStr}, ${firstName}!`;
  if (nameEl) nameEl.textContent = fullName;
  if (desigEl) desigEl.textContent = profile.designation || "Hiring Manager";
  if (compEl) compEl.textContent = profile.companyName || "Tech Corp";
  if (emailEl) emailEl.innerHTML = `<i data-lucide="mail" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${window.NexUtils.escapeHTML(profile.email || '')}`;
  if (phoneEl) phoneEl.innerHTML = `<i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${window.NexUtils.escapeHTML(profile.phone || 'Not provided')}`;
  if (nameText) nameText.textContent = firstName;
  if (avatar) avatar.textContent = firstName.charAt(0).toUpperCase();

  if (window.lucide) window.lucide.createIcons();
}

function renderRecruiterJobsSummary(jobs) {
  const container = document.getElementById("latestJobsContainer");
  const statJobsCount = document.getElementById("statJobsCount");
  const statParsedJobsCount = document.getElementById("statParsedJobsCount");

  if (!Array.isArray(jobs) || jobs.length === 0) {
    if (statJobsCount) statJobsCount.textContent = 0;
    if (statParsedJobsCount) statParsedJobsCount.textContent = 0;
    if (container) {
      window.NexUtils.renderEmptyState(container, "No Jobs Posted Yet", "Create your first job posting to start evaluating applicants.", `<a href="post-job.html" class="button button-primary button-small">Create Your First Job</a>`);
    }
    return;
  }

  if (statJobsCount) statJobsCount.textContent = jobs.length;
  const completedCount = jobs.filter((j) => j.processingStatus === "COMPLETED" || j.status === "COMPLETED").length;
  if (statParsedJobsCount) statParsedJobsCount.textContent = completedCount;

  // Sort client-side by createdAt / updatedAt descending to show latest 3 jobs
  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const latestThree = sortedJobs.slice(0, 3);
  let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

  latestThree.forEach((j) => {
    const statusClass = (j.processingStatus || j.status || "QUEUED").toLowerCase();
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-tertiary); border-radius: var(--radius-md); flex-wrap: wrap; gap: 12px;">
        <div>
          <strong style="font-size: 0.9375rem;">${window.NexUtils.escapeHTML(j.jobTitle)}</strong>
          <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
            Created: ${window.NexUtils.formatDate(j.createdAt)} &bull; Job ID: #${j.jobId}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-badge status-${statusClass}">${j.processingStatus || j.status || 'QUEUED'}</span>
          <a href="applicants.html?jobId=${j.jobId}" class="button button-secondary button-small">Applicants</a>
          <a href="job-details.html?jobId=${j.jobId}" class="button button-secondary button-small">Details</a>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  if (container) container.innerHTML = html;
}
