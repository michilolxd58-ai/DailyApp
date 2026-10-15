
/* ==========================================================
   DailyApp 3.1 — Clean Green Edition
   Responsive • Colorful • Yellow Coins • Original HTML
   ========================================================== */

/* ==========================================================
   1. DESIGN SYSTEM
   ========================================================== */

:root {
  color-scheme: dark;

  --bg: #090f0a;
  --surface: #111a12;
  --surface-2: #172219;
  --surface-3: #202e22;
  --surface-hover: #273a29;

  --text: #dce8d9;
  --muted: #9aab96;
  --muted-2: #bfceb9;

  --line: rgba(148, 182, 137, 0.15);
  --line-strong: rgba(148, 182, 137, 0.25);

  /* These values are updated by script.js */
  --accent: #b6ff00;
  --accent-bright: #cbff4e;
  --accent-rgb: 182, 255, 0;

  /* Coins always stay yellow */
  --coin-color: #f4ca58;
  --coin-bright: #ffdc78;
  --coin-rgb: 244, 202, 88;

  --danger: #f07878;
  --success: #75dda0;
  --warning: #efc66f;
  --info: #83c2ff;

  --shadow-sm: 0 3px 12px rgba(0, 0, 0, 0.13);
  --shadow-md: 0 9px 28px rgba(0, 0, 0, 0.19);
  --shadow-lg: 0 20px 55px rgba(0, 0, 0, 0.28);

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 23px;

  --content-width: 1180px;
  --nav-height: 78px;

  --transition-fast: 150ms ease;
  --transition: 220ms ease;
  --transition-slow: 320ms ease;

  --font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;

  /*
   * Compatibility with the existing app and modal.
   */
  --card: var(--surface);
  --mint: var(--accent);
  --blue: var(--accent);
  --toxic: var(--accent);
  --toxic-bright: var(--accent-bright);
  --toxic-rgb: var(--accent-rgb);
}

/* ==========================================================
   2. LIGHT THEME
   ========================================================== */

html[data-theme="light"],
html.light,
body.light,
body[data-theme="light"] {
  color-scheme: light;

  --bg: #edf3e9;
  --surface: #f8fbf5;
  --surface-2: #eff5eb;
  --surface-3: #e2ecdd;
  --surface-hover: #d8e6d2;

  --text: #29372a;
  --muted: #71836d;
  --muted-2: #52664e;

  --line: rgba(55, 91, 48, 0.14);
  --line-strong: rgba(55, 110, 45, 0.26);

  --shadow-sm: 0 3px 12px rgba(38, 65, 32, 0.045);
  --shadow-md: 0 9px 28px rgba(38, 65, 32, 0.075);
  --shadow-lg: 0 20px 55px rgba(38, 65, 32, 0.13);

  --card: var(--surface);
}

/* ==========================================================
   3. RESET AND BASE
   ========================================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  scroll-behavior: smooth;
  scroll-padding-top: 24px;
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  margin: 0;

  background:
    radial-gradient(
      ellipse at 12% 0%,
      rgba(42, 95, 47, 0.13),
      transparent 44%
    ),
    radial-gradient(
      ellipse at 100% 75%,
      rgba(30, 75, 40, 0.07),
      transparent 42%
    ),
    var(--bg);

  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.55;
  letter-spacing: -0.01em;

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  transition:
    background-color var(--transition-slow),
    color var(--transition);
}

body,
button,
input,
select,
textarea {
  font-family: var(--font);
}

button,
input,
select,
textarea {
  font-size: inherit;
}

button {
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
  transform: none !important;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img,
svg {
  max-width: 100%;
}

::selection {
  background: rgba(var(--accent-rgb), 0.23);
  color: var(--text);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border: 2px solid var(--bg);
  border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3b533c;
}

/* ==========================================================
   4. APP LAYOUT
   ========================================================== */

.app-shell {
  width: min(calc(100% - 36px), var(--content-width));
  min-height: 100vh;
  margin-inline: auto;
  padding-bottom: calc(var(--nav-height) + 28px);
}

main {
  width: 100%;
  min-width: 0;
}

.view {
  display: none;
  min-width: 0;
  padding-top: 23px;
  padding-bottom: 25px;
}

.view.active {
  display: block;
}

.view > * + * {
  margin-top: 18px;
}

section,
article,
main,
.view {
  min-width: 0;
}

.page-heading {
  margin-bottom: 20px;
}

.page-heading h2 {
  margin-bottom: 8px;
}

.page-heading > p:last-child {
  max-width: 650px;
  margin-top: 0;
  line-height: 1.65;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 26px;
  margin-bottom: 13px;
}

.section-heading h2 {
  margin: 0;
}

.section-heading .eyebrow {
  margin-bottom: 5px;
}

/* ==========================================================
   5. TYPOGRAPHY
   ========================================================== */

h1,
h2,
h3,
h4,
h5,
h6,
p {
  overflow-wrap: anywhere;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text);
  font-weight: 680;
  letter-spacing: -0.035em;
  line-height: 1.25;
}

h1 {
  margin: 0 0 10px;
  font-size: clamp(28px, 4vw, 38px);
}

h2 {
  margin: 0 0 12px;
  font-size: clamp(21px, 3vw, 26px);
}

h3 {
  margin: 0 0 9px;
  font-size: 16px;
}

h4 {
  margin: 0 0 7px;
  font-size: 14px;
}

p {
  color: var(--muted);
}

