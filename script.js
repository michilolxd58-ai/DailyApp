"use strict";

/* =========================================
   DAILYAPP 2.2 — MAIN JAVASCRIPT
   Compatible with the index.html above.
   Storage remains compatible with DailyApp.
========================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEY = "dailyapp-midnight-v1";
const SETTINGS_KEY = "dailyapp-appearance-v1";

const DEFAULT_CATEGORIES = [
  { id: "daily", name: "Daily", xp: 10 },
  { id: "school", name: "School", xp: 20 },
  { id: "training", name: "Training", xp: 30 },
  { id: "challenge", name: "Challenge", xp: 50 }
];

const DAILY_GOALS = [60, 70, 80, 90, 100, 110, 120, 140];

const TASK_POOL = [
  "Make your bed",
  "Drink a glass of water",
  "Read for 10 minutes",
  "Tidy your desk for 5 minutes",
  "Take a short walk",
  "Stretch for 5 minutes",
  "Write down your top priority",
  "Review your notes",
  "Finish one task you've been postponing",
  "Put your phone away for 20 minutes",
  "Prepare your bag for tomorrow",
  "Spend 10 minutes learning something",
  "Clean one small area",
  "Take a few calm breaths",
  "Plan tomorrow's first task",
  "Write down one thing that went well",
  "Finish a small school task",
  "Learn one new coding concept",
  "Practice a skill for 15 minutes",
  "Prepare everything for tomorrow"
];

const BONUS_POOL = [
  "Clear your desk for five minutes",
  "Read or learn something for ten minutes",
  "Take a short fresh-air break",
  "Prepare one thing for tomorrow",
  "Finish a small task you've been avoiding",
  "Stretch and reset for five minutes",
  "Write down your top three priorities",
  "Put away distractions for one focus block"
];

const ACCENTS = {
  mint:   { color: "#b6ff00", rgb: "182,255,0" },
  blue:   { color: "#73b7ff", rgb: "115,183,255" },
  purple: { color: "#b69cff", rgb: "182,156,255" },
  pink:   { color: "#ff8bc2", rgb: "255,139,194" },
  orange: { color: "#ffb86b", rgb: "255,184,107" },
  red:    { color: "#ff7788", rgb: "255,119,136" },
  cyan:   { color: "#5de2e7", rgb: "93,226,231" },
  yellow: { color: "#f1d66d", rgb: "241,214,109" },
  lime:   { color: "#b7e66d", rgb: "183,230,109" },
  white:  { color: "#d9e4f5", rgb: "217,228,245" }
};

const ACHIEVEMENTS = [
  { id: "first", icon: "🌱", name: "First Step", desc: "Complete your first task.", test: (s) => completed(s).length >= 1 },
  { id: "five", icon: "⚡", name: "Getting Momentum", desc: "Complete 5 tasks.", test: (s) => completed(s).length >= 5 },
  { id: "twentyfive", icon: "🧩", name: "Consistent Builder", desc: "Complete 25 tasks.", test: (s) => completed(s).length >= 25 },
  { id: "hundred", icon: "💯", name: "Century Club", desc: "Complete 100 tasks.", test: (s) => completed(s).length >= 100 },
  { id: "xp100", icon: "✨", name: "XP Collector", desc: "Earn 100 XP.", test: (s) => totalXP(s) >= 100 },
  { id: "xp1000", icon: "🏅", name: "XP Machine", desc: "Earn 1,000 XP.", test: (s) => totalXP(s) >= 1000 },
  {
    id: "streak3", icon: "🔥", name: "Three-Day Spark",
    desc: "Reach a 3-day streak.",
    test: (s) => { const x = streakInfo(s); return x.current >= 3 || x.best >= 3; }
  },
  {
    id: "streak7", icon: "🗓️", name: "One-Week Rhythm",
    desc: "Reach a 7-day streak.",
    test: (s) => { const x = streakInfo(s); return x.current >= 7 || x.best >= 7; }
  },
  { id: "bonus", icon: "🎯", name: "Side Quest", desc: "Complete a bonus quest.", test: (s) => (s.bonusCompleted || 0) >= 1 },
  { id: "focus", icon: "⏱️", name: "Focus Starter", desc: "Complete a focus session.", test: (s) => (s.focusSessions || 0) >= 1 },
  {
    id: "category", icon: "🛠️", name: "Make It Yours",
    desc: "Create a custom category.",
    test: (s) => s.categories.some((c) => !DEFAULT_CATEGORIES.some((d) => d.id === c.id))
  }
];

/* UTILITIES */

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return dateKey(new Date());
}

function parseDate(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

let toastTimer = null;

function toast(message) {
  const element = $("#toast");
  if (!element) {
    console.log(message);
    return;
  }

  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2400);
}

/* APPEARANCE */

function loadAppearance() {
  const defaults = { theme: "dark", accent: "mint" };

  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaults;

    return {
      theme: ["dark", "light", "auto"].includes(saved.theme) ? saved.theme : defaults.theme,
      accent: Object.prototype.hasOwnProperty.call(ACCENTS, saved.accent) ? saved.accent : defaults.accent
    };
  } catch {
    return defaults;
  }
}

