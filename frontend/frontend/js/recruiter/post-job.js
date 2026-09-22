/* =========================================================
   NexHire — Recruiter Post Job Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
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

  const desc = document.getElementById("jobDescription");
  const charCount = document.getElementById("charCount");

  desc?.addEventListener("input", () => {
    if (charCount) {
      charCount.textContent = `${desc.value.length}/5000`;
    }
  });

  const form = document.getElementById("postJobForm");
  form?.addEventListener("submit", handlePostJob);
});

async function handlePostJob(e) {
  e.preventDefault();

  const msg = document.getElementById("postJobMsg");
  const btn = document.getElementById("postBtn");
  const monitor = document.getElementById("postProcessingMonitor");
  const statusText = document.getElementById("postStatusText");
  const detailText = document.getElementById("postDetailText");

  const jobTitle = document.getElementById("jobTitle")?.value.trim();
  const jobDescription = document.getElementById("jobDescription")?.value.trim();

  if (!jobTitle || !jobDescription) {
    if (msg) {
      msg.textContent = "Please fill in both title and job description.";
      msg.className = "form-message show error";
    }
    return;
  }

  try {
    if (msg) msg.className = "form-message";
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Posting...`;
    if (window.lucide) window.lucide.createIcons();

    if (monitor) monitor.style.display = "block";
    if (statusText) statusText.textContent = "Posting job to backend...";

    // Endpoint 28: POST /api/v1/jobs
    const created = await window.JobApi.createJob(jobTitle, jobDescription);
    const jobId = created.jobId;

    if (statusText) statusText.textContent = `Job #${jobId} submitted (Status: ${created.processingStatus || 'QUEUED'})`;

    // Endpoint 33 & 34: Poll until parsing completed
    await window.JobApi.pollJobUntilCompleted(
      jobId,
      (statusRes) => {
        if (statusText) statusText.textContent = `Processing Job #${jobId} (Status: ${statusRes.status || 'PROCESSING'})`;
        if (detailText) detailText.textContent = statusRes.message || "Parsing JD skills, experience, and education expectations...";
      },
      3000,
      30
    );

    if (monitor) monitor.style.display = "none";
    window.NexUtils.showToast("Job posted and parsed successfully!", "success");

    setTimeout(() => {
      window.location.href = "jobs.html";
    }, 800);
  } catch (err) {
    console.error("Post job error:", err);
    if (monitor) monitor.style.display = "none";
    if (msg) {
      msg.textContent = err.message || "Failed to post job.";
      msg.className = "form-message show error";
    }
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="send"></i> Post Job & Extract Requirements`;
    if (window.lucide) window.lucide.createIcons();
  }
}