strong,
b {
  font-weight: 700;
}

small,
.small {
  color: var(--muted);
  font-size: 12px;
}

.muted {
  color: var(--muted);
}

.tiny {
  font-size: 11px;
  line-height: 1.6;
}

.eyebrow {
  display: block;
  margin: 0 0 7px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

/* Brand */

.topbar h1 span {
  color: var(--accent);
}

/* ==========================================================
   6. HEADER
   ========================================================== */

.topbar {
  position: relative;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  min-height: 78px;
  padding: 15px 0;

  border-bottom: 1px solid var(--line);
}

.topbar h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.06em;
}

.topbar .eyebrow {
  margin-bottom: 4px;
}

.icon-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  width: 42px;
  min-width: 42px;
  height: 42px;
  padding: 0;

  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: var(--surface-2);
  color: var(--text);

  font-size: 22px;
  line-height: 1;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.icon-button:hover {
  border-color: rgba(var(--accent-rgb), 0.4);
  background: var(--surface-3);
}

.icon-button:active {
  transform: scale(0.96);
}

.icon-button.small {
  width: 38px;
  min-width: 38px;
  height: 38px;
  font-size: 23px;
}

/* ==========================================================
   7. PANELS AND CARDS
   ========================================================== */

.panel,
.card,
.stat-card,
.task-card,
.achievement,
.calendar-panel,
.heatmap-panel,
.timer-panel,
.shop-item,
.weekly-panel,
.chart-panel {
  min-width: 0;

  border: 1px solid var(--line);
  border-radius: var(--radius-lg);

  background: var(--surface);
  box-shadow: var(--shadow-sm);

  transition:
    border-color var(--transition),
    background-color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.panel {
  padding: 20px;
}

.panel:hover,
.card:hover,
.stat-card:hover,
.shop-item:hover,
.achievement:hover {
  border-color: var(--line-strong);
}

.panel h2:last-child,
.panel h3:last-child {
  margin-bottom: 0;
}

/* ==========================================================
   8. COMMAND CENTER HERO
   ========================================================== */

.hero-card {
  position: relative;
  overflow: hidden;

  padding: clamp(21px, 3vw, 32px);

  border: 1px solid rgba(var(--accent-rgb), 0.20);
  border-radius: var(--radius-xl);

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(var(--accent-rgb), 0.09),
      transparent 40%
    ),
    linear-gradient(
      135deg,
      rgba(35, 74, 38, 0.16),
      transparent 70%
    ),
    var(--surface);

  box-shadow: var(--shadow-md);
}

.hero-card h2 {
  font-size: clamp(25px, 3.6vw, 34px);
  letter-spacing: -0.045em;
}

.hero-card > p {
  line-height: 1.7;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 21px;
}

.hero-top > span:last-child {
  color: var(--muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 28px;
  padding: 5px 10px;

  border: 1px solid rgba(var(--accent-rgb), 0.20);
  border-radius: 999px;

  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

/* ==========================================================
   9. PROGRESS BARS
   ========================================================== */

.progress-track {
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 9px;
  margin-top: 23px;

  border: 1px solid rgba(140, 183, 129, 0.08);
  border-radius: 999px;

  background: var(--surface-3);
}

.progress-fill {
  display: block;

  width: 0;
  height: 100%;

  border-radius: inherit;
  background: var(--accent);

  box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.15);

  transition: width 550ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  margin-top: 10px;

  color: var(--muted);
  font-size: 12px;
}

.progress-meta strong {
  color: var(--text);
  font-size: 12px;
}

#daily-progress-percent {
  color: var(--accent);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* ==========================================================
   10. WALLET AND COINS
   ========================================================== */

.wallet-card {
  position: relative;
  overflow: hidden;

  border-color: rgba(var(--coin-rgb), 0.19);

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(var(--coin-rgb), 0.075),
      transparent 45%
    ),
    var(--surface);
}

.wallet-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.wallet-heading h2,
.shop-wallet h2 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0;
  font-size: clamp(24px, 3vw, 31px);
}

.wallet-heading h2 > span:first-child,
.shop-wallet h2 > span:first-child {
  color: var(--coin-color);
}

#home-coins,
#shop-coins {
  color: var(--coin-color);
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

.wallet-symbol {
  display: grid;
  flex-shrink: 0;
  place-items: center;

  width: 46px;
  height: 46px;

  border: 1px solid rgba(var(--coin-rgb), 0.21);
  border-radius: 14px;

  background: rgba(var(--coin-rgb), 0.09);
  color: var(--coin-color);

  font-size: 24px;
}

.wallet-card > .muted {
  margin: 12px 0 18px;
  line-height: 1.6;
}

.wallet-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 13px 0;
  margin-bottom: 12px;

  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  color: var(--muted);
  font-size: 12px;
}

.wallet-meta strong {
  color: var(--coin-color);
  text-align: right;
}

.shop-wallet > .eyebrow {
  margin-bottom: 9px;
}

.shop-wallet > p:last-child {
  margin-bottom: 0;
  line-height: 1.65;
}

/* ==========================================================
   11. STATISTICS, XP AND STREAK
   ========================================================== */

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.stat-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  min-width: 0;
  min-height: 134px;
  padding: 17px;

  background:
    linear-gradient(
      145deg,
      rgba(42, 81, 43, 0.12),
      transparent 72%
    ),
    var(--surface);
}

