/* =========================================================
   NexHire — Global Theme Switcher (Dark / Light Mode)
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "nexhire-theme";

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || getSystemPreference();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all theme toggle buttons on the page
    document.querySelectorAll(".theme-toggle, [data-theme-toggle]").forEach((btn) => {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

      // Support SVG icon updates if Lucide icons are used
      const sunIcon = btn.querySelector(".theme-sun, [data-lucide='sun']");
      const moonIcon = btn.querySelector(".theme-moon, [data-lucide='moon']");

      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? "inline-block" : "none";
        moonIcon.style.display = isDark ? "none" : "inline-block";
      } else if (window.lucide) {
        btn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        window.lucide.createIcons({ props: { size: 20 } });
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || getSavedTheme();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  function initTheme() {
    applyTheme(getSavedTheme());

    document.querySelectorAll(".theme-toggle, [data-theme-toggle]").forEach((btn) => {
      btn.removeEventListener("click", toggleTheme);
      btn.addEventListener("click", toggleTheme);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  // Listen for OS theme preference changes
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  } catch (e) {}

  window.NexTheme = {
    applyTheme,
    toggleTheme,
    getSavedTheme
  };
})();
