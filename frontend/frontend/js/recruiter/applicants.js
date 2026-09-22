/* =========================================================
   NexHire — Recruiter Job Applicants Controller
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

  await loadApplicants(currentJobId);
});

async function loadApplicants(jobId) {
  const container = document.getElementById("applicantsContainer");
  const header = document.getElementById("applicantsHeader");
  if (!container) return;

  try {
    // Endpoint 35: GET /api/v1/recruiters/jobs/{jobId}/applications
    const applicants = await window.RecruiterApi.getApplicantsForJob(jobId);

    if (header) header.textContent = `Applicants for Job #${jobId}`;

    if (!Array.isArray(applicants) || applicants.length === 0) {
      window.NexUtils.renderEmptyState(
        container,
        "No Applicants Yet",
        "No candidates have applied for this position yet."
      );
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 16px;">`;

    applicants.forEach((a) => {
      const statusClass = (a.status || "MATCHED").toLowerCase();
      const matchedSkills = window.NexUtils.renderSkillChips(a.matchedSkills || []);
      const missingSkills = window.NexUtils.renderSkillChips(a.missingSkills || []);

      html += `
        <div style="padding: 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.125rem;">${window.NexUtils.escapeHTML(a.candidateName || 'Candidate')}</h3>
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 2px;">
                Email: ${window.NexUtils.escapeHTML(a.candidateEmail || 'N/A')} &bull; Phone: ${window.NexUtils.escapeHTML(a.candidatePhone || 'N/A')}
              </div>
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                Resume: <strong>${window.NexUtils.escapeHTML(a.resumeFileName || 'resume.pdf')}</strong>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              ${window.NexUtils.renderScoreBadge(a.overallScore)}
              <span class="status-badge status-${statusClass}">${a.status || 'MATCHED'}</span>
              <a href="applicant-details.html?jobId=${jobId}&applicationId=${a.applicationId}" class="button button-primary button-small">
                View Profile & Download Resume &rarr;
              </a>
            </div>
          </div>

          <div style="display: flex; gap: 24px; font-size: 0.8125rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 10px; flex-wrap: wrap;">
            <div><strong>Experience Met:</strong> ${a.experienceMet !== undefined ? (a.experienceMet ? 'Yes ✓' : 'No ✗') : 'N/A'}</div>
            <div><strong>Education Met:</strong> ${a.educationMet !== undefined ? (a.educationMet ? 'Yes ✓' : 'No ✗') : 'N/A'}</div>
          </div>

          ${a.summary ? `
            <div style="font-size: 0.875rem; color: var(--text-secondary); background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <strong>Match Summary:</strong> ${window.NexUtils.escapeHTML(a.summary)}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 4px;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">MATCHED SKILLS</div>
              <div>${matchedSkills}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">MISSING SKILLS</div>
              <div>${missingSkills}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Load applicants error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load applicants", err.message);
  }
}