.stat-icon {
  display: grid;
  place-items: center;

  width: 37px;
  height: 37px;
  margin-bottom: 13px;

  border: 1px solid rgba(var(--accent-rgb), 0.17);
  border-radius: 12px;

  background: rgba(var(--accent-rgb), 0.09);
  color: var(--accent);

  font-size: 18px;
}

.stat-label {
  display: block;
  margin-bottom: 7px;

  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
}

.stat-card > strong {
  display: block;
  min-width: 0;

  color: var(--text);
  font-size: clamp(25px, 3vw, 32px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.045em;

  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.stat-card > small {
  display: block;
  margin-top: 6px;

  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
}

#home-xp {
  color: var(--accent);
}

#home-streak {
  color: var(--success);
}

#home-level {
  color: var(--muted);
}

/* Three compact cards on Progress */
.stat-grid.three .stat-card {
  min-height: 111px;
  justify-content: center;
}

.stat-grid.three .stat-card > strong {
  font-size: clamp(22px, 2.4vw, 28px);
}

/* ==========================================================
   12. BUTTONS
   ========================================================== */

.primary-button,
.secondary-button,
.danger-button,
.text-button,
.filter-chip,
.shop-buy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 44px;
  padding: 11px 16px;

  border: 1px solid transparent;
  border-radius: 11px;

  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
  text-decoration: none;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.primary-button {
  border-color: transparent;
  background: var(--accent);
  color: #17200f;
  box-shadow: 0 3px 10px rgba(var(--accent-rgb), 0.06);
}

.primary-button:hover {
  background: var(--accent-bright);
  box-shadow: 0 5px 17px rgba(var(--accent-rgb), 0.13);
}

.secondary-button {
  border-color: var(--line-strong);
  background: var(--surface-2);
  color: var(--text);
}

.secondary-button:hover {
  border-color: rgba(var(--accent-rgb), 0.34);
  background: var(--surface-3);
  color: var(--text);
}

.danger-button {
  border-color: rgba(240, 120, 120, 0.22);
  background: rgba(240, 120, 120, 0.08);
  color: var(--danger);
}

.danger-button:hover {
  background: rgba(240, 120, 120, 0.15);
}

.text-button {
  min-height: 36px;
  padding: 7px 10px;

  border-color: transparent;
  background: transparent;
  color: var(--accent);
}

.text-button:hover {
  background: rgba(var(--accent-rgb), 0.075);
}

.primary-button:active,
.secondary-button:active,
.danger-button:active,
.text-button:active,
.shop-buy:active {
  transform: scale(0.98);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quick-actions button {
  width: 100%;
  min-height: 47px;
}

.button-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.button-row > button {
  min-width: 110px;
}

.button-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-top: 14px;
}

.button-stack > button,
.button-stack > .file-button {
  width: 100%;
}

.file-button {
  cursor: pointer;
}

/* ==========================================================
   13. TASK LISTS
   ========================================================== */

.task-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 13px 15px;

  background:
    linear-gradient(
      115deg,
      rgba(36, 67, 38, 0.07),
      transparent 75%
    ),
    var(--surface);
}

.task-card:hover {
  border-color: var(--line-strong);
  transform: translateY(-1px);
}

.task-card.done {
  opacity: 0.75;
  background: var(--surface-2);
}

.task-card.done .task-title {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-color: rgba(154, 180, 147, 0.6);
}

/*
 * The JavaScript creates a BUTTON.task-check,
 * not a native checkbox. Style the actual element.
 */

