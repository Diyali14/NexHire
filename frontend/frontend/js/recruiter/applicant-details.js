/* =========================================================
   NexHire — Recruiter Applicant Details & Resume Download Controller
   ========================================================= */

let currentJobId = null;
let currentApplicationId = null;

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
  currentApplicationId = urlParams.get("applicationId");

  const backBtn = document.getElementById("backToApplicantsBtn");
  if (backBtn && currentJobId) {
    backBtn.href = `applicants.html?jobId=${currentJobId}`;
  } else if (backBtn) {
    backBtn.href = "jobs.html";
  }

  if (!currentJobId || !currentApplicationId) {
    window.location.href = "jobs.html";
    return;
  }

  await loadApplicantDetails(currentJobId, currentApplicationId);
});

async function loadApplicantDetails(jobId, applicationId) {
  const container = document.getElementById("applicantDetailsContainer");
  if (!container) return;

  try {
    // Endpoint 36: GET /api/v1/recruiters/jobs/{jobId}/applications/{applicationId}
    const data = await window.RecruiterApi.getApplicantDetails(jobId, applicationId);

    const summary = data.applicationSummary || {};
    const candidate = data.candidateProfile || {};
    const parsedResume = data.parsedResume || {};

    const name = summary.candidateName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
    const email = summary.candidateEmail || candidate.email || 'N/A';
    const phone = summary.candidatePhone || candidate.phone || 'N/A';
    const linkedin = candidate.linkedinUrl || summary.linkedinUrl || '';
    const github = candidate.githubUrl || summary.githubUrl || '';
    const bio = candidate.bio || summary.bio || 'No bio provided.';

    const matchedSkills = window.NexUtils.renderSkillChips(summary.matchedSkills || parsedResume.skills || []);
    const missingSkills = window.NexUtils.renderSkillChips(summary.missingSkills || []);

    container.innerHTML = `
      <!-- Top Action & Overview Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="status-badge status-${(summary.status || 'MATCHED').toLowerCase()}" style="margin-bottom: 8px;">${summary.status || 'MATCHED'}</span>
            <h1 style="font-size: 1.75rem;">${window.NexUtils.escapeHTML(name)}</h1>
            <div style="font-size: 0.9375rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
              Applied: ${window.NexUtils.formatDate(summary.createdAt)} &bull; App #${applicationId} &bull; Resume: ${window.NexUtils.escapeHTML(summary.resumeFileName || 'resume.pdf')}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            ${window.NexUtils.renderScoreBadge(summary.overallScore)}
            <button type="button" class="button button-primary" id="downloadResumeBtn" onclick="handleSecureResumeDownload(${applicationId})">
              <i data-lucide="download"></i> Secure Resume Download
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 24px; font-size: 0.875rem; color: var(--text-secondary); flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
          <div><strong>Email:</strong> ${window.NexUtils.escapeHTML(email)}</div>
          <div><strong>Phone:</strong> ${window.NexUtils.escapeHTML(phone)}</div>
          ${linkedin ? `<div><strong>LinkedIn:</strong> <a href="${window.NexUtils.escapeHTML(linkedin)}" target="_blank" rel="noopener">Profile &rarr;</a></div>` : ''}
          ${github ? `<div><strong>GitHub:</strong> <a href="${window.NexUtils.escapeHTML(github)}" target="_blank" rel="noopener">GitHub &rarr;</a></div>` : ''}
        </div>
      </div>

      <!-- Candidate Profile & Bio -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 8px;">Candidate Profile & Bio</h3>
        <p style="color: var(--text-secondary); line-height: 1.5;">${window.NexUtils.escapeHTML(bio)}</p>
      </div>

      <!-- AI Matching Analysis Breakdown -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px;">AI Match Evaluation</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
            <strong>Experience Met:</strong> ${summary.experienceMet !== undefined ? (summary.experienceMet ? 'Yes ✓' : 'No ✗') : 'N/A'}
          </div>
          <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
            <strong>Education Met:</strong> ${summary.educationMet !== undefined ? (summary.educationMet ? 'Yes ✓' : 'No ✗') : 'N/A'}
          </div>
        </div>

        ${summary.summary ? `
          <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
            <strong>Match Summary:</strong> ${window.NexUtils.escapeHTML(summary.summary)}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div>
            <h4 style="margin-bottom: 8px; color: var(--score-high-text);">Matched Skills</h4>
            <div>${matchedSkills}</div>
          </div>
          <div>
            <h4 style="margin-bottom: 8px; color: var(--score-low-text);">Missing Skills</h4>
            <div>${missingSkills}</div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Load applicant details error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load applicant profile", err.message);
  }
}

async function handleSecureResumeDownload(applicationId) {
  const btn = document.getElementById("downloadResumeBtn");
  if (!applicationId) return;

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Downloading...`;
      if (window.lucide) window.lucide.createIcons();
    }

    // Endpoint 37: GET /api/v1/recruiters/applications/{applicationId}/resume/download
    const response = await window.RecruiterApi.downloadResume(applicationId);

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition") || "";
    let fileName = `candidate_resume_${applicationId}.pdf`;

    const match = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (match && match[1]) {
      fileName = match[1];
    }

    // Trigger browser download via blob URL
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(blobUrl);

    window.NexUtils.showToast("Resume downloaded successfully!", "success");
  } catch (err) {
    console.error("Resume download error:", err);
    const is403 = err.status === 403 || (err.message && err.message.includes("Forbidden"));
    const errorText = is403 ? "Forbidden: You do not own the job for this application." : (err.message || "Failed to download resume.");
    window.NexUtils.showToast(errorText, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="download"></i> Secure Resume Download`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

window.handleSecureResumeDownload = handleSecureResumeDownload;
