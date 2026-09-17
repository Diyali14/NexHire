/* =========================================================
   NEXHIRE — RECOMMENDED JOBS
   ========================================================= */


:root {

    --bg-primary: #f7f9fc;
    --bg-secondary: #ffffff;
    --bg-tertiary: #eef2f8;

    --surface: rgba(255, 255, 255, 0.82);

    --text-primary: #111827;
    --text-secondary: #5e6879;
    --text-muted: #8791a2;

    --accent-primary: #4f46e5;
    --accent-secondary: #0ea5e9;
    --accent-purple: #7c3aed;

    --accent-soft: rgba(79, 70, 229, 0.10);
    --accent-border: rgba(79, 70, 229, 0.20);

    --border-color: #e4e8ef;
    --border-strong: #d6dce7;

    --dark-cta: #10162a;

    --success: #16a34a;
    --warning: #f59e0b;

    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 18px;
    --radius-xl: 24px;

    --header-height: 74px;

    --max-width: 1450px;
}


[data-theme="dark"] {

    --bg-primary: #0b1020;
    --bg-secondary: #111827;
    --bg-tertiary: #182033;

    --surface: rgba(17, 24, 39, 0.85);

    --text-primary: #f8fafc;
    --text-secondary: #aab4c5;
    --text-muted: #768198;

    --accent-primary: #818cf8;
    --accent-secondary: #38bdf8;
    --accent-purple: #a78bfa;

    --accent-soft: rgba(129, 140, 248, 0.12);
    --accent-border: rgba(129, 140, 248, 0.25);

    --border-color: #263047;
    --border-strong: #34405a;

    --dark-cta: #f8fafc;
}


/* =========================================================
   RESET
   ========================================================= */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}


html {
    scroll-behavior: smooth;
}


body {

    font-family: "DM Sans", sans-serif;

    background:

        radial-gradient(
            circle at 10% 5%,
            rgba(79, 70, 229, 0.08),
            transparent 30%
        ),

        radial-gradient(
            circle at 90% 70%,
            rgba(14, 165, 233, 0.07),
            transparent 30%
        ),

        var(--bg-primary);

    color: var(--text-primary);

    min-height: 100vh;

    transition:
        background 0.25s ease,
        color 0.25s ease;
}


button,
input,
select {
    font: inherit;
}


button {
    cursor: pointer;
}


a {
    color: inherit;
    text-decoration: none;
}


svg {
    width: 18px;
    height: 18px;
}


/* =========================================================
   HEADER
   ========================================================= */

.site-header {

    position: sticky;

    top: 0;

    z-index: 1000;

    height: var(--header-height);

    border-bottom: 1px solid var(--border-color);

    background: rgba(247, 249, 252, 0.82);

    backdrop-filter: blur(18px);

    transition: 0.25s ease;
}


[data-theme="dark"] .site-header {
    background: rgba(11, 16, 32, 0.84);
}


.site-header.scrolled {

    box-shadow:
        0 10px 30px rgba(15, 23, 42, 0.07);
}


.nav-container {

    max-width: var(--max-width);

    height: 100%;

    margin: auto;

    padding: 0 28px;

    display: flex;

    align-items: center;

    justify-content: space-between;
}


/* =========================================================
   LOGO
   ========================================================= */

.logo {

    display: flex;

    align-items: center;

    gap: 10px;

    font-family: "Space Grotesk", sans-serif;

    font-size: 21px;

    font-weight: 700;
}


.logo > span:last-child span {

    color: var(--accent-primary);
}


.logo-icon {

    width: 35px;
    height: 35px;

    display: grid;

    place-items: center;

    border-radius: 11px;

    color: white;

    background:

        linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-secondary)
        );

    box-shadow:
        0 8px 18px rgba(79, 70, 229, 0.22);
}