.task-check {
  display: grid;
  flex: 0 0 25px;
  place-items: center;

  width: 25px;
  min-width: 25px;
  height: 25px;
  padding: 0;

  border: 2px solid rgba(145, 176, 135, 0.42);
  border-radius: 8px;

  background: var(--surface-2);
  color: #15200f;

  font-size: 15px;
  font-weight: 900;
  line-height: 1;

  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.task-check:hover {
  border-color: var(--accent);
}

.task-check[aria-pressed="true"] {
  border-color: var(--accent);
  background: var(--accent);
}

.task-check:active {
  transform: scale(0.92);
}

.task-copy {
  flex: 1;
  min-width: 0;
}

.task-title {
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.task-sub {
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.task-xp {
  flex-shrink: 0;
  padding: 5px 8px;

  border: 1px solid rgba(var(--accent-rgb), 0.14);
  border-radius: 8px;

  background: rgba(var(--accent-rgb), 0.07);
  color: var(--accent);

  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.delete-task {
  display: inline-flex;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;

  width: 34px;
  min-width: 34px;
  height: 34px;
  padding: 0;

  border: 1px solid var(--line);
  border-radius: 10px;

  background: transparent;
  color: var(--muted);

  font-size: 21px;
  line-height: 1;

  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.delete-task:hover {
  border-color: rgba(240, 120, 120, 0.3);
  background: rgba(240, 120, 120, 0.08);
  color: var(--danger);
}

.empty-state {
  padding: 23px 17px;

  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);

  background: rgba(39, 69, 39, 0.07);
  color: var(--muted);

  font-size: 13px;
  line-height: 1.65;
  text-align: center;
}

/* ==========================================================
   14. TASK FORM AND FILTERS
   ========================================================== */

.task-form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.task-form > label {
  margin: 0 0 -5px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.filter-chip {
  min-height: 36px;
  padding: 8px 13px;

  border-color: var(--line);
  background: var(--surface);
  color: var(--muted);

  font-size: 12px;
}

.filter-chip:hover {
  border-color: var(--line-strong);
  background: var(--surface-2);
  color: var(--text);
}

.filter-chip.active {
  border-color: rgba(var(--accent-rgb), 0.29);
  background: rgba(var(--accent-rgb), 0.09);
  color: var(--accent);
}

input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
select,
textarea {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 44px;
  padding: 10px 12px;

  border: 1px solid var(--line-strong);
  border-radius: 11px;

  background: var(--surface-2);
  color: var(--text);

  font-size: 13px;
  line-height: 1.4;

  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

textarea {
  min-height: 95px;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted);
  opacity: 0.8;
}

input:hover,
select:hover,
textarea:hover {
  border-color: rgba(var(--accent-rgb), 0.32);
}

input:focus,
select:focus,
textarea:focus {
  border-color: rgba(var(--accent-rgb), 0.65);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.075);
}

input[type="checkbox"],
input[type="radio"],
input[type="range"] {
  accent-color: var(--accent);
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--muted-2);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.5;
}

[hidden] {
  display: none !important;
}

/* ==========================================================
   15. CALENDAR — MONTH VIEW
   Actual HTML: .calendar-weekdays and #calendar-days
   ========================================================== */

.calendar-panel {
  overflow: hidden;
  padding: 19px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 16px;
}

.calendar-header h3 {
  margin: 0;
  flex: 1;
  font-size: 18px;
  font-weight: 750;
  text-align: center;
  text-transform: capitalize;
}

/* The seven weekday labels are actual span children. */

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  width: 100%;
  margin-bottom: 8px;
}

.calendar-weekdays > span {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
  min-height: 34px;
  padding: 6px 1px;

  border: 1px solid transparent;
  border-radius: 9px;

  background: rgba(50, 78, 48, 0.13);
  color: var(--muted);

  font-size: 11px;
  font-weight: 750;
  line-height: 1.3;
  text-align: center;
}

/* Calendar cells are dynamically created buttons. */

.calendar-grid,
#calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  width: 100%;
  min-width: 0;
}

#calendar-days > span {
  display: block;
  min-width: 0;
  min-height: 45px;
}

.calendar-day {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
  min-height: 45px;
  padding: 5px;

  border: 1px solid var(--line);
  border-radius: 10px;

  background: var(--surface-2);
  color: var(--text);

  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.calendar-day:hover {
  border-color: var(--line-strong);
  background: var(--surface-3);
  transform: translateY(-1px);
}

.calendar-day.today {
  border-color: rgba(var(--accent-rgb), 0.54);
  color: var(--accent);
  font-weight: 800;
}

.calendar-day.selected {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.13);
  color: var(--accent);
  box-shadow: inset 0 0 0 1px rgba(var(--accent-rgb), 0.12);
}

.calendar-day.today.selected {
  border-color: var(--accent);
}

/*
 * renderCalendar() uses "has-activity", not "has-tasks".
 * Use a small accent bar at the bottom of active days.
 */

.calendar-day.has-activity::after {
  position: absolute;
  bottom: 4px;
  left: 50%;

  width: 12px;
  height: 3px;

  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.14);

  content: "";
  transform: translateX(-50%);
}

.calendar-day.selected.has-activity::after {
  background: var(--accent-bright);
}

/* Selected day's task list */

#calendar-tasks {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

/* ==========================================================
   16. ACTIVITY HEATMAP
   ========================================================== */

.heatmap-panel > p:first-child {
  margin-top: 0;
  line-height: 1.65;
}

.heatmap-months {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;

  overflow: hidden;
  margin: 15px 0 8px;
  padding-left: 27px;

  color: var(--muted);
  font-size: 10px;
  text-transform: capitalize;
}

.heatmap-months span {
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
}

.heatmap-layout {
  display: flex;
  align-items: flex-start;
  gap: 7px;

  min-width: 0;
}

.heatmap-weekdays {
  display: grid;
  flex: 0 0 20px;
  grid-template-rows: repeat(4, 11px);
  gap: 4px;

  padding-top: 0;

  color: var(--muted);
  font-size: 9px;
  line-height: 11px;
}

.heatmap-weekdays span {
  display: flex;
  align-items: center;
}

.heatmap-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 11px;
  grid-template-rows: repeat(7, 11px);
  gap: 4px;

  width: 100%;
  min-width: 0;
  padding: 0 0 9px;

  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
}

.heat-cell {
  width: 11px;
  height: 11px;
  min-width: 11px;

  border: 1px solid rgba(145, 185, 133, 0.11);
  border-radius: 3px;

  background: var(--surface-3);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.heat-0 {
  background: #1b291d;
}

.heat-1 {
  border-color: rgba(107, 167, 89, 0.24);
  background: #355536;
}

.heat-2 {
  border-color: rgba(119, 199, 101, 0.26);
  background: #528347;
}

.heat-3 {
  border-color: rgba(var(--accent-rgb), 0.34);
  background: #82b85a;
}

.heat-4 {
  border-color: transparent;
  background: var(--accent);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;

  margin-top: 13px;

  color: var(--muted);
  font-size: 10px;
}

.heatmap-legend i {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 3px;
}

.heatmap-legend .heat-0 {
  background: #1b291d;
}

.heatmap-legend .heat-1 {
  background: #355536;
}

.heatmap-legend .heat-2 {
  background: #528347;
}

.heatmap-legend .heat-3 {
  background: #82b85a;
}

.heatmap-legend .heat-4 {
  background: var(--accent);
}

#heatmap-summary {
  margin-bottom: 0;
}

