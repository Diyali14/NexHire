/* =========================================================
   NexHire — Candidate Applications Controller
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

  document.getElementById("closeMatchModal")?.addEventListener("click", () => {
    document.getElementById("matchModal")?.classList.remove("open");
  });

  await loadApplications();
});

async function loadApplications() {
  const container = document.getElementById("applicationsContainer");
  if (!container) return;

  try {
    // Endpoint 18: GET /api/v1/candidates/applications
    const apps = await window.ApplicationApi.getAllCandidateApplications();

    if (!Array.isArray(apps) || apps.length === 0) {
      window.NexUtils.renderEmptyState(
        container,
        "No Applications Submitted",
        "You haven't applied to any job roles yet. Explore open positions in Search Jobs."
      );
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

    apps.forEach((a) => {
      const statusClass = (a.status || "MATCHING_PENDING").toLowerCase();

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md); flex-wrap: wrap; gap: 12px;">
          <div>
            <strong style="font-size: 1rem;">${window.NexUtils.escapeHTML(a.jobTitle || 'Job Position')}</strong>
            <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
              Applied: ${window.NexUtils.formatDate(a.createdAt)} &bull; App ID: #${a.applicationId} &bull; Resume ID: #${a.resumeId}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            ${window.NexUtils.renderScoreBadge(a.overallScore)}
            <span class="status-badge status-${statusClass}">${a.status || 'MATCHING_PENDING'}</span>
            <button type="button" class="button button-secondary button-small" onclick="viewMatchResult(${a.applicationId})">
              View Match Breakdown
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Load candidate applications error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load applications", err.message);
  }
}

async function viewMatchResult(applicationId) {
  const modal = document.getElementById("matchModal");
  const body = document.getElementById("matchModalBody");
  if (!modal || !body) return;

  modal.classList.add("open");
  body.innerHTML = `<div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`;

  try {
    // Endpoint 19: GET /api/v1/candidates/applications/{applicationId}/match-result
    const res = await window.ApplicationApi.getMatchResult(applicationId);
    renderMatchResultData(res);
  } catch (err) {
    console.error("View match result error:", err);
    body.innerHTML = `<p style="color: var(--status-failed-text);">Failed to load match breakdown: ${window.NexUtils.escapeHTML(err.message)}</p>`;
  }
}

function renderMatchResultData(res) {
  const body = document.getElementById("matchModalBody");
  if (!body || !res) return;

  const result = res.matcherResult || res;
  const matched = result.matchedSkills || [];
  const missing = result.missingSkills || [];

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
      <div>
        <h4 style="margin-bottom: 2px;">${window.NexUtils.escapeHTML(res.jobTitle || 'Role Match')}</h4>
        <span class="status-badge status-${(res.status || 'MATCHED').toLowerCase()}">${res.status || 'MATCHED'}</span>
      </div>
      <div>
        ${window.NexUtils.renderScoreBadge(res.overallScore || result.overallScore)}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
        <strong>Experience Requirement:</strong> ${result.experienceMet ? 'Met ✓' : 'Gap ✗'}
      </div>
      <div style="padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
        <strong>Education Requirement:</strong> ${result.educationMet ? 'Met ✓' : 'Gap ✗'}
      </div>
    </div>

    ${result.summary ? `
      <div style="margin-bottom: 16px;">
        <h4>AI Match Summary</h4>
        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-top: 4px;">${window.NexUtils.escapeHTML(result.summary)}</p>
      </div>
    ` : ''}

    <div style="margin-bottom: 16px;">
      <h4>Matched Skills (${matched.length})</h4>
      <div style="margin-top: 6px;">${window.NexUtils.renderSkillChips(matched)}</div>
    </div>

    <div>
      <h4>Missing Skills (${missing.length})</h4>
      <div style="margin-top: 6px;">${window.NexUtils.renderSkillChips(missing)}</div>
    </div>
  `;

  body.innerHTML = html;
}

window.viewMatchResult = viewMatchResult;
