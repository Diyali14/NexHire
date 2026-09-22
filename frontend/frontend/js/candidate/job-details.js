/* =========================================================
   NexHire — Candidate Job Details Controller
   ========================================================= */

let currentJobId = null;

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

  const urlParams = new URLSearchParams(window.location.search);
  currentJobId = urlParams.get("jobId");

  if (!currentJobId) {
    window.location.href = "jobs.html";
    return;
  }

  setupModals();
  await loadJobDetails(currentJobId);
});

async function loadJobDetails(jobId) {
  const container = document.getElementById("jobDetailsContainer");
  if (!container) return;

  try {
    // Endpoint 15: GET /api/v1/candidates/jobs/{jobId}
    const job = await window.JobApi.getCandidateJobDetails(jobId);

    // Check application status if available (Endpoint 17)
    let appStatus = null;
    try {
      appStatus = await window.ApplicationApi.getApplicationStatusForJob(jobId);
    } catch (e) {
      // 404 means candidate has not applied yet
    }

    const skillsHtml = window.NexUtils.renderSkillChips(job.skills || []);

    let actionBtnHTML = `<button type="button" class="button button-primary" onclick="openApplyModal()"><i data-lucide="send"></i> Apply Now</button>`;
    if (appStatus) {
      actionBtnHTML = `<span class="status-badge status-completed"><i data-lucide="check-circle-2"></i> Already Applied (${appStatus.status || 'MATCHED'})</span>`;
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="status-badge status-completed" style="margin-bottom: 8px;">Active Job Posting</span>
            <h1 style="font-size: 1.75rem;">${window.NexUtils.escapeHTML(job.jobTitle)}</h1>
            <div style="font-size: 0.9375rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
              ${window.NexUtils.escapeHTML(job.companyName || "Tech Corp")} &bull; Posted ${window.NexUtils.formatDate(job.createdAt)}
            </div>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="button button-secondary" onclick="openSkillGapModal()"><i data-lucide="bar-chart-2"></i> Analyze Skill Gap</button>
            ${actionBtnHTML}
          </div>
        </div>

        <div style="display: flex; gap: 32px; font-size: 0.875rem; color: var(--text-secondary); flex-wrap: wrap; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 16px 0; margin-bottom: 20px;">
          <div><strong>Experience Required:</strong> ${window.NexUtils.escapeHTML(job.experienceRequired || 'Not specified')}</div>
          <div><strong>Education Required:</strong> ${window.NexUtils.escapeHTML(job.educationRequired || 'Not specified')}</div>
          <div><strong>Status:</strong> ${window.NexUtils.escapeHTML(job.processingStatus || 'COMPLETED')}</div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin-bottom: 12px;">Job Description</h3>
          <div style="color: var(--text-secondary); line-height: 1.6; white-space: pre-line;">${window.NexUtils.escapeHTML(job.jobDescription || '')}</div>
        </div>

        <div>
          <h3 style="margin-bottom: 12px;">Required Skills</h3>
          <div>${skillsHtml}</div>
        </div>
      </div>

      <!-- Interview Preparation Card -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <h3>AI Interview Preparation</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Generate AI interview questions based on job requirements.</p>
          </div>
          <button type="button" class="button button-secondary" id="genInterviewBtn" onclick="handleGenerateInterview()"><i data-lucide="sparkles"></i> Generate Questions</button>
        </div>
        <div id="interviewQuestionsContainer">
          <p style="color: var(--text-muted);">Click "Generate Questions" to create AI-generated preparation questions.</p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Load existing interview questions if available
    loadExistingInterviewQuestions(jobId);
  } catch (err) {
    console.error("Load job details error:", err);
    window.NexUtils.renderEmptyState(container, "Unable to load job details", err.message);
  }
}

function setupModals() {
  const skillGapModal = document.getElementById("skillGapModal");
  const closeSkillGapModal = document.getElementById("closeSkillGapModal");

  closeSkillGapModal?.addEventListener("click", () => {
    skillGapModal?.classList.remove("open");
  });

  const applyModal = document.getElementById("applyModal");
  const closeApplyModal = document.getElementById("closeApplyModal");
  const applyForm = document.getElementById("applyForm");

  closeApplyModal?.addEventListener("click", () => {
    applyModal?.classList.remove("open");
  });

  applyForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleApplySubmit();
  });
}

async function openSkillGapModal() {
  const modal = document.getElementById("skillGapModal");
  const body = document.getElementById("skillGapModalBody");
  if (!modal || !body || !currentJobId) return;

  modal.classList.add("open");
  body.innerHTML = `<div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`;

  try {
    // Trigger or fetch skill gap analysis (Endpoint 22 & 23)
    let data;
    try {
      data = await window.ApplicationApi.getSkillGapAnalysis(currentJobId);
    } catch (e) {
      data = await window.ApplicationApi.analyzeSkillGap(currentJobId);
    }

    renderSkillGapResult(data);
  } catch (err) {
    console.error("Skill gap error:", err);
    body.innerHTML = `<p style="color: var(--status-failed-text);">Skill gap analysis failed: ${window.NexUtils.escapeHTML(err.message)}</p>`;
  }
}

