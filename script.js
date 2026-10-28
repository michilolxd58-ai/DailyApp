
    
  

/* ==========================================================
   DailyApp 3.2 — Toxic Neon Edition
   Toxic Neon Lime • Yellow Coins • Original selectors preserved
   ========================================================== */

/* ==========================================================
   1. DESIGN SYSTEM
   ========================================================== */

:root {
  color-scheme: dark;

  --bg: #060806;
  --surface: #0c100c;
  --surface-2: #111811;
  --surface-3: #1a2418;
  --surface-hover: #222e1b;

  --text: #e6f0e2;
  --muted: #96a691;
  --muted-2: #c3d1bd;

  --line: rgba(182, 255, 0, 0.12);
  --line-strong: rgba(182, 255, 0, 0.25);

  /* These values are updated by script.js */
  --accent: #b6ff00;
  --accent-bright: #d2ff4f;
  --accent-rgb: 182, 255, 0;

  /* Coins always stay yellow */
  --coin-color: #f4ca58;
  --coin-bright: #ffdc78;
  --coin-rgb: 244, 202, 88;

  --danger: #f07878;
  --success: #75dda0;
  --warning: #efc66f;
  --info: #83c2ff;

  --shadow-sm: 0 3px 14px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 9px 30px rgba(0, 0, 0, 0.30);
  --shadow-lg: 0 20px 55px rgba(0, 0, 0, 0.42);

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