let appearance = loadAppearance();

function resolvedTheme() {
  if (appearance.theme === "auto") {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return appearance.theme;
}

function applyAppearance() {
  const root = document.documentElement;
  const accent = ACCENTS[appearance.accent] || ACCENTS.mint;
  const theme = resolvedTheme();

  // White accent is invisible against the light background — swap to a darker tone.
  // Done here rather than in CSS because the inline style set below on
  // documentElement beats any stylesheet rule that isn't !important.
  const effective = (theme === "light" && appearance.accent === "white")
    ? { color: "#55627a", rgb: "85,98,122" }
    : accent;

  root.dataset.theme = theme;
  root.dataset.accent = appearance.accent;
  root.style.setProperty("--accent", effective.color);
  root.style.setProperty("--accent-rgb", effective.rgb);

  const themeColor = $("#theme-color");
  if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#080a06" : "#f4f6f1");

  const themeSelect = $("#theme-select");
  if (themeSelect) themeSelect.value = appearance.theme;

  const themeStatus = $("#theme-status");
  if (themeStatus) {
    themeStatus.textContent = appearance.theme === "auto"
      ? `Automatic (${theme})`
      : theme === "dark" ? "Dark mode" : "Light mode";
  }

  $$(".accent-swatch").forEach((button) => {
    const selected = button.dataset.accent === appearance.accent;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function saveAppearance() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appearance));
  } catch (error) {
    console.warn("Could not save appearance settings.", error);
    toast("Could not save settings in this browser.");
  }
  applyAppearance();
}

const colorSchemeQuery = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

if (colorSchemeQuery) {
  const onSystemThemeChange = () => {
    if (appearance.theme === "auto") applyAppearance();
  };

  if (colorSchemeQuery.addEventListener) {
    colorSchemeQuery.addEventListener("change", onSystemThemeChange);
  } else if (colorSchemeQuery.addListener) {
    colorSchemeQuery.addListener(onSystemThemeChange);
  }
}

/* DATA & STORAGE */

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (raw && typeof raw === "object") {
      const sourceCategories = Array.isArray(raw.categories) && raw.categories.length
        ? raw.categories
        : DEFAULT_CATEGORIES;

      return {
        version: 2,

        tasks: Array.isArray(raw.tasks) ? raw.tasks.map((task) => ({
          ...task,
          id: String(task.id || uid()),
          text: String(task.text || "Task"),
          created: /^\d{4}-\d{2}-\d{2}$/.test(task.created) ? task.created : todayKey(),
          done: Boolean(task.done),
          // Missing historical completion dates remain missing.
          completedAt: /^\d{4}-\d{2}-\d{2}$/.test(task.completedAt) ? task.completedAt : null,
          category: String(task.category || "daily")
        })) : [],

        categories: sourceCategories.map((item) => ({
          id: String(item.id || uid()),
          name: String(item.name || "Category"),
          xp: clamp(Number(item.xp) || 10, 1, 1000)
        })),

        dailyPlans: raw.dailyPlans && typeof raw.dailyPlans === "object" ? raw.dailyPlans : {},
        bonusCompleted: Math.max(0, Number(raw.bonusCompleted) || 0),
        focusSessions: Math.max(0, Number(raw.focusSessions) || 0),
        unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : []
      };
    }
  } catch (error) {
    console.warn("Could not read saved DailyApp data.", error);
  }

  return {
    version: 2,
    tasks: [],
    categories: DEFAULT_CATEGORIES.map((item) => ({ ...item })),
    dailyPlans: {},
    bonusCompleted: 0,
    focusSessions: 0,
    unlocked: []
  };
}

let state = loadState();
let currentFilter = "all";
let calendarCursor = new Date();
let selectedDate = todayKey();
let activeQuest = null;

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save DailyApp data.", error);
    toast("Could not save data in this browser.");
  }
}

function category(id) {
  return state.categories.find((item) => item.id === id) || state.categories[0] || DEFAULT_CATEGORIES[0];
}

function taskXP(task) {
  if (task.xpReward !== undefined && task.xpReward !== null && Number.isFinite(Number(task.xpReward))) {
    return Math.max(0, Number(task.xpReward));
  }
  return category(task.category).xp;
}

function completed(source = state) {
  return source.tasks.filter((task) => task.done);
}

function totalXP(source = state) {
  return completed(source).reduce((sum, task) => sum + taskXP(task), 0);
}

function levelInfo(xp) {
  const safeXP = Math.max(0, xp);
  return {
    level: Math.floor(safeXP / 100) + 1,
    inside: safeXP % 100,
    needed: 100
  };
}

/* DAILY PLAN */

function getPlan(day = todayKey()) {
  if (!state.dailyPlans[day]) {
    const pool = [...TASK_POOL];
    const count = 4 + Math.floor(Math.random() * 2);
    const chosen = [];

    while (chosen.length < count && pool.length) {
      chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }

    state.dailyPlans[day] = {
      goal: DAILY_GOALS[Math.floor(Math.random() * DAILY_GOALS.length)],
      taskTexts: chosen
    };

    save();
  }

  return state.dailyPlans[day];
}