/* ==========================================================
   17. PROGRESS AND LEVEL
   ========================================================== */

.level-card {
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(var(--accent-rgb), 0.09),
      transparent 40%
    ),
    var(--surface);
}

.level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.level-row > div:first-child {
  flex: 1;
  min-width: 0;
}

.level-row .pill {
  margin-bottom: 11px;
}

.level-row h2 {
  margin-bottom: 5px;
}

.level-row p {
  margin-top: 0;
  line-height: 1.6;
}

.level-orb {
  display: grid;
  flex: 0 0 67px;
  place-items: center;

  width: 67px;
  height: 67px;

  border: 2px solid rgba(var(--accent-rgb), 0.4);
  border-radius: 50%;

  background:
    radial-gradient(
      circle at 40% 30%,
      rgba(var(--accent-rgb), 0.17),
      transparent 75%
    ),
    var(--surface-2);

  color: var(--accent);
  font-size: 25px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;

  box-shadow: 0 0 22px rgba(var(--accent-rgb), 0.07);
}

#progress-level {
  font-size: clamp(24px, 3.3vw, 32px);
  font-weight: 800;
}

#progress-title {
  margin-bottom: 0;
}

#level-xp-text {
  font-variant-numeric: tabular-nums;
}

#level-next {
  text-align: right;
}

/* ==========================================================
   18. ACHIEVEMENTS
   ========================================================== */

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

#achievement-summary {
  margin: -3px 0 13px;
  color: var(--muted);
  font-size: 12px;
}

.achievement-filters {
  grid-column: 1 / -1;
}

.achievement-filters label {
  color: var(--muted-2);
  font-size: 12px;
}

.achievement-filters select {
  min-height: 40px;
  margin-top: 3px;
}

.achievement {
  padding: 16px;
}

.achievement.unlocked {
  border-color: rgba(var(--accent-rgb), 0.25);
  background:
    linear-gradient(
      140deg,
      rgba(var(--accent-rgb), 0.065),
      transparent 75%
    ),
    var(--surface);
}

.achievement.locked {
  background: var(--surface);
}

.achievement-icon {
  display: grid;
  place-items: center;

  width: 43px;
  height: 43px;
  margin-bottom: 13px;

  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface-3);

  font-size: 21px;
}

.achievement.unlocked .achievement-icon {
  border-color: rgba(var(--accent-rgb), 0.24);
  background: rgba(var(--accent-rgb), 0.09);
}

.achievement h3 {
  margin-bottom: 7px;
  font-size: 14px;
  line-height: 1.4;
}

.achievement p {
  min-height: 38px;
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.achievement small {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.045em;
}

.achievement > div[style*="height:6px"] {
  background: var(--surface-3) !important;
}

/* ==========================================================
   19. WEEKLY REPORT
   ========================================================== */

.weekly-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.weekly-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  padding: 13px 0;

  border-bottom: 1px solid var(--line);

  color: var(--muted);
  font-size: 13px;
}

.weekly-row:first-child {
  padding-top: 0;
}

.weekly-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.weekly-row strong {
  color: var(--accent);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* ==========================================================
   20. FOCUS TIMER
   ========================================================== */

.timer-panel {
  text-align: center;
}

.timer-panel > p:first-child {
  margin-top: 0;
  line-height: 1.65;
}

.timer-display {
  margin: 25px 0;

  color: var(--accent);
  font-size: clamp(50px, 10vw, 78px);
  font-weight: 800;
  letter-spacing: -0.075em;
  line-height: 1;

  font-variant-numeric: tabular-nums;
}

.timer-presets {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  margin-bottom: 15px;
}

.timer-panel .button-row {
  margin-bottom: 12px;
}

#timer-status {
  margin-bottom: 0;
}

/* ==========================================================
   21. ANALYTICS CHARTS
   This fixes the real .bar-chart / .bar-track / .bar-fill
   elements generated by barHTML() in script.js.
   ========================================================== */

.chart-panel > p {
  margin-bottom: 0;
}

.bar-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 10px;

  width: 100%;
  min-width: 0;
  padding: 9px 0 5px;
}

/* Monthly chart has six columns. */

#analytics-month-chart {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;

  min-width: 0;
}

