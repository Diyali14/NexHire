/* =========================================================
   NexHire — Homepage JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const header = document.getElementById("site-header");
  const themeToggle = document.querySelector(".theme-toggle");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navPanel = document.getElementById("main-nav");
  const dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
  const dropdownWraps = document.querySelectorAll(".nav-menu-wrap");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialize Lucide icons.
  if (window.lucide) {
    lucide.createIcons();
  }

  /* ---------------------------------------------------------
     Theme
     --------------------------------------------------------- */
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const applyTheme = (theme, persist = true) => {
    root.dataset.theme = theme;

    if (persist) {
      localStorage.setItem("nexhire-theme", theme);
    }

    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  const savedTheme = localStorage.getItem("nexhire-theme");
  applyTheme(savedTheme || getSystemTheme(), Boolean(savedTheme));

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  // If the user has not chosen a theme, follow system preference changes.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!localStorage.getItem("nexhire-theme")) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  });

  /* ---------------------------------------------------------
     Navbar scroll state
     --------------------------------------------------------- */
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  const closeMobileMenu = () => {
    navPanel?.classList.remove("open");
    mobileToggle?.setAttribute("aria-expanded", "false");

    if (mobileToggle) {
      mobileToggle.setAttribute("aria-label", "Open navigation menu");
    }
  };

  mobileToggle?.addEventListener("click", () => {
    const open = navPanel.classList.toggle("open");
    mobileToggle.setAttribute("aria-expanded", String(open));
    mobileToggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );

    // Close open dropdowns when opening/closing the mobile panel.
    if (!open) closeDropdowns();
  });

  /* ---------------------------------------------------------
     Dropdown menus
     --------------------------------------------------------- */
  const closeDropdowns = (except = null) => {
    dropdownWraps.forEach((wrap) => {
      if (wrap === except) return;

      const trigger = wrap.querySelector(".dropdown-trigger");
      const menu = wrap.querySelector(".dropdown-menu");

      trigger?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("open");
    });
  };

  dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();

      const wrap = trigger.closest(".nav-menu-wrap");
      const menu = wrap?.querySelector(".dropdown-menu");
      if (!wrap || !menu) return;

      const willOpen = !menu.classList.contains("open");
      closeDropdowns(wrap);

      menu.classList.toggle("open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-menu-wrap")) {
      closeDropdowns();
    }

    if (
      navPanel?.classList.contains("open") &&
      !event.target.closest(".navbar")
    ) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdowns();
      closeMobileMenu();
    }
  });

  // Close the mobile menu after navigation.
  document.querySelectorAll('.nav-links a, .brand').forEach((link) => {
    link.addEventListener("click", () => {
      closeDropdowns();
      closeMobileMenu();
    });
  });

  /* ---------------------------------------------------------
     Smooth scrolling for same-page navigation
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header?.offsetHeight || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14;

      window.scrollTo({
        top,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  });

  /* ---------------------------------------------------------
     Intersection Observer — section reveal
     --------------------------------------------------------- */
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Small keyboard improvement for dropdown triggers
     --------------------------------------------------------- */
  dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        const wrap = trigger.closest(".nav-menu-wrap");
        const menu = wrap?.querySelector(".dropdown-menu");

        if (!menu) return;

        closeDropdowns(wrap);
        menu.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");

        menu.querySelector("a")?.focus();
      }
    });
  });

  /* ---------------------------------------------------------
     Refresh icons if the DOM is modified by the theme/menu UI.
     --------------------------------------------------------- */
  if (window.lucide) {
    lucide.createIcons();
  }
});