.logo-icon svg {
    width: 18px;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

.desktop-nav {

    display: flex;

    align-items: center;

    gap: 6px;

    margin-left: auto;

    margin-right: 25px;
}


.desktop-nav a {

    padding: 9px 13px;

    border-radius: 9px;

    color: var(--text-secondary);

    font-size: 14px;

    font-weight: 500;

    transition: 0.2s ease;
}


.desktop-nav a:hover {

    color: var(--text-primary);

    background: var(--bg-tertiary);
}


.desktop-nav a.active {

    color: var(--accent-primary);

    background: var(--accent-soft);

    font-weight: 600;
}


.nav-actions {

    display: flex;

    align-items: center;

    gap: 10px;
}


.theme-btn,
.mobile-menu-btn {

    width: 39px;
    height: 39px;

    display: grid;

    place-items: center;

    border: 0;

    border-radius: 10px;

    background: transparent;

    color: var(--text-secondary);

    transition: 0.2s ease;
}


.theme-btn:hover,
.mobile-menu-btn:hover {

    color: var(--text-primary);

    background: var(--bg-tertiary);
}


.profile-btn {

    display: flex;

    align-items: center;

    gap: 7px;

    padding: 9px 14px;

    border-radius: 10px;

    color: white;

    background: var(--dark-cta);

    font-size: 13px;

    font-weight: 600;
}


[data-theme="dark"] .profile-btn {
    color: #111827;
}


.mobile-menu-btn {
    display: none;
}


/* =========================================================
   MOBILE NAV
   ========================================================= */

.mobile-nav {

    display: none;

    padding: 10px 20px 18px;

    background: var(--bg-secondary);

    border-bottom: 1px solid var(--border-color);
}


.mobile-nav.open {
    display: block;
}


.mobile-nav a {

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 12px;

    border-radius: 10px;

    color: var(--text-secondary);

    font-size: 14px;
}


.mobile-nav a.active {

    color: var(--accent-primary);

    background: var(--accent-soft);
}


/* =========================================================
   MAIN
   ========================================================= */

.jobs-page {

    max-width: var(--max-width);

    margin: auto;

    padding: 35px 28px 60px;
}


/* =========================================================
   PAGE HEADING
   ========================================================= */

.page-heading {

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 20px;

    margin-bottom: 25px;
}


.eyebrow {

    display: block;

    margin-bottom: 7px;

    color: var(--accent-primary);

    font-size: 9px;

    font-weight: 700;

    letter-spacing: 0.1em;
}


.page-heading h1 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 34px;

    line-height: 1.15;

    letter-spacing: -0.03em;
}


.page-heading p {

    margin-top: 8px;

    color: var(--text-secondary);

    font-size: 13px;
}


.heading-actions {

    display: flex;

    gap: 9px;
}


.primary-btn,
.outline-btn {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding: 10px 14px;

    border-radius: 10px;

    font-size: 12px;

    font-weight: 600;

    transition: 0.2s ease;
}


.primary-btn {

    color: white;

    background:

        linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-secondary)
        );

    box-shadow:
        0 7px 18px rgba(79, 70, 229, 0.18);
}


.primary-btn:hover {
    transform: translateY(-1px);
}


.outline-btn {

    color: var(--text-secondary);

    background: var(--bg-secondary);

    border: 1px solid var(--border-color);
}


.outline-btn:hover {

    color: var(--text-primary);

    border-color: var(--accent-border);

    background: var(--accent-soft);
}


/* =========================================================
   SEARCH
   ========================================================= */

.search-section {

    display: flex;

    gap: 10px;

    margin-bottom: 14px;
}


.search-box {

    flex: 1;

    min-height: 48px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 0 14px;

    border: 1px solid var(--border-color);

    border-radius: 12px;

    background: var(--bg-secondary);

    transition: 0.2s ease;
}


.search-box:focus-within {

    border-color: var(--accent-primary);

    box-shadow:
        0 0 0 3px var(--accent-soft);
}


.search-box > svg {

    color: var(--text-muted);

    width: 17px;
}


.search-box input {

    flex: 1;

    min-width: 0;

    border: 0;

    outline: 0;

    background: transparent;

    color: var(--text-primary);

    font-size: 13px;
}