function ensureDailyTasks(day = todayKey()) {
  const plan = getPlan(day);
  if (!Array.isArray(plan.taskTexts)) plan.taskTexts = [];

  for (const text of plan.taskTexts) {
    const exists = state.tasks.some(
      (task) => task.kind === "daily-plan" && task.day === day && task.text === text
    );

    if (!exists) {
      state.tasks.push({
        id: uid(),
        text,
        created: day,
        done: false,
        completedAt: null,
        category: "daily",
        kind: "daily-plan",
        day,
        xpReward: 10
      });
    }
  }

  save();
}

function dailyEarned(day = todayKey()) {
  return state.tasks
    .filter((task) => task.done && task.completedAt === day)
    .reduce((sum, task) => sum + taskXP(task), 0);
}

function streakInfo(source = state) {
  const days = new Set(
    source.tasks.filter((task) => task.done && task.completedAt).map((task) => task.completedAt)
  );

  let current = 0;
  let date = new Date();

  if (!days.has(dateKey(date))) date = shiftDate(date, -1);

  while (days.has(dateKey(date))) {
    current++;
    date = shiftDate(date, -1);
  }

  const sortedDays = [...days].sort();
  let best = 0;
  let run = 0;
  let previous = null;

  for (const day of sortedDays) {
    const parsed = parseDate(day);

    if (previous) {
      const difference = Math.round((parsed - previous) / 86400000);
      run = difference === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }

    best = Math.max(best, run);
    previous = parsed;
  }

  return { current, best };
}

function weekKeys(reference = new Date()) {
  const monday = new Date(reference);
  const offset = (monday.getDay() + 6) % 7;

  monday.setDate(monday.getDate() - offset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => dateKey(shiftDate(monday, index)));
}

function weeklyStats(reference = new Date()) {
  const keys = weekKeys(reference);
  const tasks = state.tasks.filter(
    (task) => task.done && task.completedAt && keys.includes(task.completedAt)
  );

  return {
    done: tasks.length,
    xp: tasks.reduce((sum, task) => sum + taskXP(task), 0),
    days: new Set(tasks.map((task) => task.completedAt)).size,
    goalDays: keys.filter((key) => {
      const goal = state.dailyPlans[key]?.goal;
      return Number.isFinite(goal) && dailyEarned(key) >= goal;
    }).length,
    keys
  };
}

/* TASKS */

function createTask(text, categoryId, extra = {}) {
  const cleanText = text.trim();
  if (!cleanText) return;

  const selectedCategory = category(categoryId);

  state.tasks.unshift({
    id: uid(),
    text: cleanText,
    created: todayKey(),
    done: false,
    completedAt: null,
    category: selectedCategory.id,
    kind: "custom",
    xpReward: selectedCategory.xp,
    ...extra
  });

  save();
  renderAll();
  toast("Task added.");
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.done = !task.done;
  task.completedAt = task.done ? todayKey() : null;

  save();
  checkAchievements();
  renderAll();

  toast(task.done ? `Task complete · +${taskXP(task)} XP` : "Task marked active");
}

function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (!confirm(`Delete "${task.text}"?`)) return;

  state.tasks = state.tasks.filter((item) => item.id !== id);
  save();
  renderAll();
  toast("Task deleted.");
}

function taskHTML(task, showDelete = true) {
  const selectedCategory = category(task.category);

  const status = task.done
    ? task.completedAt
      ? `Completed ${task.completedAt}`
      : "Completed · date not recorded"
    : task.created === todayKey()
      ? "Added today"
      : `Added ${task.created}`;

  return `
    <article class="task-card ${task.done ? "done" : ""}">
      <button
        class="task-check"
        data-toggle="${escapeHTML(task.id)}"
        aria-label="${task.done ? "Mark task active" : "Complete task"}"
        aria-pressed="${String(task.done)}"
        type="button"
      >${task.done ? "✓" : ""}</button>

      <div class="task-copy">
        <div class="task-title">${escapeHTML(task.text)}</div>
        <div class="task-sub">${escapeHTML(selectedCategory.name)} · ${escapeHTML(status)}</div>
      </div>

      <span class="task-xp">+${taskXP(task)} XP</span>

      ${showDelete ? `
        <button
          class="delete-task"
          data-delete="${escapeHTML(task.id)}"
          aria-label="Delete task"
          type="button"
        >×</button>` : ""}
    </article>
  `;
}

/* ACHIEVEMENTS */

function checkAchievements() {
  const newAchievements = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!state.unlocked.includes(achievement.id) && achievement.test(state)) {
      state.unlocked.push(achievement.id);
      newAchievements.push(achievement);
    }
  }

  if (newAchievements.length) {
    save();
    newAchievements.forEach((achievement, index) => {
      setTimeout(() => toast(`Badge unlocked: ${achievement.name} ${achievement.icon}`), index * 900);
    });
  }
}

/* HOME */

