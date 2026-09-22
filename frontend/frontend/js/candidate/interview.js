/* =========================================================
   NexHire — Candidate Interview Prep Controller
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

  await loadAppliedJobsDropdown();

  const form = document.getElementById("selectAppForm");
  const select = document.getElementById("appliedJobsSelect");

  select?.addEventListener("change", async () => {
    const jobId = select.value;
    if (jobId) {
      await fetchInterviewQuestions(jobId);
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const jobId = select?.value;
    if (!jobId) {
      window.NexUtils.showToast("Please select an applied position first.", "warning");
      return;
    }
    await generateNewInterviewQuestions(jobId);
  });
});

async function loadAppliedJobsDropdown() {
  const select = document.getElementById("appliedJobsSelect");
  if (!select) return;

  try {
    // Endpoint 18: GET /api/v1/candidates/applications
    const apps = await window.ApplicationApi.getAllCandidateApplications();

    if (!Array.isArray(apps) || apps.length === 0) {
      select.innerHTML = `<option value="">No applications found. Apply to a job first.</option>`;
      select.disabled = true;
      document.getElementById("generateQuestionsBtn").disabled = true;
      return;
    }

    select.disabled = false;
    document.getElementById("generateQuestionsBtn").disabled = false;
    select.innerHTML = apps.map((a) => `<option value="${a.jobId}">${window.NexUtils.escapeHTML(a.jobTitle || 'Job Position')} (App #${a.applicationId})</option>`).join("");

    // Auto load questions for first job
    if (apps.length > 0) {
      fetchInterviewQuestions(apps[0].jobId);
    }
  } catch (err) {
    console.error("Load applied jobs error:", err);
    select.innerHTML = `<option value="">Failed to load applied jobs.</option>`;
  }
}

async function fetchInterviewQuestions(jobId) {
  const card = document.getElementById("questionsCard");
  const list = document.getElementById("questionsList");
  const header = document.getElementById("jobTitleHeader");
  const badge = document.getElementById("totalCountBadge");
  if (!card || !list) return;

  try {
    card.style.display = "block";
    list.innerHTML = `<div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`;

    // Endpoint 21: GET /api/v1/candidates/jobs/{jobId}/interview-questions
    const data = await window.ApplicationApi.getInterviewQuestions(jobId);
    renderQuestions(data);
  } catch (err) {
    // Not generated yet
    list.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted);">
        <p>No questions generated for this role yet.</p>
        <p style="font-size: 0.875rem; margin-top: 4px;">Click "Generate AI Questions" above to generate practice questions.</p>
      </div>
    `;
    if (header) header.textContent = "Interview Questions";
    if (badge) badge.textContent = "0 Questions";
  }
}

async function generateNewInterviewQuestions(jobId) {
  const btn = document.getElementById("generateQuestionsBtn");
  const card = document.getElementById("questionsCard");
  const list = document.getElementById("questionsList");
  if (!card || !list) return;

  try {
    card.style.display = "block";
    list.innerHTML = `<div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Generating...`;
      if (window.lucide) window.lucide.createIcons();
    }

    // Endpoint 20: POST /api/v1/candidates/jobs/{jobId}/interview-questions
    const data = await window.ApplicationApi.generateInterviewQuestions(jobId);
    renderQuestions(data);
    window.NexUtils.showToast("AI Interview questions generated!", "success");
  } catch (err) {
    console.error("Generate interview error:", err);
    window.NexUtils.showToast("Failed to generate interview questions. " + (err.message || ""), "error");
    list.innerHTML = `<p style="color: var(--status-failed-text);">Failed to generate interview questions: ${window.NexUtils.escapeHTML(err.message)}</p>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Generate AI Questions`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderQuestions(data) {
  const list = document.getElementById("questionsList");
  const header = document.getElementById("jobTitleHeader");
  const badge = document.getElementById("totalCountBadge");

  if (!list || !data) return;

  if (header) header.textContent = `Interview Questions: ${data.jobTitle || 'Role'}`;
  const questions = data.questions || [];
  if (badge) badge.textContent = `${questions.length || data.totalQuestions || 0} Questions`;

  if (questions.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted);">No questions returned by backend.</p>`;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;
  questions.forEach((q, idx) => {
    html += `
      <div style="padding: 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 6px;">Question ${idx + 1}</div>
        <div style="font-size: 0.9375rem; color: var(--text-primary); line-height: 1.5;">${window.NexUtils.escapeHTML(q)}</div>
      </div>
    `;
  });
  html += `</div>`;
  list.innerHTML = html;
}