.search-box input::placeholder {
    color: var(--text-muted);
}


.clear-search {

    display: none;

    width: 26px;
    height: 26px;

    place-items: center;

    border: 0;

    border-radius: 7px;

    color: var(--text-muted);

    background: transparent;
}


.clear-search.visible {
    display: grid;
}


.clear-search:hover {

    color: var(--text-primary);

    background: var(--bg-tertiary);
}


.clear-search svg {
    width: 14px;
}


.location-search {

    width: 145px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 6px;

    border: 1px solid var(--border-color);

    border-radius: 12px;

    color: var(--text-secondary);

    background: var(--bg-secondary);

    font-size: 12px;
}


.location-search svg {

    width: 15px;
}


.location-search svg:last-child {

    width: 12px;

    margin-left: 3px;
}


/* =========================================================
   FILTER BAR
   ========================================================= */

.filter-bar {

    display: flex;

    align-items: flex-end;

    gap: 12px;

    padding: 13px;

    margin-bottom: 24px;

    border: 1px solid var(--border-color);

    border-radius: 14px;

    background: var(--bg-secondary);
}


.filter-group {

    display: flex;

    flex-direction: column;

    gap: 5px;
}


.filter-group label {

    color: var(--text-muted);

    font-size: 9px;

    font-weight: 600;
}


.filter-group select,
.sort-box select {

    min-width: 135px;

    padding: 8px 10px;

    outline: 0;

    border: 1px solid var(--border-color);

    border-radius: 8px;

    color: var(--text-secondary);

    background: var(--bg-primary);

    font-size: 11px;
}


.reset-filter {

    margin-left: auto;

    padding: 9px 8px;

    color: var(--accent-primary);

    background: transparent;

    border: 0;

    font-size: 10px;

    font-weight: 600;
}


.reset-filter:hover {
    text-decoration: underline;
}


/* =========================================================
   CONTENT LAYOUT
   ========================================================= */

.jobs-layout {

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        280px;

    gap: 22px;

    align-items: start;
}


.jobs-content {
    min-width: 0;
}


/* =========================================================
   RESULTS HEADER
   ========================================================= */

.results-header {

    display: flex;

    align-items: center;

    justify-content: space-between;

    margin-bottom: 12px;
}


.results-header > div:first-child {

    display: flex;

    align-items: center;

    gap: 5px;
}


.results-header strong {
    font-size: 12px;
}


.results-header span {

    color: var(--text-muted);

    font-size: 10px;
}


.sort-box {

    display: flex;

    align-items: center;

    gap: 6px;
}


.sort-box select {

    min-width: 115px;

    padding: 6px 8px;
}


/* =========================================================
   JOB CARD
   ========================================================= */

.job-card {

    padding: 18px;

    margin-bottom: 12px;

    border: 1px solid var(--border-color);

    border-radius: 16px;

    background: var(--bg-secondary);

    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}


.job-card:hover {

    transform: translateY(-2px);

    border-color: var(--accent-border);

    box-shadow:
        0 12px 30px rgba(15, 23, 42, 0.06);
}


.job-card-top {

    display: flex;

    gap: 13px;
}


.company-logo {

    width: 45px;
    height: 45px;

    flex-shrink: 0;

    display: grid;

    place-items: center;

    border-radius: 12px;

    color: white;

    font-family: "Space Grotesk", sans-serif;

    font-size: 12px;

    font-weight: 700;

    background:
        linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-secondary)
        );
}


.company-logo.innovexa {

    background:
        linear-gradient(
            135deg,
            #7c3aed,
            #a855f7
        );
}


.company-logo.cloudnest {

    background:
        linear-gradient(
            135deg,
            #0284c7,
            #0ea5e9
        );
}


.company-logo.quantum {

    background:
        linear-gradient(
            135deg,
            #4338ca,
            #6366f1
        );
}


.job-main {
    flex: 1;
    min-width: 0;
}


