document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');
  const menuBtn = document.querySelector('[data-menu]');

  /* ---------- Theme ---------- */
  const savedTheme = localStorage.getItem('nexhire-theme');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const applyTheme = theme => {
    root.dataset.theme = theme;
    localStorage.setItem('nexhire-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      window.lucide?.createIcons();
    }
  };
  root.dataset.theme = savedTheme || systemTheme;
  themeToggle?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ---------- Mobile sidebar ---------- */
  const closeMenu = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  };
  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', closeMenu);

  /* ---------- Recruiter profile menu ---------- */
  const profileButton = document.querySelector('[data-profile-menu]');
  const profileDropdown = document.querySelector('[data-profile-dropdown]');
  profileButton?.addEventListener('click', e => {
    e.stopPropagation();
    const open = profileDropdown?.classList.toggle('open');
    profileButton.setAttribute('aria-expanded', String(!!open));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.profile-menu-wrap')) {
      profileDropdown?.classList.remove('open');
      profileButton?.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Toast ---------- */
  const toast = document.querySelector('.toast');
  window.showToast = message => {
    if (!toast) return;
    toast.innerHTML = '<i data-lucide="check-circle-2"></i>' + message;
    toast.classList.add('show');
    window.lucide?.createIcons();
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  document.querySelectorAll('.logout').forEach(link =>
    link.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('nexhire-recruiter-session');
    showToast('Logged out successfully');
    setTimeout(() => location.href = '../recruiter-login.html', 700);
    })
  );

  /* ---------- Shared tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = group.querySelectorAll('.tab');
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      const panels = group.parentElement.querySelectorAll('[data-tab-panel]');
      panels.forEach(panel => panel.hidden = true);
      tab.classList.add('active');
      const panel = group.parentElement.querySelector(`[data-tab-panel="${tab.dataset.tab}"]`);
      if (panel) panel.hidden = false;
    }));
  });

  /* ---------- Jobs storage ---------- */
  const defaultJobs = [
    { id: 'java-backend', title: 'Java Backend Developer', status: 'active', applications: 47, date: '12 Sep 2026', description: 'Build reliable backend services using Java and Spring Boot.' },
    { id: 'full-stack', title: 'Full Stack Developer', status: 'active', applications: 32, date: '10 Sep 2026', description: 'Develop scalable full-stack web applications.' },
    { id: 'data-engineer', title: 'Data Engineer', status: 'active', applications: 18, date: '07 Sep 2026', description: 'Build data pipelines and analytics infrastructure.' },
    { id: 'frontend', title: 'Frontend Developer', status: 'closed', applications: 29, date: '28 Aug 2026', description: 'Create polished and accessible web experiences.' },
    { id: 'ml-engineer', title: 'ML Engineer', status: 'draft', applications: 0, date: '—', description: '' }
  ];
  const getJobs = () => {
    try {
      const jobs = JSON.parse(localStorage.getItem('nexhire-jobs'));
      if (Array.isArray(jobs)) return jobs;
    } catch (_) {}
    localStorage.setItem('nexhire-jobs', JSON.stringify(defaultJobs));
    return [...defaultJobs];
  };
  const saveJobs = jobs => localStorage.setItem('nexhire-jobs', JSON.stringify(jobs));

  /* ---------- Create job ---------- */
  const desc = document.querySelector('#job-description');
  const counter = document.querySelector('#char-count');
  desc?.addEventListener('input', () => {
    if (counter) counter.textContent = `${desc.value.length}/5000`;
  });

  document.querySelector('[data-post-job]')?.addEventListener('click', () => {
    const titleInput = document.querySelector('#job-title');
    const title = titleInput?.value.trim();
    const description = desc?.value.trim();
    if (!title || !description) {
      showToast('Please complete the required fields');
      return;
    }

    const jobs = getJobs();
    const newJob = {
      id: 'job-' + Date.now(),
      title,
      status: 'active',
      applications: 0,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description
    };
    jobs.unshift(newJob);
    saveJobs(jobs);
    localStorage.setItem('nexhire-last-created-job', JSON.stringify(newJob));
    showToast('Job posted successfully');
    setTimeout(() => location.href = 'recruiter_jobs.html', 700);
  });

  /* ---------- Jobs table ---------- */
  const jobsTable = document.querySelector('[data-jobs-table]');
  if (jobsTable) {
    const jobs = getJobs();
    jobsTable.innerHTML = jobs.map(job => `
      <tr data-job-row data-status="${job.status}" data-search-value="jobs">
        <td><strong>${escapeHTML(job.title)}</strong></td>
        <td><span class="status ${job.status}">${capitalize(job.status)}</span></td>
        <td>${job.applications || 0}</td>
        <td>${escapeHTML(job.date)}</td>
        <td><a class="text-link" href="recruiter_job-details.html?job=${encodeURIComponent(job.id)}">View Details</a></td>
      </tr>`).join('');
  }

  /* ---------- Search / filters ---------- */
  const jobSearch = document.querySelector('[data-search="jobs"]');
  const jobFilter = document.querySelector('[data-filter="jobs"]');
  const filterJobs = () => {
    const query = (jobSearch?.value || '').toLowerCase().trim();
    const status = jobFilter?.value || 'all';
    document.querySelectorAll('[data-job-row]').forEach(row => {
      const matchesText = row.textContent.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || row.dataset.status === status;
      row.style.display = matchesText && matchesStatus ? '' : 'none';
    });
  };
  jobSearch?.addEventListener('input', filterJobs);
  jobFilter?.addEventListener('change', filterJobs);

  /* ---------- Generic candidate search ---------- */
  document.querySelectorAll('[data-search]:not([data-search="jobs"])').forEach(input => input.addEventListener('input', () => {
    const target = input.dataset.search;
    const q = input.value.toLowerCase();
    document.querySelectorAll(`[data-search-value="${target}"]`).forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }));

  /* ---------- Dashboard uses saved jobs ---------- */
  const dashboardJobs = document.querySelector('[data-dashboard-jobs]');
  if (dashboardJobs) {
    const jobs = getJobs().filter(j => j.status === 'active').slice(0, 3);
    dashboardJobs.innerHTML = jobs.length ? jobs.map(job => `
      <div class="job-row"><div><div class="job-title">${escapeHTML(job.title)}</div><div class="job-meta">${job.applications || 0} applications · Posted ${escapeHTML(job.date)}</div></div><span class="status active">Active</span><a class="text-link" href="recruiter_job-details.html?job=${encodeURIComponent(job.id)}">View</a></div>`).join('') : '<div class="empty-state">No active jobs yet.</div>';
  }
  const statJobs = document.querySelector('[data-stat-jobs]');
  if (statJobs) statJobs.textContent = getJobs().filter(j => j.status === 'active').length;
  const statApps = document.querySelector('[data-stat-applications]');
  if (statApps) statApps.textContent = getJobs().reduce((sum, j) => sum + Number(j.applications || 0), 0);

  /* ---------- Resume modal ---------- */
  document.querySelectorAll('[data-open-resume]').forEach(btn => btn.addEventListener('click', () => document.querySelector('.modal-backdrop')?.classList.add('open')));
  document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => document.querySelector('.modal-backdrop')?.classList.remove('open')));
  document.querySelector('.modal-backdrop')?.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop')) e.currentTarget.classList.remove('open');
  });

  /* ---------- Recruiter Profile API ---------- */
  const API_BASE_URL = 'https://nexhire-backend-5zv7.onrender.com/api/v1';

  function getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Reuse the token created by the recruiter login flow when available.
    const tokenKeys = [
      'nexhire-token',
      'nexhire-access-token',
      'accessToken',
      'access_token',
      'token'
    ];

    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        return headers;
      }
    }

    // Also support the recruiter session object used by the frontend.
    try {
      const session = JSON.parse(localStorage.getItem('nexhire-recruiter-session') || 'null');
      const token = session?.token || session?.accessToken || session?.access_token;
      if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    } catch (_) {}

    return headers;
  }

  function setProfileField(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined) {
      element.value = value;
    }
  }

  function setProfileText(id, value) {
    const element = document.getElementById(id);
    if (element && value !== null && value !== undefined) {
      element.textContent = value;
    }
  }

  async function loadRecruiterProfile() {
    if (!document.querySelector('[data-save-profile]')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/recruiters/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Profile request failed: ${response.status}`);
      }

      const profile = await response.json();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Recruiter';
      const designation = profile.designation || 'Recruiter';
      const company = profile.companyName || 'Company not added';
      const email = profile.email || '';
      const phone = profile.phone || '';

      setProfileField('name', fullName);
      setProfileField('role', designation);
      setProfileField('email', email);
      setProfileField('phone', phone);
      setProfileField('company', profile.companyName || '');

      setProfileText('profile-display-name', fullName);
      setProfileText('profile-display-designation', designation);
      setProfileText('profile-display-company', company);
      setProfileText('profile-display-email', email);
      setProfileText('profile-display-phone', phone);

      // Use the recruiter's initials in the profile avatar.
      const initials = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2) || 'R';

      document.querySelectorAll('.profile-avatar-xl, .avatar-sm').forEach(el => {
        el.textContent = initials;
      });

      // Keep the top-right recruiter name in sync with the API response.
      const chipName = document.querySelector('.profile-chip-name');
      if (chipName) chipName.textContent = fullName.split(' ')[0] || 'Recruiter';

    } catch (error) {
      console.error('Unable to load recruiter profile:', error);
      showToast('Could not load recruiter profile');
    }
  }

  document.querySelector('[data-save-profile]')?.addEventListener('click', async () => {
    const companyName = document.getElementById('company')?.value.trim() || '';
    const designation = document.getElementById('role')?.value.trim() || '';

    if (!companyName || !designation) {
      showToast('Company name and designation are required');
      return;
    }

    const saveButton = document.querySelector('[data-save-profile]');
    const originalText = saveButton?.innerHTML;

    try {
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<i data-lucide="loader-circle"></i> Saving...';
        window.lucide?.createIcons();
      }

      const response = await fetch(`${API_BASE_URL}/recruiters/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          companyName,
          designation
        })
      });

      if (!response.ok) {
        let message = `Profile update failed: ${response.status}`;
        try {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        } catch (_) {}
        throw new Error(message);
      }

      const profile = await response.json();
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Recruiter';

      setProfileField('company', profile.companyName || '');
      setProfileField('role', profile.designation || '');
      setProfileText('profile-display-name', fullName);
      setProfileText('profile-display-designation', profile.designation || 'Recruiter');
      setProfileText('profile-display-company', profile.companyName || 'Company not added');
      setProfileText('profile-display-email', profile.email || '');
      setProfileText('profile-display-phone', profile.phone || '');

      showToast('Profile changes saved successfully');
    } catch (error) {
      console.error('Unable to update recruiter profile:', error);
      showToast(error.message || 'Could not save profile changes');
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        window.lucide?.createIcons();
      }
    }
  });

  loadRecruiterProfile();

  /* ---------- Utilities ---------- */
  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  }
  function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

  window.lucide?.createIcons();
});
