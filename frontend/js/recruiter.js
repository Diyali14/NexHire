document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');
  const menuBtn = document.querySelector('[data-menu]');

  /* =========================================================
     THEME
  ========================================================= */

  const savedTheme = localStorage.getItem('nexhire-theme');

  const systemTheme =
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem('nexhire-theme', theme);

    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      );

      themeToggle.innerHTML =
        theme === 'dark'
          ? '<i data-lucide="sun"></i>'
          : '<i data-lucide="moon"></i>';

      window.lucide?.createIcons();
    }
  };

  root.dataset.theme = savedTheme || systemTheme;

  themeToggle?.addEventListener('click', () => {
    applyTheme(
      root.dataset.theme === 'dark'
        ? 'light'
        : 'dark'
    );
  });


  /* =========================================================
     MOBILE SIDEBAR
  ========================================================= */

  const closeMenu = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  };

  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
  });

  overlay?.addEventListener('click', closeMenu);


  /* =========================================================
     RECRUITER PROFILE MENU
  ========================================================= */

  const profileButton =
    document.querySelector('[data-profile-menu]');

  const profileDropdown =
    document.querySelector('[data-profile-dropdown]');

  profileButton?.addEventListener('click', (event) => {
    event.stopPropagation();

    const isOpen =
      profileDropdown?.classList.toggle('open');

    profileButton.setAttribute(
      'aria-expanded',
      String(!!isOpen)
    );
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.profile-menu-wrap')) {
      profileDropdown?.classList.remove('open');

      profileButton?.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  });


  /* =========================================================
     TOAST
  ========================================================= */

  const toast = document.querySelector('.toast');

  window.showToast = (message) => {
    if (!toast) return;

    toast.innerHTML =
      '<i data-lucide="check-circle-2"></i>' +
      message;

    toast.classList.add('show');

    window.lucide?.createIcons();

    clearTimeout(window.__toastTimer);

    window.__toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  document.querySelectorAll('.logout').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      sessionStorage.removeItem('nexhire-recruiter-token');
      sessionStorage.removeItem('nexhire-token');
      sessionStorage.removeItem('nexhire-access-token');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('nexhire-recruiter-session');

      showToast('Logged out successfully');

      setTimeout(() => {
        window.location.href = './recruiter-login.html';
      }, 700);
    });
  });


  /* =========================================================
     SHARED TABS
  ========================================================= */

  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = group.querySelectorAll('.tab');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((item) => {
          item.classList.remove('active');
        });

        const panels =
          group.parentElement.querySelectorAll(
            '[data-tab-panel]'
          );

        panels.forEach((panel) => {
          panel.hidden = true;
        });

        tab.classList.add('active');

        const panel =
          group.parentElement.querySelector(
            `[data-tab-panel="${tab.dataset.tab}"]`
          );

        if (panel) {
          panel.hidden = false;
        }
      });
    });
  });


  /* =========================================================
     JOBS STORAGE
  ========================================================= */

  const defaultJobs = [
    {
      id: 'java-backend',
      title: 'Java Backend Developer',
      status: 'active',
      applications: 47,
      date: '12 Sep 2026',
      description:
        'Build reliable backend services using Java and Spring Boot.'
    },
    {
      id: 'full-stack',
      title: 'Full Stack Developer',
      status: 'active',
      applications: 32,
      date: '10 Sep 2026',
      description:
        'Develop scalable full-stack web applications.'
    },
    {
      id: 'data-engineer',
      title: 'Data Engineer',
      status: 'active',
      applications: 18,
      date: '07 Sep 2026',
      description:
        'Build data pipelines and analytics infrastructure.'
    },
    {
      id: 'frontend',
      title: 'Frontend Developer',
      status: 'closed',
      applications: 29,
      date: '28 Aug 2026',
      description:
        'Create polished and accessible web experiences.'
    },
    {
      id: 'ml-engineer',
      title: 'ML Engineer',
      status: 'draft',
      applications: 0,
      date: '—',
      description: ''
    }
  ];

  const getJobs = () => {
    try {
      const jobs =
        JSON.parse(
          localStorage.getItem('nexhire-jobs')
        );

      if (Array.isArray(jobs)) {
        return jobs;
      }
    } catch (error) {
      console.error(
        'Unable to read jobs from localStorage:',
        error
      );
    }

    localStorage.setItem(
      'nexhire-jobs',
      JSON.stringify(defaultJobs)
    );

    return [...defaultJobs];
  };

  const saveJobs = (jobs) => {
    localStorage.setItem(
      'nexhire-jobs',
      JSON.stringify(jobs)
    );
  };


  /* =========================================================
     CREATE JOB
  ========================================================= */

  const desc =
    document.querySelector('#job-description');

  const counter =
    document.querySelector('#char-count');

  desc?.addEventListener('input', () => {
    if (counter) {
      counter.textContent =
        `${desc.value.length}/5000`;
    }
  });

  document
    .querySelector('[data-post-job]')
    ?.addEventListener('click', () => {

      const titleInput =
        document.querySelector('#job-title');

      const title =
        titleInput?.value.trim();

      const description =
        desc?.value.trim();

      if (!title || !description) {
        showToast(
          'Please complete the required fields'
        );
        return;
      }

      const jobs = getJobs();

      const newJob = {
        id: 'job-' + Date.now(),
        title,
        status: 'active',
        applications: 0,
        date: new Date().toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        ),
        description
      };

      jobs.unshift(newJob);

      saveJobs(jobs);

      localStorage.setItem(
        'nexhire-last-created-job',
        JSON.stringify(newJob)
      );

      showToast('Job posted successfully');

      setTimeout(() => {
        window.location.href =
          'recruiter_jobs.html';
      }, 700);
    });


  /* =========================================================
     JOBS TABLE
  ========================================================= */

  const jobsTable =
    document.querySelector('[data-jobs-table]');

  if (jobsTable) {
    const jobs = getJobs();

    jobsTable.innerHTML = jobs
      .map((job) => `
        <tr
          data-job-row
          data-status="${escapeHTML(job.status)}"
          data-search-value="jobs"
        >
          <td>
            <strong>
              ${escapeHTML(job.title)}
            </strong>
          </td>

          <td>
            <span class="status ${escapeHTML(job.status)}">
              ${capitalize(job.status)}
            </span>
          </td>

          <td>
            ${job.applications || 0}
          </td>

          <td>
            ${escapeHTML(job.date)}
          </td>

          <td>
            <a
              class="text-link"
              href="recruiter_job-details.html?job=${encodeURIComponent(job.id)}"
            >
              View Details
            </a>
          </td>
        </tr>
      `)
      .join('');
  }


  /* =========================================================
     SEARCH / FILTERS
  ========================================================= */

  const jobSearch =
    document.querySelector('[data-search="jobs"]');

  const jobFilter =
    document.querySelector('[data-filter="jobs"]');

  const filterJobs = () => {
    const query =
      (jobSearch?.value || '')
        .toLowerCase()
        .trim();

    const status =
      jobFilter?.value || 'all';

    document
      .querySelectorAll('[data-job-row]')
      .forEach((row) => {

        const matchesText =
          row.textContent
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          status === 'all' ||
          row.dataset.status === status;

        row.style.display =
          matchesText && matchesStatus
            ? ''
            : 'none';
      });
  };

  jobSearch?.addEventListener(
    'input',
    filterJobs
  );

  jobFilter?.addEventListener(
    'change',
    filterJobs
  );


  /* =========================================================
     GENERIC CANDIDATE SEARCH
  ========================================================= */

  document
    .querySelectorAll(
      '[data-search]:not([data-search="jobs"])'
    )
    .forEach((input) => {

      input.addEventListener('input', () => {

        const target =
          input.dataset.search;

        const query =
          input.value
            .toLowerCase()
            .trim();

        document
          .querySelectorAll(
            `[data-search-value="${target}"]`
          )
          .forEach((element) => {

            element.style.display =
              element.textContent
                .toLowerCase()
                .includes(query)
                ? ''
                : 'none';
          });
      });
    });


  /* =========================================================
     DASHBOARD JOBS
  ========================================================= */

  const dashboardJobs =
    document.querySelector(
      '[data-dashboard-jobs]'
    );

  if (dashboardJobs) {

    const jobs =
      getJobs()
        .filter(
          (job) => job.status === 'active'
        )
        .slice(0, 3);

    dashboardJobs.innerHTML =
      jobs.length
        ? jobs
            .map((job) => `
              <div class="job-row">

                <div>
                  <div class="job-title">
                    ${escapeHTML(job.title)}
                  </div>

                  <div class="job-meta">
                    ${job.applications || 0}
                    applications · Posted
                    ${escapeHTML(job.date)}
                  </div>
                </div>

                <span class="status active">
                  Active
                </span>

                <a
                  class="text-link"
                  href="recruiter_job-details.html?job=${encodeURIComponent(job.id)}"
                >
                  View
                </a>

              </div>
            `)
            .join('')
        : `
          <div class="empty-state">
            No active jobs yet.
          </div>
        `;
  }


  const statJobs =
    document.querySelector(
      '[data-stat-jobs]'
    );

  if (statJobs) {
    statJobs.textContent =
      getJobs().filter(
        (job) => job.status === 'active'
      ).length;
  }


  const statApps =
    document.querySelector(
      '[data-stat-applications]'
    );

  if (statApps) {
    statApps.textContent =
      getJobs().reduce(
        (sum, job) =>
          sum + Number(job.applications || 0),
        0
      );
  }


  /* =========================================================
     RESUME MODAL
  ========================================================= */

  document
    .querySelectorAll('[data-open-resume]')
    .forEach((button) => {

      button.addEventListener('click', () => {
        document
          .querySelector('.modal-backdrop')
          ?.classList.add('open');
      });
    });

  document
    .querySelectorAll('[data-close-modal]')
    .forEach((button) => {

      button.addEventListener('click', () => {
        document
          .querySelector('.modal-backdrop')
          ?.classList.remove('open');
      });
    });

  document
    .querySelector('.modal-backdrop')
    ?.addEventListener('click', (event) => {

      if (
        event.target.classList.contains(
          'modal-backdrop'
        )
      ) {
        event.currentTarget.classList.remove(
          'open'
        );
      }
    });


  /* =========================================================
     RECRUITER PROFILE API
  ========================================================= */

  const API_BASE_URL =
    'https://nexhire-backend-5zv7.onrender.com/api/v1';


  /*
   * Get JWT token from localStorage.
   *
   * Recommended:
   *
   * localStorage.setItem(
   *   'nexhire-recruiter-token',
   *   token
   * );
   *
   * The fallback keys below allow this code to
   * work with your existing login implementation.
   */
  function getAuthHeaders() {

    const tokenKeys = [
      'nexhire-recruiter-token',
      'nexhire-token',
      'nexhire-access-token',
      'accessToken',
      'access_token',
      'token'
    ];

    let token = null;

    for (const key of tokenKeys) {

      const value =
        sessionStorage.getItem(key);

      if (value) {
        token = value;
        break;
      }
    }


    /*
     * Also check recruiter session object.
     */
    if (!token) {

      try {

        const session =
          JSON.parse(
            localStorage.getItem(
              'nexhire-recruiter-session'
            ) || 'null'
          );

        token =
          session?.token ||
          session?.accessToken ||
          session?.access_token ||
          null;

      } catch (error) {

        console.error(
          'Unable to parse recruiter session:',
          error
        );
      }
    }


    if (!token) {
      throw new Error(
        'Recruiter authentication token not found'
      );
    }


    return {
      'Content-Type': 'application/json',
      'Authorization':
        token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`
    };
  }


  /* =========================================================
     PROFILE ELEMENT HELPERS
  ========================================================= */

  function setProfileField(id, value) {

    const element =
      document.getElementById(id);

    if (
      element &&
      value !== null &&
      value !== undefined
    ) {
      element.value = value;
    }
  }


  function setProfileText(id, value) {

    const element =
      document.getElementById(id);

    if (
      element &&
      value !== null &&
      value !== undefined
    ) {
      element.textContent = value;
    }
  }


  /* =========================================================
     PROFILE STATE
  ========================================================= */

  let currentProfile = null;


  /* =========================================================
     UPDATE PROFILE UI
  ========================================================= */

  function renderRecruiterProfile(profile) {

    currentProfile = profile;

    const fullName =
      [
        profile.firstName,
        profile.lastName
      ]
        .filter(Boolean)
        .join(' ') || 'Recruiter';

    const designation =
      profile.designation ||
      'Recruiter';

    const company =
      profile.companyName ||
      'Company not added';

    const email =
      profile.email || '';

    const phone =
      profile.phone || '';


    /*
     * Form fields
     */
    setProfileField(
      'name',
      fullName
    );

    setProfileField(
      'role',
      profile.designation || ''
    );

    setProfileField(
      'email',
      email
    );

    setProfileField(
      'phone',
      phone
    );

    setProfileField(
      'company',
      profile.companyName || ''
    );


    /*
     * Profile summary
     */
    setProfileText(
      'profile-display-name',
      fullName
    );

    setProfileText(
      'profile-display-designation',
      designation
    );

    setProfileText(
      'profile-display-company',
      company
    );

    setProfileText(
      'profile-display-email',
      email
    );

    setProfileText(
      'profile-display-phone',
      phone
    );


    /*
     * Avatar initials
     */
    const initials =
      [
        profile.firstName,
        profile.lastName
      ]
        .filter(Boolean)
        .map(
          (name) =>
            name.charAt(0).toUpperCase()
        )
        .join('')
        .slice(0, 2) || 'R';


    document
      .querySelectorAll(
        '.profile-avatar-xl, .avatar-sm'
      )
      .forEach((element) => {
        element.textContent = initials;
      });


    /*
     * Top-right name
     */
    const chipName =
      document.querySelector(
        '.profile-chip-name'
      );

    if (chipName) {
      chipName.textContent =
        profile.firstName ||
        fullName.split(' ')[0] ||
        'Recruiter';
    }
  }


  /* =========================================================
     EDIT MODE
  ========================================================= */

  function setEditMode(isEditing) {

    const companyInput =
      document.getElementById('company');

    const roleInput =
      document.getElementById('role');

    const editButton =
      document.querySelector(
        '[data-edit-profile]'
      );

    const saveButton =
      document.querySelector(
        '[data-save-profile]'
      );

    const cancelButton =
      document.querySelector(
        '[data-cancel-profile]'
      );


    if (companyInput) {
      companyInput.readOnly = !isEditing;
    }

    if (roleInput) {
      roleInput.readOnly = !isEditing;
    }


    if (editButton) {
      editButton.hidden = isEditing;
    }

    if (saveButton) {
      saveButton.hidden = !isEditing;
    }

    if (cancelButton) {
      cancelButton.hidden = !isEditing;
    }


    if (isEditing) {
      companyInput?.focus();
    }
  }


  /* =========================================================
     LOAD RECRUITER PROFILE
  ========================================================= */

  async function loadRecruiterProfile() {

    /*
     * Only run this API logic on the profile page.
     */
    if (
      !document.querySelector(
        '[data-save-profile]'
      )
    ) {
      return;
    }


    const profilePage =
      document.querySelector(
        '.profile-page'
      );


    try {

      profilePage?.classList.add(
        'profile-loading'
      );


      const response =
        await fetch(
          `${API_BASE_URL}/recruiters/me`,
          {
            method: 'GET',
            headers: getAuthHeaders()
          }
        );


      /*
       * Authentication failed.
       */
      if (response.status === 401) {

        showToast(
          'Session expired. Please login again.'
        );

        setTimeout(() => {
          window.location.href =
            '../recruiter-login.html';
        }, 900);

        return;
      }


      if (!response.ok) {

        throw new Error(
          `Profile request failed: ${response.status}`
        );
      }


      const profile =
        await response.json();


      console.log(
        'Recruiter profile loaded:',
        profile
      );


      renderRecruiterProfile(
        profile
      );


    } catch (error) {

      console.error(
        'Unable to load recruiter profile:',
        error
      );


      if (
        error.message.includes(
          'authentication token'
        )
      ) {

        showToast(
          'Please login as a recruiter first.'
        );

      } else {

        showToast(
          'Could not load recruiter profile'
        );
      }


    } finally {

      profilePage?.classList.remove(
        'profile-loading'
      );
    }
  }


  /* =========================================================
     EDIT PROFILE BUTTON
  ========================================================= */

  document
    .querySelector('[data-edit-profile]')
    ?.addEventListener('click', () => {

      setEditMode(true);
    });


  /* =========================================================
     CANCEL PROFILE EDIT
  ========================================================= */

  document
    .querySelector('[data-cancel-profile]')
    ?.addEventListener('click', () => {

      /*
       * Restore values received from backend.
       */
      if (currentProfile) {
        renderRecruiterProfile(
          currentProfile
        );
      }

      setEditMode(false);
    });


  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  document
    .querySelector('[data-save-profile]')
    ?.addEventListener(
      'click',
      async () => {

        const companyInput =
          document.getElementById('company');

        const roleInput =
          document.getElementById('role');

        const saveButton =
          document.querySelector(
            '[data-save-profile]'
          );


        const companyName =
          companyInput?.value.trim() || '';

        const designation =
          roleInput?.value.trim() || '';


        /*
         * Validation
         */
        if (!companyName) {

          showToast(
            'Company name is required'
          );

          companyInput?.focus();

          return;
        }


        if (!designation) {

          showToast(
            'Designation is required'
          );

          roleInput?.focus();

          return;
        }


        const originalText =
          saveButton?.innerHTML;


        try {

          /*
           * Disable button while request
           * is being processed.
           */
          if (saveButton) {

            saveButton.disabled = true;

            saveButton.innerHTML =
              '<i data-lucide="loader-circle"></i> Saving...';

            window.lucide?.createIcons();
          }


          /*
           * PUT /recruiters/me
           */
          const response =
            await fetch(
              `${API_BASE_URL}/recruiters/me`,
              {
                method: 'PUT',

                headers:
                  getAuthHeaders(),

                body:
                  JSON.stringify({
                    companyName,
                    designation
                  })
              }
            );


          /*
           * Authentication error.
           */
          if (response.status === 401) {

            throw new Error(
              'Your session has expired. Please login again.'
            );
          }


          /*
           * Other backend errors.
           */
          if (!response.ok) {

            let message =
              `Profile update failed: ${response.status}`;

            try {

              const errorData =
                await response.json();

              message =
                errorData.message ||
                errorData.error ||
                message;

            } catch (error) {
              // Backend didn't return JSON.
            }

            throw new Error(message);
          }


          /*
           * Backend returns the updated
           * recruiter profile.
           */
          const updatedProfile =
            await response.json();


          console.log(
            'Recruiter profile updated:',
            updatedProfile
          );


          /*
           * Render returned backend data.
           */
          renderRecruiterProfile(
            updatedProfile
          );


          /*
           * Leave edit mode.
           */
          setEditMode(false);


          showToast(
            'Profile changes saved successfully'
          );


        } catch (error) {

          console.error(
            'Unable to update recruiter profile:',
            error
          );


          showToast(
            error.message ||
            'Could not save profile changes'
          );


          /*
           * If token expired, redirect to login.
           */
          if (
            error.message.includes(
              'session has expired'
            )
          ) {

            setTimeout(() => {
              window.location.href =
                '../recruiter-login.html';
            }, 1000);
          }


        } finally {

          if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML =
              originalText;

            window.lucide?.createIcons();
          }
        }
      }
    );


  /* =========================================================
     PROFILE INITIALIZATION
  ========================================================= */

  /*
   * Start with read-only fields.
   */
  setEditMode(false);


  /*
   * Fetch recruiter profile.
   */
  loadRecruiterProfile();


  /* =========================================================
     UTILITIES
  ========================================================= */

  function escapeHTML(value) {

    return String(value).replace(
      /[&<>'"]/g,
      (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character])
    );
  }


  function capitalize(value) {

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }


  window.lucide?.createIcons();
});