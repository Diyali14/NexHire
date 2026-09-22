/* =========================================================
   NexHire — Candidate Job Search Controller
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

  const searchForm = document.getElementById("jobSearchForm");
  const searchInput = document.getElementById("searchInput");
  const sortBySelect = document.getElementById("sortBySelect");

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchJobs();
  });

  sortBySelect?.addEventListener("change", () => {
    fetchJobs();
  });

  await fetchJobs();
});

async function fetchJobs() {
  const container = document.getElementById("jobsContainer");
  const query = document.getElementById("searchInput")?.value.trim() || "";
  const sortBy = document.getElementById("sortBySelect")?.value || "recent";

  if (!container) return;

  try {
    container.innerHTML = `
      <div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>
      <div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>
    `;

    // Endpoint 14: GET /api/v1/candidates/jobs?query=...&sortBy=...
    const jobs = await window.JobApi.searchCandidateJobs(query, sortBy);

    if (!Array.isArray(jobs) || jobs.length === 0) {
      window.NexUtils.renderEmptyState(
        container,
        "No Jobs Found",
        query ? `No job listings matched "${window.NexUtils.escapeHTML(query)}". Try a different query.` : "No active job opportunities are currently available."
      );
      return;
    }

    let html = `<div style="display: grid; gap: 16px;">`;

    jobs.forEach((j) => {
      const skillsHtml = window.NexUtils.renderSkillChips(j.skills || []);

      html += `
        <div class="card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="status-badge status-completed" style="margin-bottom: 6px;">Active Role</span>
              <h2 style="font-size: 1.25rem; font-weight: 700;">${window.NexUtils.escapeHTML(j.jobTitle)}</h2>
              <div style="font-size: 0.875rem; color: var(--text-muted); font-weight: 500;">
                ${window.NexUtils.escapeHTML(j.companyName || "Tech Corp")} &bull; Posted ${window.NexUtils.formatDate(j.createdAt)}
              </div>
            </div>
            <a href="job-details.html?jobId=${j.jobId}" class="button button-primary button-small">View Job & Apply &rarr;</a>
          </div>

          <p style="color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${window.NexUtils.escapeHTML(j.jobDescription || "")}
          </p>

          <div style="display: flex; gap: 24px; font-size: 0.8125rem; color: var(--text-secondary); flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <div><strong>Experience:</strong> ${window.NexUtils.escapeHTML(j.experienceRequired || 'Not specified')}</div>
            <div><strong>Education:</strong> ${window.NexUtils.escapeHTML(j.educationRequired || 'Not specified')}</div>
          </div>

          <div style="margin-top: 4px;">
            ${skillsHtml}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Fetch candidate jobs error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load jobs", err.message);
  }
}