function renderSkillGapResult(data) {
  const body = document.getElementById("skillGapModalBody");
  if (!body || !data) return;

  const missing = data.missingSkills || [];
  const expMet = data.experienceMet !== undefined ? (data.experienceMet ? "Yes ✓" : "No ✗") : "N/A";

  let html = `
    <div style="margin-bottom: 16px;">
      <h4 style="margin-bottom: 4px;">Role: ${window.NexUtils.escapeHTML(data.jobTitle || '')}</h4>
      <p style="font-size: 0.875rem; color: var(--text-secondary);">${window.NexUtils.escapeHTML(data.message || '')}</p>
    </div>

    <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md); margin-bottom: 16px;">
      <p><strong>Experience Required Met:</strong> ${expMet}</p>
      <p><strong>Skill Gap Identified:</strong> ${data.hasGap ? 'Yes' : 'No (Strong match)'}</p>
    </div>

    <h4>Missing Skills (${missing.length})</h4>
  `;

  if (missing.length === 0) {
    html += `<p style="color: var(--status-completed-text); margin-top: 8px;">No missing technical skills identified! Your resume matches the key skill requirements.</p>`;
  } else {
    html += `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">`;
    missing.forEach((s) => {
      const name = typeof s === 'string' ? s : s.name || s.normalizedName || '';
      const imp = s.importance || 'HIGH';
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <strong>${window.NexUtils.escapeHTML(name)}</strong>
          <span class="status-badge ${imp === 'HIGH' ? 'status-failed' : 'status-queued'}">${imp} Importance</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  body.innerHTML = html;
}

async function openApplyModal() {
  const modal = document.getElementById("applyModal");
  const select = document.getElementById("selectResume");
  const msg = document.getElementById("applyStatusMsg");
  if (!modal || !select || !currentJobId) return;

  if (msg) msg.className = "form-message";
  modal.classList.add("open");

  try {
    // Endpoint 10: GET /api/v1/resumes
    const resumes = await window.ResumeApi.getAllResumes();
    const completed = (resumes || []).filter((r) => r.processingStatus === "COMPLETED" || r.status === "COMPLETED");

    if (completed.length === 0) {
      select.innerHTML = `<option value="">No processed resumes found. Upload a resume first.</option>`;
      select.disabled = true;
      document.getElementById("submitApplyBtn").disabled = true;
      return;
    }

    select.disabled = false;
    document.getElementById("submitApplyBtn").disabled = false;
    select.innerHTML = completed.map((r) => `<option value="${r.resumeId}">${window.NexUtils.escapeHTML(r.fileName)} (${r.fileType})</option>`).join("");
  } catch (err) {
    console.error("Load resumes for apply error:", err);
    window.NexUtils.showToast("Unable to load candidate resumes.", "error");
  }
}

async function handleApplySubmit() {
  const resumeId = document.getElementById("selectResume")?.value;
  const msg = document.getElementById("applyStatusMsg");
  const btn = document.getElementById("submitApplyBtn");

  if (!resumeId) {
    if (msg) {
      msg.textContent = "Please select a processed resume.";
      msg.className = "form-message show error";
    }
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Submitting...`;
    if (window.lucide) window.lucide.createIcons();

    // Endpoint 16: POST /api/v1/jobs/{jobId}/apply
    const res = await window.ApplicationApi.applyToJob(currentJobId, resumeId);

    if (msg) {
      msg.textContent = res.message || "Application submitted successfully. Matching is being processed.";
      msg.className = "form-message show success";
    }

    window.NexUtils.showToast("Application submitted successfully!", "success");

    setTimeout(() => {
      document.getElementById("applyModal")?.classList.remove("open");
      loadJobDetails(currentJobId);
    }, 1500);
  } catch (err) {
    console.error("Apply job error:", err);
    const isConflict = err.status === 409 || (err.message && err.message.toLowerCase().includes("already applied"));
    const errorText = isConflict ? "You have already applied for this job." : (err.message || "Failed to submit application.");

    if (msg) {
      msg.textContent = errorText;
      msg.className = "form-message show error";
    }

    btn.disabled = false;
    btn.innerHTML = `Submit Application & Start AI Matcher`;
  }
}

async function loadExistingInterviewQuestions(jobId) {
  const container = document.getElementById("interviewQuestionsContainer");
  if (!container) return;

  try {
    // Endpoint 21: GET /api/v1/candidates/jobs/{jobId}/interview-questions
    const data = await window.ApplicationApi.getInterviewQuestions(jobId);
    renderInterviewQuestions(data);
  } catch (e) {
    // Not generated yet
  }
}

async function handleGenerateInterview() {
  const container = document.getElementById("interviewQuestionsContainer");
  const btn = document.getElementById("genInterviewBtn");
  if (!container || !currentJobId) return;

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Generating...`;
      if (window.lucide) window.lucide.createIcons();
    }

    // Endpoint 20: POST /api/v1/candidates/jobs/{jobId}/interview-questions
    const data = await window.ApplicationApi.generateInterviewQuestions(currentJobId);
    renderInterviewQuestions(data);
    window.NexUtils.showToast("AI Interview questions generated!", "success");
  } catch (err) {
    console.error("Generate interview error:", err);
    window.NexUtils.showToast("Failed to generate interview questions. " + (err.message || ""), "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Generate Questions`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderInterviewQuestions(data) {
  const container = document.getElementById("interviewQuestionsContainer");
  if (!container || !data) return;

  const questions = data.questions || [];
  if (questions.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">No questions available yet. Click Generate Questions.</p>`;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;
  questions.forEach((q, idx) => {
    html += `
      <div style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: var(--radius-md); font-weight: 500;">
        <span style="color: var(--accent-primary); font-weight: 700; margin-right: 8px;">Q${idx + 1}.</span> ${window.NexUtils.escapeHTML(q)}
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

window.openSkillGapModal = openSkillGapModal;
window.openApplyModal = openApplyModal;
window.handleGenerateInterview = handleGenerateInterview;