.bar-value {
  display: block;

  min-height: 16px;
  color: var(--text);

  font-size: 11px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.bar-track {
  display: flex;
  align-items: flex-end;
  justify-content: center;

  width: min(100%, 36px);
  height: 118px;
  min-height: 118px;
  overflow: hidden;

  border: 1px solid rgba(136, 177, 126, 0.09);
  border-radius: 8px 8px 5px 5px;

  background: var(--surface-2);
}

.bar-fill {
  display: block;

  width: 100%;
  min-height: 0;
  max-height: 100%;

  border-radius: 6px 6px 3px 3px;

  background: linear-gradient(
    180deg,
    var(--accent-bright),
    var(--accent)
  );

  box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.08);

  transition: height 450ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.bar-label {
  display: block;

  max-width: 100%;
  overflow: hidden;

  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Weekly comparison */

.compare-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.compare-metric {
  min-width: 0;
}

.compare-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.compare-top strong {
  color: var(--text);
  font-size: 13px;
}

.compare-top span {
  color: var(--muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.compare-bars {
  width: 100%;
}

.compare-bar {
  width: 100%;
  height: 10px;
  overflow: hidden;

  border-radius: 999px;
  background: var(--surface-3);
}

.compare-bar + .compare-bar {
  margin-top: 7px;
}

.compare-bar span {
  display: block;
  width: 0;
  height: 100%;

  border-radius: inherit;
  background: var(--accent);

  transition: width 500ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.compare-bar.previous span {
  background: #5d9770;
}

.insight-line {
  margin: 0;
  padding: 12px 0;

  border-bottom: 1px solid var(--line);

  color: var(--muted-2);
  line-height: 1.65;
}

.insight-line:first-child {
  padding-top: 0;
  color: var(--text);
}

.insight-line:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

/* ==========================================================
   22. SHOP
   Actual HTML: .shop-grid and .shop-item
   ========================================================== */

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 19px;

  background:
    linear-gradient(
      145deg,
      rgba(40, 72, 40, 0.12),
      transparent 75%
    ),
    var(--surface);
}

.shop-item-icon {
  display: grid;
  place-items: center;

  width: 47px;
  height: 47px;
  margin-bottom: 15px;

  border: 1px solid var(--line);
  border-radius: 15px;

  background: var(--surface-3);
  font-size: 23px;
}

.shop-item h3 {
  margin-bottom: 7px;
  font-size: 16px;
}

.shop-item p {
  flex: 1;
  margin: 0 0 13px;
  font-size: 12px;
  line-height: 1.65;
}

.shop-price {
  display: block;
  margin: 0 0 13px;

  color: var(--coin-color);
  font-size: 15px;
  font-weight: 800;
}

.shop-buy {
  width: 100%;
  margin-top: auto;
  background: var(--accent);
  color: #17200f;
}

#custom-reward-open {
  width: 100%;
  margin-top: auto;
}

.custom-reward-panel h3 {
  margin-bottom: 17px;
}

#custom-reward-form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

#custom-reward-form label {
  margin: 4px 0 -5px;
}

/* Actual shop history markup generated by renderShop() */

#shop-history {
  display: flex;
  flex-direction: column;
  gap: 0;
}

#shop-history > p {
  margin: 0;
  line-height: 1.65;
}

.shop-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.shop-history-item:first-child {
  padding-top: 0;
}

.shop-history-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.shop-history-item > div {
  flex: 1;
  min-width: 0;
}

.shop-history-item > div strong {
  display: block;
  color: var(--text);
  font-size: 13px;
}

.shop-history-item small {
  display: block;
  margin-top: 4px;
  line-height: 1.5;
}

.shop-history-item > strong {
  flex-shrink: 0;

  color: var(--coin-color);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ==========================================================
   23. SETTINGS AND CATEGORIES
   ========================================================== */

.settings-group {
  margin-bottom: 17px;
  padding: 20px;
}

.settings-group h3 {
  margin-bottom: 12px;
}

.settings-group > .muted {
  font-size: 12px;
  line-height: 1.65;
}

.settings-group > label {
  margin-top: 15px;
}

.settings-group > label:first-of-type {
  margin-top: 12px;
}

.accent-options {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-wrap: wrap;
  padding: 5px 0 3px;
}

.accent-swatch {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 35px;
  min-width: 35px;
  height: 35px;
  padding: 0;

  border: 2px solid transparent;
  border-radius: 50%;

  cursor: pointer;

  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast);
}

.accent-swatch:hover {
  transform: scale(1.08);
}

.accent-swatch.active,
.accent-swatch[aria-pressed="true"] {
  border-color: var(--text);
  box-shadow:
    0 0 0 3px var(--surface),
    0 0 0 5px currentColor;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 12px 13px;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: var(--surface-2);
}

.category-row > div {
  flex: 1;
  min-width: 0;
}

.category-row strong {
  display: block;
  color: var(--text);
  font-size: 13px;
}

.category-row small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
}

.about-card p {
  line-height: 1.65;
}

/* ==========================================================
   24. TOAST NOTIFICATION
   ========================================================== */

#toast,
.toast {
  position: fixed;
  z-index: 10001;

  right: 18px;
  bottom: calc(var(--nav-height) + 15px);
  left: 18px;

  width: fit-content;
  max-width: min(440px, calc(100% - 36px));
  margin-inline: auto;
  padding: 12px 17px;

  border: 1px solid var(--line-strong);
  border-radius: 13px;

  background: var(--surface-3);
  color: var(--text);

  box-shadow: var(--shadow-lg);

  font-size: 12px;
  font-weight: 650;
  line-height: 1.55;

  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);

  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

#toast.show,
.toast.show {
  opacity: 1;
  transform: translateY(0);
}

/* ==========================================================
   25. BOTTOM NAVIGATION
   ========================================================== */

.bottom-nav {
  position: fixed;
  z-index: 50;
  right: 0;
  bottom: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;

  min-height: var(--nav-height);
  padding: 8px 12px max(8px, env(safe-area-inset-bottom));

  border-top: 1px solid var(--line);

  background: rgba(9, 16, 10, 0.94);

  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}

html[data-theme="light"] .bottom-nav,
html.light .bottom-nav,
body.light .bottom-nav,
body[data-theme="light"] .bottom-nav {
  background: rgba(237, 243, 233, 0.94);
}