.job-title-row {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 10px;
}


.job-title-row h2 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 15px;

    line-height: 1.3;
}


.job-title-row p {

    margin-top: 3px;

    color: var(--text-secondary);

    font-size: 10px;
}


.save-btn {

    width: 30px;
    height: 30px;

    display: grid;

    place-items: center;

    flex-shrink: 0;

    border: 1px solid transparent;

    border-radius: 8px;

    color: var(--text-muted);

    background: transparent;

    transition: 0.2s ease;
}


.save-btn:hover {

    color: var(--accent-primary);

    background: var(--accent-soft);
}


.save-btn.saved {

    color: var(--accent-primary);

    background: var(--accent-soft);
}


.save-btn.saved svg {

    fill: currentColor;
}


.save-btn svg {
    width: 15px;
}


.job-meta {

    display: flex;

    flex-wrap: wrap;

    gap: 13px;

    margin-top: 12px;
}


.job-meta span {

    display: flex;

    align-items: center;

    gap: 4px;

    color: var(--text-muted);

    font-size: 9px;
}


.job-meta svg {

    width: 12px;
}


.job-salary {

    margin-top: 10px;

    color: var(--text-primary);

    font-size: 11px;

    font-weight: 700;
}


.skill-tags {

    display: flex;

    flex-wrap: wrap;

    gap: 5px;

    margin-top: 9px;
}


.skill-tags span {

    padding: 4px 7px;

    border-radius: 6px;

    color: var(--accent-primary);

    background: var(--accent-soft);

    font-size: 8px;

    font-weight: 600;
}


.match-box {

    width: 65px;

    flex-shrink: 0;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 4px;
}


.match-circle {

    width: 48px;
    height: 48px;

    display: grid;

    place-items: center;

    border-radius: 50%;

    background:

        conic-gradient(
            var(--accent-primary) calc(var(--match, 90) * 1%),
            var(--bg-tertiary) 0
        );

    position: relative;
}


.match-circle::after {

    content: "";

    position: absolute;

    width: 37px;
    height: 37px;

    border-radius: 50%;

    background: var(--bg-secondary);
}


.match-circle span {

    position: relative;

    z-index: 2;

    color: var(--accent-primary);

    font-size: 9px;

    font-weight: 700;
}


.match-box small {

    color: var(--text-muted);

    font-size: 8px;
}


.job-card-bottom {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin-top: 17px;

    padding-top: 13px;

    border-top: 1px solid var(--border-color);
}


.posted {

    display: flex;

    align-items: center;

    gap: 5px;

    color: var(--text-muted);

    font-size: 9px;
}


.posted svg {
    width: 12px;
}


.card-actions {

    display: flex;

    gap: 7px;
}


.details-btn,
.apply-btn {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 5px;

    padding: 8px 11px;

    border-radius: 8px;

    font-size: 9px;

    font-weight: 600;
}


.details-btn {

    color: var(--text-secondary);

    background: var(--bg-tertiary);
}


.details-btn:hover {

    color: var(--text-primary);
}


.apply-btn {

    color: white;

    background: var(--dark-cta);
}


[data-theme="dark"] .apply-btn {
    color: #111827;
}


.apply-btn:hover {

    transform: translateY(-1px);

    box-shadow:
        0 5px 13px rgba(15, 23, 42, 0.15);
}


.apply-btn svg {
    width: 11px;
}


/* =========================================================
   RIGHT SIDEBAR
   ========================================================= */

.jobs-sidebar {

    position: sticky;

    top: 95px;
}


.side-card {

    padding: 15px;

    margin-bottom: 12px;

    border: 1px solid var(--border-color);

    border-radius: 15px;

    background: var(--bg-secondary);
}


.card-heading {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    margin-bottom: 14px;
}


.card-heading h3 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 13px;
}


.card-heading > a {

    color: var(--text-muted);
}


.card-heading > a:hover {
    color: var(--accent-primary);
}


.card-heading svg {
    width: 14px;
}


