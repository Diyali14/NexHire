/* =========================================================
   NexHire — Recruiter Jobs List Controller
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

  await loadRecruiterJobs();
});

async function loadRecruiterJobs() {
  const container = document.getElementById("recruiterJobsContainer");
  if (!container) return;

  try {
    // Endpoint 29: GET /api/v1/jobs
    const jobs = await window.JobApi.getRecruiterJobs();

    if (!Array.isArray(jobs) || jobs.length === 0) {
      window.NexUtils.renderEmptyState(
        container,
        "No Job Postings Yet",
        "You haven't posted any jobs yet.",
        `<a href="post-job.html" class="button button-primary button-small">Post Your First Job</a>`
      );
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 16px;">`;

    jobs.forEach((j) => {
      const statusClass = (j.processingStatus || j.status || "QUEUED").toLowerCase();
      html += `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md); flex-wrap: wrap; gap: 16px;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <strong style="font-size: 1.125rem;">${window.NexUtils.escapeHTML(j.jobTitle)}</strong>
              <span class="status-badge status-${statusClass}">${j.processingStatus || j.status || 'QUEUED'}</span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${window.NexUtils.escapeHTML(j.jobDescription || '')}
            </p>
            <div style="font-size: 0.8125rem; color: var(--text-muted);">
              Created: ${window.NexUtils.formatDate(j.createdAt)} &bull; Job ID: #${j.jobId}
            </div>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <a href="applicants.html?jobId=${j.jobId}" class="button button-primary button-small">
              <i data-lucide="users"></i> Applicants
            </a>
            <a href="job-details.html?jobId=${j.jobId}" class="button button-secondary button-small">
              <i data-lucide="edit-2"></i> Details / Edit
            </a>
            <button type="button" class="button button-danger button-small" onclick="confirmDeleteJob(${j.jobId}, '${window.NexUtils.escapeHTML(j.jobTitle)}')">
              <i data-lucide="trash-2"></i> Delete
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Load recruiter jobs error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load jobs", err.message);
  }
}

async function confirmDeleteJob(jobId, jobTitle) {
  if (!confirm(`Are you sure you want to delete "${jobTitle}" (Job #${jobId})? This action cannot be undone.`)) {
    return;
  }

  try {
    // Endpoint 32: DELETE /api/v1/jobs/{jobId}
    await window.JobApi.deleteJob(jobId);
    window.NexUtils.showToast(`Job #${jobId} deleted successfully.`, "success");
    await loadRecruiterJobs();
  } catch (err) {
    console.error("Delete job error:", err);
    window.NexUtils.showToast("Failed to delete job. " + (err.message || ""), "error");
  }
}

window.confirmDeleteJob = confirmDeleteJob;