.nav-item {
  position: relative;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  min-width: 0;
  max-width: 112px;
  min-height: 49px;
  padding: 6px 4px;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;
  color: var(--muted);

  cursor: pointer;

  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.nav-item > span {
  font-size: 20px;
  line-height: 1.1;
}

.nav-item > small {
  display: block;

  color: inherit;
  font-size: 10px;
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
}

.nav-item:hover {
  background: rgba(65, 101, 62, 0.13);
  color: var(--text);
}

.nav-item.active {
  border-color: rgba(var(--accent-rgb), 0.13);
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
}

.nav-item.active::before {
  position: absolute;
  top: -1px;
  left: 50%;

  width: 20px;
  height: 2px;

  border-radius: 999px;
  background: var(--accent);
  content: "";

  transform: translateX(-50%);
}

/* ==========================================================
   26. REWARD MODAL COMPATIBILITY
   The JavaScript injects the actual modal markup.
   ========================================================== */

#dailyapp-reward-overlay {
  overscroll-behavior: contain;
}

#dailyapp-reward-modal {
  color: var(--text);
}

.dailyapp-modal-description {
  color: var(--muted);
}

.dailyapp-balance-row strong {
  color: var(--text);
}

.dailyapp-modal-cancel:hover {
  border-color: var(--line-strong);
}

.dailyapp-modal-confirm:hover {
  filter: brightness(1.05);
}

.dailyapp-reward-success .dailyapp-modal-title {
  color: var(--text);
}

/* ==========================================================
   27. UTILITY CLASSES
   ========================================================== */

.text-accent {
  color: var(--accent) !important;
}

.text-coin {
  color: var(--coin-color) !important;
}

.text-muted {
  color: var(--muted) !important;
}

.text-danger {
  color: var(--danger) !important;
}