function renderHome() {
  const today = todayKey();

  // If the tab was left open past midnight, regenerate today's daily plan so the
  // home view and task lists reflect the current day.
  if (today !== renderHome._lastDay) {
    renderHome._lastDay = today;
    ensureDailyTasks();
  }

  const todayTasks = state.tasks.filter(
    (task) => task.created === today || (task.kind === "daily-plan" && task.day === today)
  );

  const doneToday = todayTasks.filter((task) => task.done).length;
  const goal = Number(getPlan().goal) || 0;
  const earned = dailyEarned();

  $("#today-date").textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const hour = new Date().getHours();
  $("#greeting").textContent = hour < 12
    ? "Make today count."
    : hour < 18
      ? "Keep your momentum."
      : "Finish strong, then rest.";

  $("#home-completed").textContent = `${doneToday}/${todayTasks.length}`;
  $("#home-xp").textContent = `${totalXP()} XP`;
  $("#home-percent").textContent = `${todayTasks.length ? Math.round(doneToday / todayTasks.length * 100) : 0}%`;
  $("#home-bar").style.width = `${todayTasks.length ? doneToday / todayTasks.length * 100 : 0}%`;

  $("#daily-goal-label").textContent = `${earned} / ${goal} XP`;
  $("#daily-goal-bar").style.width = `${goal ? clamp(earned / goal * 100, 0, 100) : 0}%`;

  $("#daily-challenge-text").textContent = earned >= goal && goal > 0
    ? "Daily XP goal reached — great work!"
    : `Earn ${Math.max(0, goal - earned)} more XP today to reach your goal.`;

  $("#current-streak").textContent = streakInfo().current;
  $("#best-streak").textContent = streakInfo().best;
  $("#weekly-complete").textContent = weeklyStats().done;

  const homeTasks = todayTasks.slice(0, 5);
  $("#home-tasks").innerHTML = homeTasks.length
    ? homeTasks.map((task) => taskHTML(task, false)).join("")
    : '<div class="empty-state">No tasks yet. Add one and get started.</div>';

  const week = weeklyStats();

  $("#home-weekly-report").innerHTML = `
    <div class="weekly-row"><span>Completed tasks</span><strong>${week.done}</strong></div>
    <div class="weekly-row"><span>XP earned</span><strong>${week.xp}</strong></div>
    <div class="weekly-row"><span>Active days</span><strong>${week.days}/7</strong></div>
  `;
}
renderHome._lastDay = todayKey();

/* TASK LISTS */

