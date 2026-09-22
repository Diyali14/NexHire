/* =========================================================
   NexHire — Recruiter Job Details & Edit Controller
   ========================================================= */

let currentJobId = null;

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

  const urlParams = new URLSearchParams(window.location.search);
  currentJobId = urlParams.get("jobId");

  if (!currentJobId) {
    window.location.href = "jobs.html";
    return;
  }

  await loadJobDetails(currentJobId);

  document.getElementById("editJobForm")?.addEventListener("submit", handleUpdateJob);
});

async function loadJobDetails(jobId) {
  const container = document.getElementById("jobDetailsContainer");
  const parsedPre = document.getElementById("parsedDataPre");
  const versionBadge = document.getElementById("parsedVersionBadge");

  if (!container) return;

  try {
    // Endpoint 30: GET /api/v1/jobs/{jobId}
    const job = await window.JobApi.getRecruiterJobDetails(jobId);

    document.getElementById("editJobTitle").value = job.jobTitle || "";
    document.getElementById("editJobDescription").value = job.jobDescription || "";

    const statusClass = (job.processingStatus || job.status || "QUEUED").toLowerCase();

    container.innerHTML = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="status-badge status-${statusClass}" style="margin-bottom: 6px;">${job.processingStatus || job.status || 'QUEUED'}</span>
            <h2 style="font-size: 1.5rem;">${window.NexUtils.escapeHTML(job.jobTitle)}</h2>
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4px;">
              Created: ${window.NexUtils.formatDate(job.createdAt)} &bull; Job ID: #${job.jobId}
            </div>
          </div>
          <a href="applicants.html?jobId=${job.jobId}" class="button button-primary"><i data-lucide="users"></i> View Applicants</a>
        </div>

        <div style="color: var(--text-secondary); line-height: 1.6; white-space: pre-line; margin-top: 16px;">
          ${window.NexUtils.escapeHTML(job.jobDescription || '')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Endpoint 34: GET /api/v1/jobs/{jobId}/parsed-data
    try {
      const parsedData = await window.JobApi.getParsedJobData(jobId);
      if (versionBadge) versionBadge.textContent = parsedData.parserVersion || "Parser v2.0.0";

      let prettyJson = parsedData.parsedJson || parsedData;
      if (typeof prettyJson === "string") {
        try { prettyJson = JSON.parse(prettyJson); } catch (e) {}
      }
      if (parsedPre) parsedPre.textContent = JSON.stringify(prettyJson, null, 2);
    } catch (e) {
      if (parsedPre) parsedPre.textContent = "Parsed JD data is currently processing or unavailable.";
    }
  } catch (err) {
    console.error("Load job details error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load job details", err.message);
  }
}

async function handleUpdateJob(e) {
  e.preventDefault();

  const msg = document.getElementById("editJobMsg");
  const btn = document.getElementById("saveJobBtn");

  const title = document.getElementById("editJobTitle")?.value.trim();
  const desc = document.getElementById("editJobDescription")?.value.trim();

  if (!title || !desc || !currentJobId) return;

  try {
    if (msg) msg.className = "form-message";
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Updating & Parsing...`;
    if (window.lucide) window.lucide.createIcons();

    // Endpoint 31: PUT /api/v1/jobs/{jobId}
    const updated = await window.JobApi.updateJob(currentJobId, title, desc);

    if (msg) {
      msg.textContent = `Job updated. Status: ${updated.processingStatus || 'QUEUED'}`;
      msg.className = "form-message show success";
    }
    window.NexUtils.showToast("Job updated! Re-parsing JD...", "success");

    await loadJobDetails(currentJobId);
  } catch (err) {
    console.error("Update job error:", err);
    if (msg) {
      msg.textContent = err.message || "Failed to update job.";
      msg.className = "form-message show error";
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Save & Re-parse Job Description`;
    }
  }
}