/* =========================================================
   PROFILE MATCH
   ========================================================= */

.profile-match {

    display: flex;

    align-items: center;

    gap: 9px;

    padding-bottom: 13px;

    border-bottom: 1px solid var(--border-color);
}


.mini-avatar {

    width: 36px;
    height: 36px;

    display: grid;

    place-items: center;

    border-radius: 10px;

    color: white;

    background:

        linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-purple)
        );

    font-size: 10px;

    font-weight: 700;
}


.profile-match div:last-child {

    display: flex;

    flex-direction: column;

    gap: 2px;
}


.profile-match strong {
    font-size: 10px;
}


.profile-match span {

    color: var(--text-muted);

    font-size: 8px;
}


.preference-item {

    padding: 10px 0;

    border-bottom: 1px solid var(--border-color);
}


.preference-item > span {

    display: block;

    margin-bottom: 3px;

    color: var(--text-muted);

    font-size: 8px;
}


.preference-item > strong {

    color: var(--text-primary);

    font-size: 9px;
}


.mini-skills {

    display: flex;

    flex-wrap: wrap;

    gap: 4px;
}


.mini-skills span {

    padding: 3px 5px;

    border-radius: 5px;

    color: var(--accent-primary);

    background: var(--accent-soft);

    font-size: 7px;

    font-weight: 600;
}


.edit-preferences {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 5px;

    margin-top: 12px;

    padding: 8px;

    border-radius: 8px;

    color: var(--accent-primary);

    background: var(--accent-soft);

    font-size: 9px;

    font-weight: 600;
}


.edit-preferences:hover {

    color: white;

    background: var(--accent-primary);
}


.edit-preferences svg {
    width: 11px;
}


/* =========================================================
   AI CARD
   ========================================================= */

.ai-card {

    position: relative;

    overflow: hidden;

    background:

        linear-gradient(
            145deg,
            var(--bg-secondary),
            var(--accent-soft)
        );
}


.ai-card::after {

    content: "";

    position: absolute;

    width: 100px;
    height: 100px;

    right: -45px;
    top: -45px;

    border-radius: 50%;

    background:
        rgba(79, 70, 229, 0.08);
}


.ai-card-icon {

    width: 35px;
    height: 35px;

    display: grid;

    place-items: center;

    margin-bottom: 11px;

    border-radius: 10px;

    color: var(--accent-primary);

    background: var(--accent-soft);

    border: 1px solid var(--accent-border);
}


.ai-card-icon svg {
    width: 17px;
}


.ai-card h3 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 14px;

    margin-bottom: 7px;
}


.ai-card p {

    color: var(--text-secondary);

    font-size: 9px;

    line-height: 1.6;
}


.ai-card a {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 5px;

    margin-top: 12px;

    padding: 8px;

    border-radius: 8px;

    color: var(--accent-primary);

    background: var(--bg-secondary);

    font-size: 9px;

    font-weight: 600;
}


.ai-card a:hover {

    color: white;

    background: var(--accent-primary);
}


.ai-card a svg {
    width: 11px;
}


/* =========================================================
   ALERT CARD
   ========================================================= */

.alert-card {

    display: flex;

    align-items: flex-start;

    gap: 9px;
}


.alert-icon {

    width: 32px;
    height: 32px;

    flex-shrink: 0;

    display: grid;

    place-items: center;

    border-radius: 9px;

    color: var(--accent-primary);

    background: var(--accent-soft);
}


.alert-icon svg {
    width: 15px;
}


.alert-card > div:nth-child(2) {

    flex: 1;
}


.alert-card h3 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 11px;

    margin-bottom: 3px;
}


.alert-card p {

    color: var(--text-muted);

    font-size: 8px;

    line-height: 1.5;
}


/* =========================================================
   TOGGLE
   ========================================================= */

.switch {

    position: relative;

    width: 30px;
    height: 17px;

    flex-shrink: 0;
}


.switch input {
    display: none;
}