function renderTaskLists() {
  const filteredTasks = state.tasks.filter((task) => {
    if (currentFilter === "open") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  $("#task-list").innerHTML = filteredTasks.length
    ? filteredTasks.map((task) => taskHTML(task)).join("")
    : '<div class="empty-state">No tasks here yet. Add a task to get started.</div>';

  const dayTasks = state.tasks.filter(
    (task) => task.created === selectedDate || task.completedAt === selectedDate
  );

  $("#calendar-tasks").innerHTML = dayTasks.length
    ? dayTasks.map((task) => taskHTML(task, false)).join("")
    : '<div class="empty-state">No tasks recorded for this day.</div>';

  $("#selected-date-heading").textContent = parseDate(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* CATEGORIES */

function renderCategories() {
  const categorySelect = $("#task-category");
  const oldValue = categorySelect.value;

  categorySelect.innerHTML = state.categories.map((item) => `
    <option value="${escapeHTML(item.id)}">${escapeHTML(item.name)} · ${item.xp} XP</option>
  `).join("");

  if (state.categories.some((item) => item.id === oldValue)) {
    categorySelect.value = oldValue;
  }

  $("#category-list").innerHTML = state.categories.map((item) => `
    <div class="category-row">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <small>${item.xp} XP per task</small>
      </div>
      <button class="secondary-button" data-edit-cat="${escapeHTML(item.id)}" type="button">Edit XP</button>
      ${
        DEFAULT_CATEGORIES.some((defaultItem) => defaultItem.id === item.id)
          ? ""
          : `<button class="delete-task" data-delete-cat="${escapeHTML(item.id)}" type="button" aria-label="Delete category">×</button>`
      }
    </div>
  `).join("");
}

/* CALENDAR */

function renderCalendar() {
  $("#calendar-month").textContent = calendarCursor.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric"
  });

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const numberOfDays = new Date(year, month + 1, 0).getDate();

  let html = "";

  for (let i = 0; i < offset; i++) {
    html += '<span class="calendar-empty" aria-hidden="true"></span>';
  }

  for (let day = 1; day <= numberOfDays; day++) {
    const key = dateKey(new Date(year, month, day));
    const hasActivity = state.tasks.some(
      (task) => task.created === key || task.completedAt === key
    );

    const classes = [
      "calendar-day",
      key === todayKey() ? "today" : "",
      key === selectedDate ? "selected" : "",
      hasActivity ? "has-activity" : ""
    ].filter(Boolean).join(" ");

    html += `
      <button
        type="button"
        class="${classes}"
        data-date="${key}"
        aria-label="${key}"
        aria-pressed="${String(key === selectedDate)}"
      >${day}</button>
    `;
  }

  $("#calendar-days").innerHTML = html;
}

/* HEATMAP */

function renderHeatmap() {
  const counts = new Map();

  for (const task of completed()) {
    if (!task.completedAt) continue;
    counts.set(task.completedAt, (counts.get(task.completedAt) || 0) + 1);
  }

  const today = parseDate(todayKey());
  const start = shiftDate(today, -363);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const cells = [];
  const totalDays = 371;
  let lastMonth = -1;
  const monthLabels = [];

  for (let i = 0; i < totalDays; i++) {
    const date = shiftDate(start, i);
    const key = dateKey(date);
    const count = counts.get(key) || 0;

    if (date.getMonth() !== lastMonth) {
      monthLabels.push({
        label: date.toLocaleDateString("en-GB", { month: "short" }),
        index: i
      });
      lastMonth = date.getMonth();
    }

    let level = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count <= 4 && count >= 3) level = 3;
    else if (count >= 5) level = 4;

    const future = date > today;

    cells.push(`
      <div
        class="heat-cell heat-${future ? 0 : level}"
        title="${key}: ${future ? 0 : count} completed task(s)"
        aria-label="${key}: ${future ? 0 : count} completed tasks"
      ></div>
    `);
  }

  $("#heatmap-grid").innerHTML = cells.join("");
  $("#heatmap-months").innerHTML = monthLabels.map((item) => `
    <span style="grid-column:span 1">${escapeHTML(item.label)}</span>
  `).join("");
}

/* PROGRESS */

function renderProgress() {
  const xp = totalXP();
  const level = levelInfo(xp);
  const done = completed().length;
  const total = state.tasks.length;
  const rate = total ? Math.round(done / total * 100) : 0;

  $("#header-level").textContent = level.level;
  $("#progress-level").textContent = level.level;

  $("#level-title").textContent = level.level < 3
    ? "Getting started"
    : level.level < 6
      ? "Building momentum"
      : level.level < 10
        ? "Consistency builder"
        : level.level < 20
          ? "Disciplined"
          : "Discipline legend";

  $("#level-description").textContent = "Keep showing up, one task at a time.";
  $("#level-bar").style.width = `${level.inside}%`;
  $("#level-xp").textContent = `${level.inside} / 100 XP to next level`;

  $("#stat-completed").textContent = done;
  $("#stat-total").textContent = total;
  $("#stat-rate").textContent = `${rate}%`;
  $("#stat-xp").textContent = xp;

  $("#badge-count").textContent = `${state.unlocked.length} / ${ACHIEVEMENTS.length} unlocked`;

  $("#achievements-list").innerHTML = ACHIEVEMENTS.map((achievement) => {
    const unlocked = state.unlocked.includes(achievement.id);

    return `
      <div class="achievement ${unlocked ? "unlocked" : "locked"}">
        <div class="achievement-icon">${achievement.icon}</div>
        <h3>${escapeHTML(achievement.name)}</h3>
        <p>${escapeHTML(achievement.desc)}</p>
        <small>${unlocked ? "UNLOCKED" : "LOCKED"}</small>
      </div>
    `;
  }).join("");

  const week = weeklyStats();
  const streak = streakInfo();

  $("#weekly-report").innerHTML = `
    <div class="weekly-row"><span>Tasks completed this week</span><strong>${week.done}</strong></div>
    <div class="weekly-row"><span>XP earned this week</span><strong>${week.xp}</strong></div>
    <div class="weekly-row"><span>Active days</span><strong>${week.days}/7</strong></div>
    <div class="weekly-row"><span>Daily goals reached</span><strong>${week.goalDays}/7</strong></div>
    <div class="weekly-row"><span>Current streak</span><strong>${streak.current} days</strong></div>
    <div class="weekly-row"><span>Best streak</span><strong>${streak.best} days</strong></div>
  `;

  const activity = state.tasks
    .filter((task) => task.done)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
    .slice(0, 8);

  $("#activity-list").innerHTML = activity.length
    ? activity.map((task) => taskHTML(task, false)).join("")
    : '<div class="empty-state">Complete a task to see your activity here.</div>';
}

/* ANALYTICS */

function countCompletedBetween(start, end) {
  return state.tasks.filter(
    (task) => task.done && task.completedAt && task.completedAt >= start && task.completedAt <= end
  ).length;
}

function xpBetween(start, end) {
  return state.tasks
    .filter((task) => task.done && task.completedAt && task.completedAt >= start && task.completedAt <= end)
    .reduce((sum, task) => sum + taskXP(task), 0);
}

function renderAnalytics() {
  const today = parseDate(todayKey());
  const last7Start = dateKey(shiftDate(today, -6));
  const previous7Start = dateKey(shiftDate(today, -13));
  const previous7End = dateKey(shiftDate(today, -7));

  const last7 = countCompletedBetween(last7Start, todayKey());
  const previous7 = countCompletedBetween(previous7Start, previous7End);
  const last7XP = xpBetween(last7Start, todayKey());
  const streak = streakInfo();

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(today, index - 6);
    const key = dateKey(date);

    return {
      key,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      count: state.tasks.filter((task) => task.done && task.completedAt === key).length
    };
  });

  const maxCount = Math.max(1, ...days.map((day) => day.count));

  const chart = days.map((day) => {
    const height = day.count ? Math.max(4, day.count / maxCount * 100) : 0;

    return `
      <div class="bar-col" title="${day.key}: ${day.count} task(s)">
        <span class="bar-value">${day.count}</span>
        <div class="bar-track">
          <div class="bar-fill" style="height:${height}%"></div>
        </div>
        <span class="bar-label">${escapeHTML(day.label)}</span>
      </div>
    `;
  }).join("");

  const categories = state.categories.map((item) => ({
    name: item.name,
    count: completed().filter((task) => task.category === item.id).length
  }));

  const maxCategory = Math.max(1, ...categories.map((item) => item.count));

  const categoryHTML = categories.map((item) => `
    <div class="compare-metric">
      <div class="compare-top">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${item.count} completed</span>
      </div>
      <div class="compare-bars">
        <div class="compare-bar">
          <span style="width:${item.count / maxCategory * 100}%"></span>
        </div>
      </div>
    </div>
  `).join("");

  let comparisonText;

  if (last7 > previous7) {
    comparisonText = `You completed ${last7 - previous7} more task(s) than in the previous seven-day period.`;
  } else if (last7 < previous7) {
    comparisonText = `You completed ${previous7 - last7} fewer task(s) than in the previous seven-day period. Use the comparison as information, not as a judgment.`;
  } else {
    comparisonText = "Your completion count matches the previous seven-day period.";
  }

  const datedCompletions = state.tasks.filter((task) => task.done && task.completedAt).length;
  const undatedCompletions = completed().length - datedCompletions;

  $("#analytics-dashboard").innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">Completed tasks</span>
        <strong>${completed().length}</strong>
        <small>All recorded completions</small>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total XP</span>
        <strong>${totalXP()}</strong>
        <small>Earned XP</small>
      </div>
      <div class="stat-card">
        <span class="stat-label">Last 7 days</span>
        <strong>${last7}</strong>
        <small>${last7XP} XP earned</small>
      </div>
      <div class="stat-card">
        <span class="stat-label">Best streak</span>
        <strong>${streak.best}</strong>
        <small>Consecutive active days</small>
      </div>
    </div>

    <div class="panel chart-panel">
      <div class="section-heading">
        <h2>Completed tasks</h2>
        <span class="pill">7 days</span>
      </div>
      <p class="muted">Daily completions based on recorded dates.</p>
      <div class="bar-chart">${chart}</div>
    </div>

    <div class="panel">
      <div class="section-heading"><h2>Category breakdown</h2></div>
      ${categoryHTML || '<div class="empty-state">No category data available yet.</div>'}
    </div>

    <div class="panel">
      <div class="section-heading"><h2>7-day comparison</h2></div>

      <div class="compare-metric">
        <div class="compare-top">
          <strong>Last 7 days</strong>
          <span>${last7} tasks</span>
        </div>
        <div class="compare-bars">
          <div class="compare-bar">
            <span style="width:${Math.min(100, last7 / Math.max(1,last7,previous7) * 100)}%"></span>
          </div>
        </div>
      </div>

      <div class="compare-metric">
        <div class="compare-top">
          <strong>Previous 7 days</strong>
          <span>${previous7} tasks</span>
        </div>
        <div class="compare-bars">
          <div class="compare-bar previous">
            <span style="width:${Math.min(100, previous7 / Math.max(1,last7,previous7) * 100)}%"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="section-heading"><h2>Insights</h2></div>
      <div class="insight-line">${escapeHTML(comparisonText)}</div>
      <div class="insight-line">Your current streak is ${streak.current} day(s); your best recorded streak is ${streak.best} day(s).</div>
      <div class="insight-line">
        ${
          undatedCompletions > 0
            ? `${undatedCompletions} previously completed task(s) have no recorded completion date. They count toward total XP, but are excluded from date-based charts and streaks.`
            : `${datedCompletions} completed task(s) have recorded completion dates.`
        }
      </div>
    </div>
  `;
}

/* BONUS QUEST */

function renderQuest() {
  const box = $("#bonus-quest");
  const button = $("#complete-quest");

  if (!activeQuest) {
    box.innerHTML = `
      <span class="quest-icon">🎯</span>
      <div class="quest-info">
        <strong>No bonus quest yet</strong>
        <small>Generate a small extra mission.</small>
      </div>
    `;
    button.disabled = true;
    return;
  }

  box.innerHTML = `
    <span class="quest-icon">🎯</span>
    <div class="quest-info">
      <strong>${escapeHTML(activeQuest.text)}</strong>
      <small>${activeQuest.done ? "Completed — bonus XP awarded." : "Complete it, then claim your reward."}</small>
    </div>
  `;

  button.disabled = activeQuest.done;
}

function generateQuest() {
  activeQuest = {
    text: BONUS_POOL[Math.floor(Math.random() * BONUS_POOL.length)],
    done: false
  };

  renderQuest();
  toast("Bonus quest generated.");
}

function completeQuest() {
  if (!activeQuest || activeQuest.done) return;

  activeQuest.done = true;

  state.tasks.unshift({
    id: uid(),
    text: `Bonus quest: ${activeQuest.text}`,
    created: todayKey(),
    done: true,
    completedAt: todayKey(),
    category: state.categories.some((item) => item.id === "challenge")
      ? "challenge"
      : state.categories[0].id,
    kind: "bonus",
    xpReward: 25
  });

  state.bonusCompleted = (state.bonusCompleted || 0) + 1;
  save();
  checkAchievements();
  renderAll();
  toast("Bonus quest complete · +25 XP");
}

/* FOCUS TIMER */

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let timerEndTime = null;

function configuredDuration() {
  return clamp(Number($("#timer-duration").value) || 25, 1, 180) * 60;
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const seconds = String(timerSeconds % 60).padStart(2, "0");
  $("#timer-display").textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerEndTime = null;
}

function startTimer() {
  if (timerRunning) return;

  // Restart-after-completion: reset to configured duration.
  if (timerSeconds <= 0) {
    timerSeconds = configuredDuration();
    updateTimerDisplay();
  }

  timerRunning = true;
  timerEndTime = Date.now() + timerSeconds * 1000;
  $("#timer-status").textContent = "Focus session in progress…";

  // Poll faster than 1s so the display stays fresh after a throttled tab resumes.
  timerInterval = setInterval(() => {
    timerSeconds = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000));
    updateTimerDisplay();

    if (timerSeconds === 0) {
      stopTimer();

      state.focusSessions = (state.focusSessions || 0) + 1;
      save();
      checkAchievements();
      renderProgress();
      renderAnalytics();

      $("#timer-status").textContent = "Session complete. Take a break if you need one.";
      toast("Focus session complete!");
    }
  }, 250);
}

function pauseTimer() {
  // Recompute from wall clock so pausing after a throttled tab is accurate.
  if (timerEndTime) {
    timerSeconds = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000));
  }
  stopTimer();
  updateTimerDisplay();
  $("#timer-status").textContent = "Paused. Continue when ready.";
}

function resetTimer() {
  stopTimer();
  timerSeconds = configuredDuration();
  updateTimerDisplay();
  $("#timer-status").textContent = "Ready when you are.";
}

/* BACKUP & DATA */

function exportData() {
  const backup = {
    app: "DailyApp",
    version: 2,
    exportedAt: new Date().toISOString(),
    data: state
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `dailyapp-backup-${todayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  toast("Backup exported.");
}