.text-success {
  color: var(--success) !important;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.flex {
  display: flex;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-sm {
  gap: 8px;
}

.gap-md {
  gap: 14px;
}

.mt-0 {
  margin-top: 0 !important;
}

.mt-1 {
  margin-top: 8px !important;
}

.mt-2 {
  margin-top: 16px !important;
}

.mb-0 {
  margin-bottom: 0 !important;
}

/* ==========================================================
   28. TABLET
   ========================================================== */

@media (max-width: 900px) {
  .app-shell {
    width: min(calc(100% - 28px), var(--content-width));
  }

  .achievement-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bar-chart {
    gap: 7px;
  }

  .bar-track {
    height: 105px;
    min-height: 105px;
  }
}

/* ==========================================================
   29. MOBILE
   ========================================================== */

@media (max-width: 600px) {
  :root {
    --nav-height: 73px;
    --radius-lg: 16px;
    --radius-xl: 20px;
  }

  body {
    font-size: 13px;
  }

  .app-shell {
    width: calc(100% - 22px);
    padding-bottom: calc(var(--nav-height) + 22px);
  }

  .topbar {
    min-height: 65px;
    gap: 10px;
    padding: 11px 0;
  }

  .topbar h1 {
    font-size: 22px;
  }

  .view {
    padding-top: 17px;
    padding-bottom: 20px;
  }

  .view > * + * {
    margin-top: 14px;
  }

  .section-heading {
    margin-top: 22px;
    margin-bottom: 11px;
  }

  .section-heading h2 {
    font-size: 20px;
  }

  .page-heading {
    margin-bottom: 17px;
  }

  .page-heading h2 {
    font-size: 25px;
  }

  .hero-card {
    padding: 21px 17px;
  }

  .hero-card h2 {
    font-size: 26px;
  }

  .hero-top {
    margin-bottom: 17px;
  }

  .panel {
    padding: 15px;
  }

  .wallet-heading h2,
  .shop-wallet h2 {
    font-size: 24px;
  }

  .wallet-symbol {
    width: 40px;
    height: 40px;
    font-size: 21px;
  }

  .stat-grid {
    gap: 9px;
  }

  .stat-grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  .stat-card {
    min-height: 123px;
    padding: 13px;
  }

  .stat-icon {
    width: 31px;
    height: 31px;
    margin-bottom: 10px;
    font-size: 16px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-card > strong {
    font-size: 25px;
  }

  .stat-card > small {
    font-size: 11px;
  }

  .stat-grid.three .stat-card {
    min-height: 104px;
    padding: 10px 9px;
  }

  .stat-grid.three .stat-card > strong {
    font-size: 21px;
  }

  .stat-grid.three .stat-label {
    font-size: 10px;
    line-height: 1.45;
  }

  .quick-actions {
    gap: 8px;
  }

  .quick-actions button {
    min-height: 45px;
    padding: 10px 9px;
    font-size: 12px;
  }

  .primary-button,
  .secondary-button,
  .danger-button {
    min-height: 43px;
    padding: 10px 13px;
    font-size: 12px;
  }

  .task-card {
    gap: 10px;
    padding: 12px 10px;
  }

  .task-check {
    flex-basis: 25px;
    width: 25px;
    min-width: 25px;
    height: 25px;
  }

  .task-title {
    font-size: 12px;
  }

  .task-sub {
    font-size: 10px;
  }

  .task-xp {
    padding: 4px 6px;
    font-size: 10px;
  }

  .delete-task {
    flex-basis: 31px;
    width: 31px;
    min-width: 31px;
    height: 31px;
  }

  .form-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 9px;
  }

  .filter-row {
    gap: 6px;
  }

  .filter-chip {
    min-height: 35px;
    padding: 8px 11px;
    font-size: 11px;
  }

  /* Real calendar weekday and date grid */
  .calendar-panel {
    padding: 12px;
  }

  .calendar-header {
    gap: 8px;
    margin-bottom: 12px;
  }

  .calendar-header h3 {
    font-size: 16px;
  }

  .calendar-weekdays {
    gap: 4px;
    margin-bottom: 6px;
  }

  .calendar-weekdays > span {
    min-height: 31px;
    padding: 5px 0;
    border-radius: 7px;
    font-size: 10px;
  }

  .calendar-grid,
  #calendar-days {
    gap: 4px;
  }

  #calendar-days > span {
    min-height: 38px;
  }

  .calendar-day {
    min-height: 38px;
    padding: 3px 1px;
    border-radius: 8px;
    font-size: 11px;
  }

  .calendar-day.has-activity::after {
    bottom: 3px;
    width: 9px;
    height: 3px;
  }

  .heatmap-panel {
    padding: 13px;
  }

  .heatmap-grid {
    grid-auto-columns: 10px;
    grid-template-rows: repeat(7, 10px);
    gap: 3px;
  }

  .heat-cell {
    width: 10px;
    height: 10px;
    min-width: 10px;
  }

  .heatmap-weekdays {
    flex-basis: 19px;
    grid-template-rows: repeat(4, 10px);
    gap: 3px;
    font-size: 9px;
    line-height: 10px;
  }

  .heatmap-months {
    padding-left: 25px;
    font-size: 9px;
  }

  .heatmap-legend {
    gap: 4px;
    font-size: 9px;
  }

  .heatmap-legend i {
    width: 9px;
    height: 9px;
  }

  .level-row {
    gap: 12px;
  }

  .level-orb {
    flex-basis: 54px;
    width: 54px;
    height: 54px;
    font-size: 21px;
  }

  .level-row .pill {
    font-size: 9px;
  }

  #progress-level {
    font-size: 25px;
  }

  #level-next {
    max-width: 52%;
    font-size: 11px;
  }

  .achievement-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .achievement {
    padding: 12px;
  }

  .achievement-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 10px;
    font-size: 18px;
  }

  .achievement h3 {
    font-size: 12px;
  }

  .achievement p {
    min-height: 0;
    font-size: 11px;
  }

  .achievement small {
    font-size: 9px;
  }

  .weekly-row {
    gap: 8px;
    font-size: 12px;
  }

  .weekly-row strong {
    font-size: 13px;
  }

  .timer-display {
    font-size: clamp(48px, 13vw, 68px);
  }

  .timer-presets {
    gap: 6px;
  }

  .timer-presets .filter-chip {
    padding-inline: 10px;
  }

  .bar-chart {
    gap: 4px;
  }

  .bar-track {
    width: min(100%, 29px);
    height: 94px;
    min-height: 94px;
  }

  .bar-value {
    font-size: 10px;
  }

  .bar-label {
    font-size: 9px;
  }

  .compare-top {
    align-items: flex-start;
    gap: 7px;
  }

  .compare-top strong,
  .compare-top span {
    font-size: 11px;
  }

  .shop-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .shop-item {
    padding: 13px;
  }

  .shop-item-icon {
    width: 38px;
    height: 38px;
    margin-bottom: 11px;
    border-radius: 12px;
    font-size: 20px;
  }

  .shop-item h3 {
    font-size: 14px;
  }

  .shop-item p {
    font-size: 11px;
  }

  .shop-price {
    font-size: 13px;
  }

  .shop-buy {
    min-height: 41px;
    padding: 9px 7px;
    font-size: 11px;
  }

  .category-row {
    padding: 10px;
  }

  .settings-group {
    padding: 15px;
  }

  .settings-group h3 {
    font-size: 15px;
  }

  .button-stack {
    gap: 8px;
  }

  .bottom-nav {
    gap: 0;
    min-height: var(--nav-height);
    padding-right: 4px;
    padding-left: 4px;
  }

  .nav-item {
    gap: 3px;
    min-height: 47px;
    padding: 5px 1px;
    border-radius: 9px;
  }

  .nav-item > span {
    font-size: 19px;
  }

  .nav-item > small {
    font-size: 9px;
    letter-spacing: -0.025em;
  }

  #toast,
  .toast {
    bottom: calc(var(--nav-height) + 12px);
  }
}

/* ==========================================================
   30. VERY SMALL PHONES
   ========================================================== */

@media (max-width: 380px) {
  .app-shell {
    width: calc(100% - 16px);
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-actions button {
    padding-inline: 6px;
    font-size: 11px;
  }

  .stat-grid.three {
    gap: 5px;
  }

  .stat-grid.three .stat-card {
    padding: 9px 7px;
  }

  .stat-grid.three .stat-card > strong {
    font-size: 19px;
  }

  .calendar-weekdays {
    gap: 3px;
  }

  .calendar-grid,
  #calendar-days {
    gap: 3px;
  }

  .calendar-day {
    min-height: 35px;
    font-size: 10px;
  }

  .shop-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .shop-item {
    padding: 15px;
  }

  .shop-item-icon {
    margin-bottom: 9px;
  }

  .shop-buy {
    min-height: 43px;
    font-size: 12px;
  }

  .achievement-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .achievement p {
    min-height: 0;
  }

  .bar-track {
    height: 82px;
    min-height: 82px;
  }

  .bar-chart {
    gap: 3px;
  }

  .nav-item > small {
    font-size: 8px;
  }
}

/* ==========================================================
   31. REDUCED MOTION
   ========================================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