.switch span {

    position: absolute;

    inset: 0;

    border-radius: 20px;

    background: var(--border-strong);

    transition: 0.2s;
}


.switch span::after {

    content: "";

    position: absolute;

    width: 13px;
    height: 13px;

    left: 2px;
    top: 2px;

    border-radius: 50%;

    background: white;

    transition: 0.2s;
}


.switch input:checked + span {

    background: var(--accent-primary);
}


.switch input:checked + span::after {

    transform: translateX(13px);
}


/* =========================================================
   STATS
   ========================================================= */

.stats-card h3 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 13px;

    margin-bottom: 13px;
}


.stats-grid {

    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 5px;
}


.stats-grid div {

    padding: 9px 4px;

    text-align: center;

    border-radius: 8px;

    background: var(--bg-primary);
}


.stats-grid strong {

    display: block;

    color: var(--accent-primary);

    font-size: 15px;
}


.stats-grid span {

    color: var(--text-muted);

    font-size: 7px;
}


.stats-card > a {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 5px;

    margin-top: 11px;

    color: var(--accent-primary);

    font-size: 9px;

    font-weight: 600;
}


.stats-card > a svg {
    width: 11px;
}


/* =========================================================
   NO RESULTS
   ========================================================= */

.no-results {

    display: none;

    padding: 60px 20px;

    text-align: center;
}


.no-results.visible {
    display: block;
}


.no-results-icon {

    width: 50px;
    height: 50px;

    display: grid;

    place-items: center;

    margin: auto auto 14px;

    border-radius: 15px;

    color: var(--accent-primary);

    background: var(--accent-soft);
}


.no-results-icon svg {
    width: 22px;
}


.no-results h3 {

    font-family: "Space Grotesk", sans-serif;

    font-size: 17px;
}


.no-results p {

    margin: 6px 0 15px;

    color: var(--text-muted);

    font-size: 11px;
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1050px) {

    .jobs-layout {

        grid-template-columns:
            minmax(0, 1fr)
            250px;
    }

    .jobs-sidebar {
        position: static;
    }

}


@media (max-width: 900px) {

    .jobs-layout {

        grid-template-columns: 1fr;
    }

    .jobs-sidebar {

        display: grid;

        grid-template-columns:
            1fr 1fr;

        gap: 12px;
    }

    .jobs-sidebar .side-card {
        margin-bottom: 0;
    }

}


@media (max-width: 760px) {

    .desktop-nav,
    .profile-btn {
        display: none;
    }

    .mobile-menu-btn {
        display: grid;
    }

    .jobs-page {

        padding: 25px 15px 45px;
    }

    .page-heading {

        align-items: flex-start;

        flex-direction: column;
    }

    .page-heading h1 {
        font-size: 28px;
    }

    .heading-actions {
        width: 100%;
    }

    .heading-actions button {
        flex: 1;
    }

    .search-section {
        flex-direction: column;
    }

    .location-search {
        width: 100%;
        min-height: 44px;
    }

    .filter-bar {

        flex-wrap: wrap;

        align-items: stretch;
    }

    .filter-group {

        flex: 1;

        min-width: 130px;
    }

    .filter-group select {
        width: 100%;
    }

    .reset-filter {
        margin-left: 0;
    }

    .jobs-sidebar {

        grid-template-columns: 1fr;
    }

}


@media (max-width: 550px) {

    .job-card {
        padding: 14px;
    }

    .job-card-top {
        position: relative;
    }

    .match-box {
        position: absolute;

        right: 0;
        top: 0;
    }

    .job-main {
        padding-right: 55px;
    }

    .job-meta {
        gap: 7px 10px;
    }

    .job-card-bottom {

        align-items: flex-start;

        flex-direction: column;
    }

    .card-actions {
        width: 100%;
    }

    .details-btn,
    .apply-btn {
        flex: 1;
    }

    .results-header {

        align-items: flex-start;

        gap: 10px;

        flex-direction: column;
    }

    .sort-box {
        width: 100%;
    }

    .sort-box select {
        flex: 1;
    }

}