function validateBackup(object) {
  const data = object?.data || object;

  if (!data || typeof data !== "object" || !Array.isArray(data.tasks) || !Array.isArray(data.categories)) {
    throw new Error("This file does not look like a DailyApp backup.");
  }

  const categories = data.categories.map((item) => ({
    id: String(item.id || uid()),
    name: String(item.name || "Category").slice(0, 30),
    xp: clamp(Number(item.xp) || 10, 1, 1000)
  }));

  if (!categories.length) categories.push(...DEFAULT_CATEGORIES.map((item) => ({ ...item })));

  const ids = new Set(categories.map((item) => item.id));

  const tasks = data.tasks.map((task) => ({
    ...task,
    id: String(task.id || uid()),
    text: String(task.text || "Task").slice(0, 100),
    created: /^\d{4}-\d{2}-\d{2}$/.test(task.created) ? task.created : todayKey(),
    done: Boolean(task.done),
    completedAt: /^\d{4}-\d{2}-\d{2}$/.test(task.completedAt) ? task.completedAt : null,
    category: ids.has(String(task.category)) ? String(task.category) : categories[0].id
  }));

  return {
    version: 2,
    tasks,
    categories,
    dailyPlans: data.dailyPlans && typeof data.dailyPlans === "object" ? data.dailyPlans : {},
    bonusCompleted: Math.max(0, Number(data.bonusCompleted) || 0),
    focusSessions: Math.max(0, Number(data.focusSessions) || 0),
    unlocked: Array.isArray(data.unlocked)
      ? data.unlocked.filter((id) => ACHIEVEMENTS.some((item) => item.id === id))
      : []
  };
}

