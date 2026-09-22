/* =========================================================
   NexHire — Candidate Resume Controller
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

  // Setup Upload Controls
  setupUploadArea();

  // Load Resumes
  await loadResumesList();
});

let selectedFile = null;

function setupUploadArea() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const fileSelectedArea = document.getElementById("fileSelectedArea");
  const selectedFileName = document.getElementById("selectedFileName");
  const selectedFileType = document.getElementById("selectedFileType");
  const cancelFileBtn = document.getElementById("cancelFileBtn");
  const uploadFileBtn = document.getElementById("uploadFileBtn");

  browseBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  dropzone?.addEventListener("click", () => {
    fileInput?.click();
  });

  dropzone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--accent-primary)";
  });

  dropzone?.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "var(--border-color-hover)";
  });

  dropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--border-color-hover)";
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const valid = ["pdf", "jpg", "jpeg", "txt", "docx"];

    if (!valid.includes(ext)) {
      window.NexUtils.showToast("Only PDF, JPG, JPEG, TXT, and DOCX files are supported.", "error");
      return;
    }

    selectedFile = file;
    if (selectedFileName) selectedFileName.textContent = file.name;
    if (selectedFileType) selectedFileType.textContent = `${ext.toUpperCase()} File (${(file.size / 1024).toFixed(1)} KB)`;
    if (fileSelectedArea) fileSelectedArea.style.display = "block";
  }

  cancelFileBtn?.addEventListener("click", () => {
    selectedFile = null;
    if (fileInput) fileInput.value = "";
    if (fileSelectedArea) fileSelectedArea.style.display = "none";
  });

  uploadFileBtn?.addEventListener("click", async () => {
    if (!selectedFile) return;
    await performUpload(selectedFile);
  });
}

async function performUpload(file) {
  const fileSelectedArea = document.getElementById("fileSelectedArea");
  const processingMonitor = document.getElementById("processingMonitor");
  const statusText = document.getElementById("processingStatusText");
  const detailText = document.getElementById("processingDetailText");

  try {
    if (fileSelectedArea) fileSelectedArea.style.display = "none";
    if (processingMonitor) processingMonitor.style.display = "block";
    if (statusText) statusText.textContent = "Uploading resume file...";

    // 1. POST /api/v1/resumes (Endpoint 9)
    const uploadRes = await window.ResumeApi.uploadResume(file);
    const resumeId = uploadRes.resumeId;

    if (statusText) statusText.textContent = `Resume uploaded (ID: ${resumeId}). Status: ${uploadRes.status || 'QUEUED'}`;
    if (detailText) detailText.textContent = "Waiting for RabbitMQ worker to parse skills...";

    // 2. Poll processing status until COMPLETED (Endpoint 12 & 13)
    const result = await window.ResumeApi.pollUntilCompleted(
      resumeId,
      (statusRes) => {
        if (statusText) statusText.textContent = `Status: ${statusRes.status || 'PROCESSING'}`;
        if (detailText) detailText.textContent = statusRes.message || "Parsing skills and profile data...";
      },
      3000,
      30
    );

    if (processingMonitor) processingMonitor.style.display = "none";
    window.NexUtils.showToast("Resume parsed successfully!", "success");

    selectedFile = null;
    document.getElementById("fileInput").value = "";

    // Refresh resume list & display parsed content
    await loadResumesList();
    renderParsedResume(result.parsedData);
  } catch (err) {
    console.error("Resume upload error:", err);
    if (processingMonitor) processingMonitor.style.display = "none";
    if (fileSelectedArea) fileSelectedArea.style.display = "block";
    window.NexUtils.showToast(err.message || "Upload or parsing failed.", "error");
  }
}

async function loadResumesList() {
  const container = document.getElementById("resumeListContainer");
  if (!container) return;

  try {
    // Endpoint 10: GET /api/v1/resumes
    const resumes = await window.ResumeApi.getAllResumes();

    if (!Array.isArray(resumes) || resumes.length === 0) {
      window.NexUtils.renderEmptyState(container, "No Resumes Uploaded", "Upload your first resume above to get started.");
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

    resumes.forEach((r) => {
      const statusClass = (r.processingStatus || r.status || "QUEUED").toLowerCase();
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md); flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <i data-lucide="file-text" style="width: 32px; height: 32px; color: var(--accent-primary);"></i>
            <div>
              <strong style="font-size: 0.9375rem;">${window.NexUtils.escapeHTML(r.fileName)}</strong>
              <div style="font-size: 0.8125rem; color: var(--text-muted);">
                Type: ${r.fileType || 'PDF'} &bull; Uploaded: ${window.NexUtils.formatDate(r.createdAt)}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="status-badge status-${statusClass}">${r.processingStatus || r.status || 'QUEUED'}</span>
            <button class="button button-secondary button-small" onclick="viewParsedResume(${r.resumeId})">
              View Parsed Data
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Automatically load parsed view for first completed resume
    const firstCompleted = resumes.find((r) => r.processingStatus === "COMPLETED" || r.status === "COMPLETED");
    if (firstCompleted) {
      viewParsedResume(firstCompleted.resumeId);
    }
  } catch (err) {
    console.error("Load resumes list error:", err);
    window.NexUtils.renderEmptyState(container, "Error Loading Resumes", err.message);
  }
}

async function viewParsedResume(resumeId) {
  const card = document.getElementById("parsedDataCard");
  const body = document.getElementById("parsedDataBody");
  if (!card || !body) return;

  try {
    body.innerHTML = `<div class="skeleton-card"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-text"></div></div>`;
    card.style.display = "block";

    // Endpoint 13: GET /api/v1/resumes/{resumeId}/parsed-data
    const data = await window.ResumeApi.getParsedResumeData(resumeId);
    renderParsedResume(data);
  } catch (err) {
    console.error("View parsed resume error:", err);
    body.innerHTML = `<p style="color: var(--status-failed-text);">Failed to load parsed resume data: ${window.NexUtils.escapeHTML(err.message)}</p>`;
  }
}

window.viewParsedResume = viewParsedResume;

function renderParsedResume(data) {
  const card = document.getElementById("parsedDataCard");
  const body = document.getElementById("parsedDataBody");
  if (!card || !body || !data) return;

  card.style.display = "block";

  const profile = data.profile || {};
  const skills = data.skills || [];
  const education = data.education || [];
  const experience = data.experience || [];
  const projects = data.projects || [];

  let html = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      <div>
        <h4 style="margin-bottom: 8px; color: var(--accent-primary);">Candidate Info</h4>
        <p><strong>Name:</strong> ${window.NexUtils.escapeHTML(profile.name || 'N/A')}</p>
        <p><strong>Email:</strong> ${window.NexUtils.escapeHTML(profile.email || 'N/A')}</p>
        <p><strong>Phone:</strong> ${window.NexUtils.escapeHTML(profile.phone || 'N/A')}</p>
        <p><strong>Years of Experience:</strong> ${profile.yearsOfExperience !== undefined ? profile.yearsOfExperience : 'N/A'}</p>
      </div>

      <div>
        <h4 style="margin-bottom: 8px; color: var(--accent-primary);">Parsed Skills</h4>
        <div>${window.NexUtils.renderSkillChips(skills)}</div>
      </div>
    </div>
  `;

  if (Array.isArray(experience) && experience.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 8px; color: var(--accent-primary);">Experience</h4>
        <ul style="padding-left: 20px; color: var(--text-secondary);">
          ${experience.map((e) => `<li>${window.NexUtils.escapeHTML(typeof e === 'string' ? e : (e.title || e.company || JSON.stringify(e)))}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(education) && education.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 8px; color: var(--accent-primary);">Education</h4>
        <ul style="padding-left: 20px; color: var(--text-secondary);">
          ${education.map((ed) => `<li>${window.NexUtils.escapeHTML(typeof ed === 'string' ? ed : (ed.degree || ed.institution || JSON.stringify(ed)))}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  body.innerHTML = html;
}
