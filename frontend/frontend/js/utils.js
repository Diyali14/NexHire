/* =========================================================
   NexHire — Global UI Utilities & Component Helpers
   ========================================================= */

(function () {
  "use strict";

  const NexUtils = {
    /**
     * Escape raw HTML to prevent XSS vulnerabilities
     */
    escapeHTML(str) {
      if (str === null || str === undefined) return "";
      return String(str).replace(
        /[&<>'"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]
      );
    },

    /**
     * Format ISO date string into human readable date
     */
    formatDate(dateString) {
      if (!dateString) return "N/A";
      try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      } catch (e) {
        return dateString;
      }
    },

    /**
     * Display a floating toast notification
     */
    showToast(message, type = "info") {
      let toastContainer = document.querySelector(".toast-container");
      if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className = "toast-container";
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;

      let iconName = "info";
      if (type === "success") iconName = "check-circle-2";
      if (type === "error") iconName = "alert-triangle";
      if (type === "warning") iconName = "alert-circle";

      toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div class="toast-message">${this.escapeHTML(message)}</div>
        <button class="toast-close" type="button" aria-label="Close notification">&times;</button>
      `;

      toastContainer.appendChild(toast);
      if (window.lucide) window.lucide.createIcons();

      const timer = setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
      }, 3500);

      toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(timer);
        toast.remove();
      });
    },

    /**
     * Render empty state card into a container
     */
    renderEmptyState(container, title, message, actionBtnHTML = "") {
      if (!container) return;
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i data-lucide="inbox"></i></div>
          <h3>${this.escapeHTML(title)}</h3>
          <p>${this.escapeHTML(message)}</p>
          ${actionBtnHTML ? `<div class="empty-action">${actionBtnHTML}</div>` : ""}
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    },

    /**
     * Render skeleton loader inside container
     */
    renderSkeleton(container, count = 3) {
      if (!container) return;
      let html = "";
      for (let i = 0; i < count; i++) {
        html += `
          <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-short"></div>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    /**
     * Format skills array into stylized HTML badges
     */
    renderSkillChips(skills) {
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return '<span class="text-muted">No skills listed</span>';
      }
      return skills
        .map((s) => {
          const name = typeof s === "string" ? s : s.name || s.normalizedName || "";
          const importance = s.importance ? ` chip-${s.importance.toLowerCase()}` : "";
          return `<span class="skill-chip${importance}">${this.escapeHTML(name)}</span>`;
        })
        .join(" ");
    },

    /**
     * Render AI Match Score pill badge
     */
    renderScoreBadge(score) {
      if (score === null || score === undefined) {
        return '<span class="score-badge score-pending">Pending</span>';
      }
      const num = Number(score);
      let className = "score-low";
      if (num >= 80) className = "score-high";
      else if (num >= 60) className = "score-mid";

      return `<span class="score-badge ${className}"><strong>${num}%</strong> Match</span>`;
    }
  };

  window.NexUtils = NexUtils;
})();