async function importData(file) {
  if (!file) return;

  try {
    const object = JSON.parse(await file.text());
    const nextState = validateBackup(object);

    if (!confirm("Import this backup? Your current DailyApp data will be replaced.")) return;

    state = nextState;
    activeQuest = null;
    save();
    ensureDailyTasks();
    checkAchievements();
    renderAll();

    toast("Backup imported successfully.");
  } catch (error) {
    alert(error.message || "Could not import this file.");
  }
}

function resetAllData() {
  if (!confirm("Reset all DailyApp data? This cannot be undone unless you have a backup.")) return;

  state = {
    version: 2,
    tasks: [],
    categories: DEFAULT_CATEGORIES.map((item) => ({ ...item })),
    dailyPlans: {},
    bonusCompleted: 0,
    focusSessions: 0,
    unlocked: []
  };

  activeQuest = null;
  save();
  ensureDailyTasks();
  renderAll();
  toast("DailyApp data has been reset.");
}

/* CATEGORY MANAGEMENT */

function addCategory(name, xp) {
  const cleanName = name.trim();

  if (!cleanName) {
    toast("Enter a category name.");
    return;
  }

  if (!Number.isInteger(xp) || xp < 1 || xp > 1000) {
    toast("Enter an XP reward between 1 and 1000.");
    return;
  }

  if (state.categories.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
    toast("That category already exists.");
    return;
  }

  state.categories.push({ id: uid(), name: cleanName.slice(0,30), xp });

  save();
  checkAchievements();
  renderAll();
  toast("Category created.");
}

function editCategoryXP(id) {
  const item = category(id);
  const value = prompt(`New XP reward for ${item.name} (1–1000):`, String(item.xp));

  if (value === null) return;

  const xp = Number(value);
  if (!Number.isInteger(xp) || xp < 1 || xp > 1000) {
    toast("Enter a whole number from 1 to 1000.");
    return;
  }

  item.xp = xp;
  save();
  renderAll();
  toast("Category XP updated.");
}

function deleteCategory(id) {
  if (DEFAULT_CATEGORIES.some((item) => item.id === id)) {
    toast("Default categories cannot be deleted.");
    return;
  }

  const item = category(id);

  if (!confirm(`Delete category "${item.name}"? Existing tasks will move to Daily.`)) return;

  state.tasks.forEach((task) => {
    if (task.category === id) task.category = "daily";
  });

  state.categories = state.categories.filter((item) => item.id !== id);
  save();
  renderAll();
  toast("Category deleted.");
}

/* NAVIGATION */

function go(view) {
  const target = document.getElementById(`view-${view}`);
  if (!target) return;

  $$(".view").forEach((element) => {
    element.classList.toggle("active", element === target);
  });

  $$(".nav-item").forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  // Move focus into the new view for screen readers / keyboard users.
  const heading = target.querySelector("h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (view === "calendar") {
    renderCalendar();
    renderHeatmap();
    renderTaskLists();
  }

  if (view === "analytics") renderAnalytics();
}

/* RENDER ALL */

function renderAll() {
  renderCategories();
  renderHome();
  renderTaskLists();
  renderCalendar();
  renderHeatmap();
  renderProgress();
  renderAnalytics();
  renderQuest();
  updateTimerDisplay();
}

/* EVENT LISTENERS */

// Navigation and dynamic task/category controls.
document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) {
    go(nav.dataset.view);
    return;
  }

  const goButton = event.target.closest("[data-go]");
  if (goButton) {
    go(goButton.dataset.go);
    return;
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    currentFilter = filter.dataset.filter;

    $$("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filter);
    });

    renderTaskLists();
    return;
  }

  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    toggleTask(toggle.dataset.toggle);
    return;
  }

  const removeTask = event.target.closest("[data-delete]");
  if (removeTask) {
    deleteTask(removeTask.dataset.delete);
    return;
  }

  const day = event.target.closest("[data-date]");
  if (day) {
    selectedDate = day.dataset.date;
    renderCalendar();
    renderTaskLists();
    return;
  }

  if (event.target.closest("#prev-month")) {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar();
    return;
  }

  if (event.target.closest("#next-month")) {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar();
    return;
  }

  const edit = event.target.closest("[data-edit-cat]");
  if (edit) {
    editCategoryXP(edit.dataset.editCat);
    return;
  }

  const removeCategoryButton = event.target.closest("[data-delete-cat]");
  if (removeCategoryButton) {
    deleteCategory(removeCategoryButton.dataset.deleteCat);
    return;
  }

  // Narrowed to actual swatches — <html> also carries data-accent via dataset,
  // and a bare [data-accent] selector would match it on any click anywhere.
  const accentButton = event.target.closest(".accent-swatch[data-accent]");
  if (accentButton && ACCENTS[accentButton.dataset.accent]) {
    appearance.accent = accentButton.dataset.accent;
    saveAppearance();
    toast("Accent color updated.");
    return;
  }

  if (event.target.closest("#new-quest")) generateQuest();
  if (event.target.closest("#complete-quest")) completeQuest();
  if (event.target.closest("#timer-start")) startTimer();
  if (event.target.closest("#timer-pause")) pauseTimer();
  if (event.target.closest("#timer-reset")) resetTimer();
  if (event.target.closest("#export-data")) exportData();

  if (event.target.closest("#import-data")) {
    $("#import-file").click();
  }

  if (event.target.closest("#reset-data")) resetAllData();
});

// Task and category forms.
$("#task-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#task-input");
  const text = input.value.trim();
  if (!text) return;

  createTask(text, $("#task-category").value);
  input.value = "";
  input.focus();
});

$("#category-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#category-name").value.trim();
  const xp = Number($("#category-xp").value);

  addCategory(name, xp);

  if (name) $("#category-name").value = "";
});

// Theme and timer settings.
$("#theme-select").addEventListener("change", (event) => {
  appearance.theme = event.target.value;
  saveAppearance();
  toast("Theme updated.");
});

$("#timer-duration").addEventListener("change", resetTimer);

// Import backup.
$("#import-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  await importData(file);
  event.target.value = "";
});

/* INITIALIZE */

applyAppearance();
ensureDailyTasks();
checkAchievements();
renderAll();
updateTimerDisplay();

// Mark the initial active nav item for assistive tech.
const initialActiveNav = $(".nav-item.active");
if (initialActiveNav) initialActiveNav.setAttribute("aria-current", "page");
