"use strict";

/* =========================================
   DAILYAPP 2.2 — MAIN JAVASCRIPT
   Storage remains compatible with DailyApp
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
  mint:   { color: "#63e6b0", rgb: "99,230,176" },
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
  {
    id: "first",
    icon: "🌱",
    name: "First Step",
    desc: "Complete your first task.",
    test: (s) => completed(s).length >= 1
  },
  {
    id: "five",
    icon: "⚡",
    name: "Getting Momentum",
    desc: "Complete 5 tasks.",
    test: (s) => completed(s).length >= 5
  },
  {
    id: "twentyfive",
    icon: "🧩",
    name: "Consistent Builder",
    desc: "Complete 25 tasks.",
    test: (s) => completed(s).length >= 25
  },
  {
    id: "hundred",
    icon: "💯",
    name: "Century Club",
    desc: "Complete 100 tasks.",
    test: (s) => completed(s).length >= 100
  },
  {
    id: "xp100",
    icon: "✨",
    name: "XP Collector",
    desc: "Earn 100 XP.",
    test: (s) => totalXP(s) >= 100
  },
  {
    id: "xp1000",
    icon: "🏅",
    name: "XP Machine",
    desc: "Earn 1,000 XP.",
    test: (s) => totalXP(s) >= 1000
  },
  {
    id: "streak3",
    icon: "🔥",
    name: "Three-Day Spark",
    desc: "Reach a 3-day streak.",
    test: (s) => {
      const streak = streakInfo(s);
      return streak.current >= 3 || streak.best >= 3;
    }
  },
  {
    id: "streak7",
    icon: "🗓️",
    name: "One-Week Rhythm",
    desc: "Reach a 7-day streak.",
    test: (s) => {
      const streak = streakInfo(s);
      return streak.current >= 7 || streak.best >= 7;
    }
  },
  {
    id: "bonus",
    icon: "🎯",
    name: "Side Quest",
    desc: "Complete a bonus quest.",
    test: (s) => (s.bonusCompleted || 0) >= 1
  },
  {
    id: "focus",
    icon: "⏱️",
    name: "Focus Starter",
    desc: "Complete a focus session.",
    test: (s) => (s.focusSessions || 0) >= 1
  },
  {
    id: "category",
    icon: "🛠️",
    name: "Make It Yours",
    desc: "Create a custom category.",
    test: (s) => s.categories.some(
      (c) => !DEFAULT_CATEGORIES.some((d) => d.id === c.id)
    )
  }
];


/* =========================================
   UTILITIES
========================================= */

function first(...selectors) {
  for (const selector of selectors) {
    const element = $(selector);
    if (element) return element;
  }

  return null;
}

function getView(name) {
  return first(`#view-${name}`, `[data-page="${name}"]`);
}

function slot(viewName, selectors, id, className = "") {
  const existing = first(...selectors);
  if (existing) return existing;

  const parent = getView(viewName);
  if (!parent) return null;

  const element = document.createElement("div");
  element.id = id;

  if (className) {
    element.className = className;
  }

  parent.appendChild(element);
  return element;
}

function setText(selectors, value) {
  const element = first(...selectors);
  if (element) element.textContent = value;
}

function setWidth(selectors, percent) {
  const element = first(...selectors);
  if (element) {
    element.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

let toastTimer = null;

function toast(message) {
  const element = first("#toast", ".toast");

  if (!element) {
    console.log(message);
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2400);
}


/* =========================================
   APPEARANCE SETTINGS
========================================= */

function loadAppearance() {
  const defaults = {
    theme: "dark",
    accent: "mint"
  };

  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "null"
    );

    if (!saved || typeof saved !== "object") {
      return defaults;
    }

    return {
      theme: ["dark", "light", "auto"].includes(saved.theme)
        ? saved.theme
        : defaults.theme,

      accent: Object.hasOwn(ACCENTS, saved.accent)
        ? saved.accent
        : defaults.accent
    };
  } catch {
    return defaults;
  }
}

let appearance = loadAppearance();

function resolvedTheme() {
  if (appearance.theme === "auto") {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return appearance.theme;
}

function applyAppearance() {
  const root = document.documentElement;
  const accent = ACCENTS[appearance.accent] || ACCENTS.mint;
  const theme = resolvedTheme();

  root.dataset.theme = theme;
  root.dataset.accent = appearance.accent;
  root.style.setProperty("--accent", accent.color);
  root.style.setProperty("--accent-rgb", accent.rgb);

  // Compatibility with older DailyApp styles.
  root.style.setProperty("--mint", accent.color);
  root.style.setProperty("--mint-rgb", accent.rgb);

  const themeColor = first("#theme-color", 'meta[name="theme-color"]');

  if (themeColor) {
    themeColor.setAttribute(
      "content",
      theme === "dark" ? "#080d1a" : "#f3f6fb"
    );
  }

  const themeSelect = first("#theme-select", "#theme-picker");

  if (themeSelect) {
    themeSelect.value = appearance.theme;
  }

  const themeStatus = first("#theme-status");

  if (themeStatus) {
    themeStatus.textContent =
      appearance.theme === "auto"
        ? `Automatic (${theme})`
        : theme === "dark"
          ? "Dark mode"
          : "Light mode";
  }

  $$("[data-accent], .accent-swatch, .color-option").forEach((button) => {
    const selected = button.dataset.accent === appearance.accent;

    button.classList.toggle("active", selected);
    button.classList.toggle("selected", selected);
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
    if (appearance.theme === "auto") {
      applyAppearance();
    }
  };

  if (colorSchemeQuery.addEventListener) {
    colorSchemeQuery.addEventListener("change", onSystemThemeChange);
  } else if (colorSchemeQuery.addListener) {
    colorSchemeQuery.addListener(onSystemThemeChange);
  }
}


/* =========================================
   DATA & STORAGE
========================================= */

function loadState() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (raw && typeof raw === "object") {
      const categories =
        Array.isArray(raw.categories) && raw.categories.length
          ? raw.categories
          : DEFAULT_CATEGORIES;

      return {
        version: 2,

        tasks: Array.isArray(raw.tasks)
          ? raw.tasks.map((task) => ({
              ...task,
              id: String(task.id || uid()),
              text: String(task.text || "Task"),
              created: /^\d{4}-\d{2}-\d{2}$/.test(task.created)
                ? task.created
                : todayKey(),
              done: Boolean(task.done),

              // Do not invent completion dates for older tasks.
              completedAt:
                /^\d{4}-\d{2}-\d{2}$/.test(task.completedAt)
                  ? task.completedAt
                  : null,

              category: String(task.category || "daily")
            }))
          : [],

        categories: categories.map((category) => ({
          id: String(category.id || uid()),
          name: String(category.name || "Category"),
          xp: clamp(Number(category.xp) || 10, 1, 1000)
        })),

        dailyPlans:
          raw.dailyPlans && typeof raw.dailyPlans === "object"
            ? raw.dailyPlans
            : {},

        bonusCompleted: Math.max(
          0,
          Number(raw.bonusCompleted) || 0
        ),

        focusSessions: Math.max(
          0,
          Number(raw.focusSessions) || 0
        ),

        unlocked: Array.isArray(raw.unlocked)
          ? raw.unlocked
          : []
      };
    }
  } catch (error) {
    console.warn("Could not read saved DailyApp data.", error);
  }

  return {
    version: 2,
    tasks: [],
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
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
  return (
    state.categories.find((item) => item.id === id) ||
    state.categories[0] ||
    DEFAULT_CATEGORIES[0]
  );
}

function taskXP(task) {
  if (
    task.xpReward !== undefined &&
    task.xpReward !== null &&
    Number.isFinite(Number(task.xpReward))
  ) {
    return Math.max(0, Number(task.xpReward));
  }

  return category(task.category).xp;
}

function completed(source = state) {
  return source.tasks.filter((task) => task.done);
}

function totalXP(source = state) {
  return completed(source).reduce(
    (sum, task) => sum + taskXP(task),
    0
  );
}

function levelInfo(xp) {
  const safeXP = Math.max(0, xp);
  const level = Math.floor(safeXP / 100) + 1;

  return {
    level,
    inside: safeXP % 100,
    needed: 100
  };
}


/* =========================================
   DAILY PLAN & STREAKS
========================================= */

function getPlan(day = todayKey()) {
  if (!state.dailyPlans[day]) {
    const pool = [...TASK_POOL];
    const count = 4 + Math.floor(Math.random() * 2);
    const chosen = [];

    while (chosen.length < count && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(index, 1)[0]);
    }

    state.dailyPlans[day] = {
      goal: DAILY_GOALS[
        Math.floor(Math.random() * DAILY_GOALS.length)
      ],
      taskTexts: chosen
    };

    save();
  }

  return state.dailyPlans[day];
}

function ensureDailyTasks(day = todayKey()) {
  const plan = getPlan(day);

  if (!Array.isArray(plan.taskTexts)) {
    plan.taskTexts = [];
  }

  for (const text of plan.taskTexts) {
    const alreadyExists = state.tasks.some(
      (task) =>
        task.kind === "daily-plan" &&
        task.day === day &&
        task.text === text
    );

    if (!alreadyExists) {
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
    source.tasks
      .filter((task) => task.done && task.completedAt)
      .map((task) => task.completedAt)
  );

  let current = 0;
  let date = new Date();
  let key = dateKey(date);

  // A streak may continue from yesterday if today has no completed tasks.
  if (!days.has(key)) {
    date = shiftDate(date, -1);
    key = dateKey(date);
  }

  while (days.has(key)) {
    current++;
    date = shiftDate(date, -1);
    key = dateKey(date);
  }

  const sortedDays = [...days].sort();
  let best = 0;
  let run = 0;
  let previous = null;

  for (const day of sortedDays) {
    const parsed = parseDate(day);

    if (previous) {
      const difference = Math.round(
        (parsed - previous) / 86400000
      );

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

  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(monday, index);
    return dateKey(date);
  });
}

function weeklyStats(reference = new Date()) {
  const keys = weekKeys(reference);

  const doneTasks = state.tasks.filter(
    (task) => task.done && task.completedAt && keys.includes(task.completedAt)
  );

  return {
    done: doneTasks.length,
    xp: doneTasks.reduce((sum, task) => sum + taskXP(task), 0),
    days: new Set(doneTasks.map((task) => task.completedAt)).size,
    goalDays: keys.filter((key) => {
      const goal = state.dailyPlans[key]?.goal;
      return Number.isFinite(goal) && dailyEarned(key) >= goal;
    }).length,
    keys
  };
}


/* =========================================
   TASK CREATION & ACTIONS
========================================= */

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

  toast(
    task.done
      ? `Task complete · +${taskXP(task)} XP`
      : "Task marked active"
  );
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

  const statusText = task.done
    ? task.completedAt
      ? `Completed ${task.completedAt}`
      : "Completed · date not recorded"
    : task.created === todayKey()
      ? "Added today"
      : `Added ${task.created}`;

  return `
    <article class="task-card task-item ${task.done ? "done" : ""}">
      <button
        class="task-check"
        data-toggle="${escapeHTML(task.id)}"
        aria-label="${task.done ? "Mark task active" : "Complete task"}"
        aria-pressed="${String(task.done)}"
      >${task.done ? "✓" : ""}</button>

      <div class="task-copy task-main">
        <div class="task-title">${escapeHTML(task.text)}</div>
        <div class="task-sub task-meta">
          ${escapeHTML(selectedCategory.name)} · ${escapeHTML(statusText)}
        </div>
      </div>

      <span class="task-xp xp-pill">+${taskXP(task)} XP</span>

      ${
        showDelete
          ? `<button
               class="delete-task"
               data-delete="${escapeHTML(task.id)}"
               aria-label="Delete task"
             >×</button>`
          : ""
      }
    </article>
  `;
}


/* =========================================
   ACHIEVEMENTS
========================================= */

function checkAchievements() {
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (
      !state.unlocked.includes(achievement.id) &&
      achievement.test(state)
    ) {
      state.unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    save();

    newlyUnlocked.forEach((achievement, index) => {
      setTimeout(() => {
        toast(`Badge unlocked: ${achievement.name} ${achievement.icon}`);
      }, index * 900);
    });
  }
}


/* =========================================
   HOME DASHBOARD
========================================= */

function renderHome() {
  const today = todayKey();

  const todayTasks = state.tasks.filter(
    (task) =>
      task.created === today ||
      (task.kind === "daily-plan" && task.day === today)
  );

  const doneToday = todayTasks.filter((task) => task.done).length;
  const xp = totalXP();
  const plan = getPlan();
  const earned = dailyEarned();
  const goal = Number(plan.goal) || 0;
  const percent = todayTasks.length
    ? Math.round((doneToday / todayTasks.length) * 100)
    : 0;

  const dateElement = first("#today-date", "#current-date", "[data-today-date]");

  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  const hour = new Date().getHours();

  setText(
    ["#greeting", "#home-greeting", "[data-greeting]"],
    hour < 12
      ? "Make today count."
      : hour < 18
        ? "Keep your momentum."
        : "Finish strong, then rest."
  );

  setText(
    ["#home-completed", "#home-tasks-completed", "[data-home-completed]"],
    `${doneToday}/${todayTasks.length}`
  );

  setText(
    ["#home-xp", "#home-total-xp", "[data-home-xp]"],
    `${xp} XP`
  );

  setText(
    ["#home-percent", "#home-progress-percent", "[data-home-percent]"],
    `${percent}%`
  );

  setWidth(
    ["#home-bar", "#home-progress-bar", "[data-home-bar]"],
    percent
  );

  setText(
    ["#daily-goal-label", "#daily-goal-xp", "[data-daily-goal-label]"],
    `${earned} XP / ${goal} XP`
  );

  setWidth(
    ["#daily-goal-bar", "[data-daily-goal-bar]"],
    goal ? (earned / goal) * 100 : 0
  );

  setText(
    ["#daily-challenge-text", "[data-daily-challenge]"],
    earned >= goal && goal > 0
      ? "Daily XP goal reached — great work!"
      : `Earn ${Math.max(0, goal - earned)} more XP today to reach your daily goal.`
  );

  const streak = streakInfo();

  setText(
    ["#current-streak", "#home-streak", "[data-current-streak]"],
    streak.current
  );

  setText(
    ["#best-streak", "[data-best-streak]"],
    streak.best
  );

  setText(
    ["#weekly-complete", "#home-weekly-complete", "[data-weekly-complete]"],
    weeklyStats().done
  );

  const homeTasks = slot(
    "home",
    ["#home-tasks", "#home-task-list", "[data-home-tasks]"],
    "home-tasks",
    "task-list"
  );

  if (homeTasks) {
    const visibleTasks = todayTasks.slice(0, 5);

    homeTasks.innerHTML = visibleTasks.length
      ? visibleTasks.map((task) => taskHTML(task, false)).join("")
      : '<div class="empty-state">No tasks yet. Add one and get started.</div>';
  }

  const weeklyContainer = first(
    "#home-weekly-report",
    "#home-weekly-stats",
    "[data-home-weekly]"
  );

  if (weeklyContainer) {
    const week = weeklyStats();

    weeklyContainer.innerHTML = `
      <div class="stat-grid three">
        <div class="stat-card">
          <span class="stat-label">Tasks completed</span>
          <strong>${week.done}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">XP earned</span>
          <strong>${week.xp}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active days</span>
          <strong>${week.days}/7</strong>
        </div>
      </div>
    `;
  }

  const level = levelInfo(xp);

  setText(["#header-level", "#top-level", "[data-header-level]"], level.level);
}


/* =========================================
   TASK LISTS
========================================= */

function renderTaskLists() {
  const taskList = slot(
    "tasks",
    ["#task-list", "#tasks-list", "[data-task-list]"],
    "task-list",
    "task-list"
  );

  if (taskList) {
    const filtered = state.tasks.filter((task) => {
      if (currentFilter === "open") return !task.done;
      if (currentFilter === "done") return task.done;
      return true;
    });

    taskList.innerHTML = filtered.length
      ? filtered.map((task) => taskHTML(task, true)).join("")
      : '<div class="empty-state">No tasks here yet. Add a task to get started.</div>';
  }

  const calendarTasks = slot(
    "calendar",
    ["#calendar-tasks", "#selected-day-tasks", "[data-calendar-tasks]"],
    "calendar-tasks",
    "task-list"
  );

  if (calendarTasks) {
    const dayTasks = state.tasks.filter(
      (task) =>
        task.created === selectedDate ||
        task.completedAt === selectedDate
    );

    calendarTasks.innerHTML = dayTasks.length
      ? dayTasks.map((task) => taskHTML(task, false)).join("")
      : '<div class="empty-state">No tasks recorded for this day.</div>';
  }

  const selectedHeading = first(
    "#selected-date-heading",
    "#selected-day-heading",
    "[data-selected-date-heading]"
  );

  if (selectedHeading) {
    selectedHeading.textContent = parseDate(selectedDate).toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
  }
}

function renderCategories() {
  const categorySelect = first(
    "#task-category",
    "#task-category-select",
    "[data-task-category]"
  );

  if (categorySelect) {
    const currentValue = categorySelect.value;

    categorySelect.innerHTML = state.categories.map((item) => `
      <option value="${escapeHTML(item.id)}">
        ${escapeHTML(item.name)} · ${item.xp} XP
      </option>
    `).join("");

    if (state.categories.some((item) => item.id === currentValue)) {
      categorySelect.value = currentValue;
    }
  }

  const categoryList = first(
    "#category-list",
    "#categories-list",
    "[data-category-list]"
  );

  if (categoryList) {
    categoryList.innerHTML = state.categories.map((item) => `
      <div class="category-row">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>${item.xp} XP per task</small>
        </div>

        <button
          class="secondary-button"
          data-edit-cat="${escapeHTML(item.id)}"
          type="button"
        >Edit XP</button>

        ${
          DEFAULT_CATEGORIES.some((defaultItem) => defaultItem.id === item.id)
            ? ""
            : `<button
                 class="delete-task"
                 data-delete-cat="${escapeHTML(item.id)}"
                 type="button"
                 aria-label="Delete category"
               >×</button>`
        }
      </div>
    `).join("");
  }
}


/* =========================================
   CALENDAR
========================================= */

function renderCalendar() {
  const monthLabel = first(
    "#calendar-month",
    "#calendar-title",
    "[data-calendar-month]"
  );

  if (monthLabel) {
    monthLabel.textContent = calendarCursor.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric"
    });
  }

  const calendarDays = slot(
    "calendar",
    [
      "#calendar-days",
      "#calendar-grid",
      "[data-calendar-days]",
      ".calendar-grid:not(.calendar-weekdays)"
    ],
    "calendar-days",
    "calendar-grid"
  );

  if (!calendarDays) return;

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
    const date = new Date(year, month, day);
    const key = dateKey(date);

    const hasActivity = state.tasks.some(
      (task) => task.created === key || task.completedAt === key
    );

    const classes = [
      "calendar-day",
      "day-button",
      key === todayKey() ? "today" : "",
      key === selectedDate ? "selected" : "",
      hasActivity ? "has-activity has-tasks" : ""
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

  calendarDays.innerHTML = html;

  setText(
    ["#selected-date-heading", "#selected-day-heading"],
    parseDate(selectedDate).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  );
}


/* =========================================
   ACTIVITY HEATMAP
========================================= */

function renderHeatmap() {
  const calendarView = getView("calendar");
  if (!calendarView) return;

  let grid = first(
    "#heatmap-grid",
    "#activity-heatmap-grid",
    "[data-heatmap-grid]"
  );

  if (!grid) {
    let panel = first("#activity-heatmap", "[data-activity-heatmap]");

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "activity-heatmap";
      panel.className = "panel heatmap-panel";

      panel.innerHTML = `
        <div class="section-heading">
          <h3>Activity heatmap</h3>
        </div>
        <p class="muted">Your completed tasks over the past year.</p>
        <div id="heatmap-months" class="heatmap-months"></div>
        <div class="heatmap-layout">
          <div class="heatmap-weekdays">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div id="heatmap-grid" class="heatmap-grid"></div>
        </div>
        <div class="heatmap-legend">
          <span>Less</span>
          <i class="heat-0"></i>
          <i class="heat-1"></i>
          <i class="heat-2"></i>
          <i class="heat-3"></i>
          <i class="heat-4"></i>
          <span>More</span>
        </div>
      `;

      calendarView.appendChild(panel);
    }

    grid = first("#heatmap-grid", "#activity-heatmap-grid");
  }

  if (!grid) return;

  const activityCounts = new Map();

  // Only tasks with a real completion date count toward the heatmap.
  for (const task of completed()) {
    if (!task.completedAt) continue;

    activityCounts.set(
      task.completedAt,
      (activityCounts.get(task.completedAt) || 0) + 1
    );
  }

  const today = parseDate(todayKey());
  const start = shiftDate(today, -363);
  const startOffset = (start.getDay() + 6) % 7;

  start.setDate(start.getDate() - startOffset);

  const cells = [];
  const totalDays = 371;

  for (let i = 0; i < totalDays; i++) {
    const date = shiftDate(start, i);
    const key = dateKey(date);
    const count = activityCounts.get(key) || 0;

    let level = 0;

    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count <= 4 && count >= 3) level = 3;
    else if (count >= 5) level = 4;

    const future = date > today;

    cells.push(`
      <div
        class="heat-cell heat-${future ? 0 : level}"
        data-heat-date="${key}"
        title="${key}: ${future ? 0 : count} completed task${count === 1 ? "" : "s"}"
        aria-label="${key}: ${future ? 0 : count} completed tasks"
      ></div>
    `);
  }

  grid.innerHTML = cells.join("");

  const monthLabels = first(
    "#heatmap-months",
    "#activity-heatmap-months",
    "[data-heatmap-months]"
  );

  if (monthLabels) {
    const labels = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const date = shiftDate(start, i);

      if (date.getMonth() !== lastMonth) {
        labels.push(
          date.toLocaleDateString("en-GB", { month: "short" })
        );
        lastMonth = date.getMonth();
      }
    }

    monthLabels.innerHTML = labels.map((label) =>
      `<span>${escapeHTML(label)}</span>`
    ).join("");
  }
}


/* =========================================
   PROGRESS & ACHIEVEMENTS
========================================= */

function renderProgress() {
  const xp = totalXP();
  const level = levelInfo(xp);
  const done = completed().length;
  const total = state.tasks.length;
  const rate = total ? Math.round((done / total) * 100) : 0;

  setText(["#header-level", "#top-level", "[data-header-level]"], level.level);
  setText(["#progress-level", "#level-number", "[data-progress-level]"], level.level);

  const title = level.level < 3
    ? "Getting started"
    : level.level < 6
      ? "Building momentum"
      : level.level < 10
        ? "Consistency builder"
        : level.level < 20
          ? "Disciplined"
          : "Discipline legend";

  setText(["#level-title", "[data-level-title]"], title);

  setText(
    ["#level-description", "[data-level-description]"],
    "Keep showing up, one task at a time."
  );

  setWidth(["#level-bar", "[data-level-bar]"], level.inside);

  setText(
    ["#level-xp", "[data-level-xp]"],
    `${level.inside} / 100 XP to next level`
  );

  setText(["#stat-completed", "#total-completed", "[data-stat-completed]"], done);
  setText(["#stat-total", "#total-tasks", "[data-stat-total]"], total);
  setText(["#stat-rate", "#completion-rate", "[data-stat-rate]"], `${rate}%`);
  setText(["#stat-xp", "#total-xp", "[data-stat-xp]"], xp);

  const grid = first(
    "#achievement-grid",
    "#achievements-list",
    "[data-achievements]"
  );

  if (grid) {
    grid.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const unlocked = state.unlocked.includes(achievement.id);

      return `
        <div class="achievement ${unlocked ? "unlocked" : "locked"}">
          <div class="achievement-icon achievement-icon-old ach-icon">
            ${achievement.icon}
          </div>
          <h3>${escapeHTML(achievement.name)}</h3>
          <p>${escapeHTML(achievement.desc)}</p>
          <small>${unlocked ? "UNLOCKED" : "LOCKED"}</small>
        </div>
      `;
    }).join("");
  }

  setText(
    ["#badge-count", "[data-badge-count]"],
    `${state.unlocked.length} / ${ACHIEVEMENTS.length} unlocked`
  );

  const weeklyContainer = first(
    "#weekly-report",
    "#weekly-progress",
    "[data-weekly-report]"
  );

  if (weeklyContainer) {
    const week = weeklyStats();
    const streak = streakInfo();

    weeklyContainer.innerHTML = `
      <div class="weekly-row">
        <span>Tasks completed this week</span>
        <strong>${week.done}</strong>
      </div>
      <div class="weekly-row">
        <span>XP earned this week</span>
        <strong>${week.xp}</strong>
      </div>
      <div class="weekly-row">
        <span>Active days</span>
        <strong>${week.days}/7</strong>
      </div>
      <div class="weekly-row">
        <span>Daily goals reached</span>
        <strong>${week.goalDays}/7</strong>
      </div>
      <div class="weekly-row">
        <span>Current streak</span>
        <strong>${streak.current} days</strong>
      </div>
      <div class="weekly-row">
        <span>Best streak</span>
        <strong>${streak.best} days</strong>
      </div>
    `;
  }

  const activityList = first(
    "#activity-list",
    "#recent-activity",
    "[data-activity-list]"
  );

  if (activityList) {
    const activity = state.tasks
      .filter((task) => task.done)
      .sort((a, b) =>
        (b.completedAt || "").localeCompare(a.completedAt || "")
      )
      .slice(0, 8);

    activityList.innerHTML = activity.length
      ? activity.map((task) => taskHTML(task, false)).join("")
      : '<div class="empty-state">Complete a task to see your activity here.</div>';
  }
}


/* =========================================
   ANALYTICS DASHBOARD
========================================= */

function countCompletedBetween(startKey, endKey) {
  return state.tasks.filter((task) =>
    task.done &&
    task.completedAt &&
    task.completedAt >= startKey &&
    task.completedAt <= endKey
  ).length;
}

function xpBetween(startKey, endKey) {
  return state.tasks
    .filter((task) =>
      task.done &&
      task.completedAt &&
      task.completedAt >= startKey &&
      task.completedAt <= endKey
    )
    .reduce((sum, task) => sum + taskXP(task), 0);
}

function dailyCounts(days = 7) {
  const today = parseDate(todayKey());

  return Array.from({ length: days }, (_, index) => {
    const date = shiftDate(today, index - days + 1);
    const key = dateKey(date);

    return {
      key,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      count: state.tasks.filter(
        (task) => task.done && task.completedAt === key
      ).length
    };
  });
}

function renderAnalytics() {
  const analyticsView = getView("analytics");
  if (!analyticsView) return;

  let dashboard = first(
    "#analytics-dashboard",
    "#analytics-content",
    "[data-analytics-dashboard]"
  );

  if (!dashboard) {
    dashboard = document.createElement("div");
    dashboard.id = "analytics-dashboard";
    dashboard.className = "analytics-dashboard";
    analyticsView.appendChild(dashboard);
  }

  const datedCompletions = state.tasks.filter(
    (task) => task.done && task.completedAt
  ).length;

  const undatedCompletions = completed().length - datedCompletions;

  const today = parseDate(todayKey());
  const start7 = dateKey(shiftDate(today, -6));
  const start14 = dateKey(shiftDate(today, -13));
  const endYesterday = dateKey(shiftDate(today, -7));

  const last7 = countCompletedBetween(start7, todayKey());
  const previous7 = countCompletedBetween(start14, endYesterday);

  const xp7 = xpBetween(start7, todayKey());
  const streak = streakInfo();
  const days = dailyCounts(7);
  const highestCount = Math.max(1, ...days.map((day) => day.count));

  const barChart = days.map((day) => {
    const height = day.count
      ? Math.max(4, (day.count / highestCount) * 100)
      : 0;

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

  const categories = state.categories.map((item) => {
    const count = completed().filter(
      (task) => task.category === item.id
    ).length;

    return { name: item.name, count };
  });

  const highestCategoryCount = Math.max(
    1,
    ...categories.map((item) => item.count)
  );

  const categoryHTML = categories.map((item) => `
    <div class="compare-metric">
      <div class="compare-top">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${item.count} completed</span>
      </div>
      <div class="compare-bars">
        <div class="compare-bar">
          <span style="width:${(item.count / highestCategoryCount) * 100}%"></span>
        </div>
      </div>
    </div>
  `).join("");

  let insight;

  if (last7 > previous7) {
    insight = `You completed ${last7 - previous7} more task(s) than in the previous seven-day period.`;
  } else if (last7 < previous7) {
    insight = `You completed ${previous7 - last7} fewer task(s) than in the previous seven-day period. Treat this as information, not a judgment.`;
  } else {
    insight = "Your completion count matches the previous seven-day period.";
  }

  dashboard.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">Completed tasks</span>
        <strong>${completed().length}</strong>
        <small>All recorded completions</small>
      </div>

      <div class="stat-card">
        <span class="stat-label">Total XP</span>
        <strong>${totalXP()}</strong>
        <small>From completed tasks</small>
      </div>

      <div class="stat-card">
        <span class="stat-label">Last 7 days</span>
        <strong>${last7}</strong>
        <small>${xp7} XP earned</small>
      </div>

      <div class="stat-card">
        <span class="stat-label">Current streak</span>
        <strong>${streak.current}</strong>
        <small>Consecutive active days</small>
      </div>
    </div>

    <div class="panel chart-panel">
      <div class="section-heading">
        <h3>Completed tasks · Last 7 days</h3>
      </div>

      <p class="muted">
        This graph uses recorded completion dates.
      </p>

      <div class="bar-chart">
        ${barChart}
      </div>
    </div>

    <div class="panel chart-panel">
      <div class="section-heading">
        <h3>Category breakdown</h3>
      </div>

      ${
        categoryHTML ||
        '<div class="empty-state">Add categories to see a breakdown.</div>'
      }
    </div>

    <div class="panel">
      <div class="section-heading">
        <h3>Period comparison</h3>
      </div>

      <div class="compare-metric">
        <div class="compare-top">
          <strong>Last 7 days</strong>
          <span>${last7} tasks</span>
        </div>
        <div class="compare-bars">
          <div class="compare-bar">
            <span style="width:${Math.min(100, last7 / Math.max(1, last7, previous7) * 100)}%"></span>
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
            <span style="width:${Math.min(100, previous7 / Math.max(1, last7, previous7) * 100)}%"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="section-heading">
        <h3>Insights</h3>
      </div>

      <div class="insight-line">${escapeHTML(insight)}</div>

      <div class="insight-line">
        You have ${streak.best} day(s) as your best recorded streak.
      </div>

      ${
        undatedCompletions > 0
          ? `<div class="insight-line">
               ${undatedCompletions} completed task(s) have no recorded completion date.
               They count toward total XP and completed tasks, but are excluded from
               date-based graphs and streaks.
             </div>`
          : `<div class="insight-line">
               ${datedCompletions} completed task(s) have recorded completion dates.
             </div>`
      }
    </div>
  `;
}


/* =========================================
   BONUS QUEST
========================================= */

function renderQuest() {
  const box = first("#bonus-quest", "#bonus-quest-content");
  const completeButton = first("#complete-quest", "#complete-bonus-quest");

  if (!activeQuest) {
    if (box) {
      box.innerHTML = `
        <span class="quest-icon">🎯</span>
        <div class="quest-info">
          <strong>No bonus quest yet</strong>
          <small>Generate one when you're ready.</small>
        </div>
      `;
    }

    if (completeButton) completeButton.disabled = true;
    return;
  }

  if (box) {
    box.innerHTML = `
      <span class="quest-icon">🎯</span>
      <div class="quest-info">
        <strong>${escapeHTML(activeQuest.text)}</strong>
        <small>
          ${activeQuest.done
            ? "Completed — bonus XP awarded."
            : "Complete it, then claim your reward."}
        </small>
      </div>
    `;
  }

  if (completeButton) {
    completeButton.disabled = activeQuest.done;
  }
}

function generateQuest() {
  const text = BONUS_POOL[
    Math.floor(Math.random() * BONUS_POOL.length)
  ];

  activeQuest = { text, done: false };
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
  renderQuest();
  toast("Bonus quest complete · +25 XP");
}


/* =========================================
   FOCUS TIMER
========================================= */

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;

function updateTimerDisplay() {
  const display = first("#timer-display", "[data-timer-display]");
  if (!display) return;

  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const seconds = String(timerSeconds % 60).padStart(2, "0");

  display.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = null;
  timerRunning = false;
}

function startTimer() {
  if (timerRunning) return;

  timerRunning = true;

  setText(
    ["#timer-status", "[data-timer-status]"],
    "Focus session in progress…"
  );

  timerInterval = setInterval(() => {
    timerSeconds = Math.max(0, timerSeconds - 1);
    updateTimerDisplay();

    if (timerSeconds === 0) {
      stopTimer();

      state.focusSessions = (state.focusSessions || 0) + 1;

      save();
      checkAchievements();
      renderProgress();
      renderAnalytics();

      setText(
        ["#timer-status", "[data-timer-status]"],
        "Session complete. Take a break if you need one."
      );

      toast("Focus session complete!");
    }
  }, 1000);
}

function pauseTimer() {
  stopTimer();

  setText(
    ["#timer-status", "[data-timer-status]"],
    "Paused. Continue when ready."
  );
}

function resetTimer() {
  stopTimer();

  const duration = first("#timer-duration", "#timer-minutes");
  const minutes = duration ? Number(duration.value) : 25;

  timerSeconds = clamp(minutes || 25, 1, 180) * 60;

  updateTimerDisplay();

  setText(
    ["#timer-status", "[data-timer-status]"],
    "Ready when you are."
  );
}


/* =========================================
   SETTINGS: DATA BACKUP
========================================= */

function exportData() {
  const backup = {
    app: "DailyApp",
    version: 2,
    exportedAt: new Date().toISOString(),
    data: state
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

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

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.categories)
  ) {
    throw new Error("This file does not look like a DailyApp backup.");
  }

  const categories = data.categories.map((item) => ({
    id: String(item.id || uid()),
    name: String(item.name || "Category").slice(0, 30),
    xp: clamp(Number(item.xp) || 10, 1, 1000)
  }));

  if (!categories.length) {
    categories.push(...DEFAULT_CATEGORIES.map((item) => ({ ...item })));
  }

  const categoryIds = new Set(categories.map((item) => item.id));

  const tasks = data.tasks.map((task) => {
    const normalized = {
      ...task,
      id: String(task.id || uid()),
      text: String(task.text || "Task").slice(0, 100),
      created: /^\d{4}-\d{2}-\d{2}$/.test(task.created)
        ? task.created
        : todayKey(),
      done: Boolean(task.done),

      // Missing dates stay missing; they are not assigned a fake date.
      completedAt: /^\d{4}-\d{2}-\d{2}$/.test(task.completedAt)
        ? task.completedAt
        : null,

      category: categoryIds.has(String(task.category))
        ? String(task.category)
        : categories[0].id
    };

    return normalized;
  });

  return {
    version: 2,
    tasks,
    categories,

    dailyPlans:
      data.dailyPlans && typeof data.dailyPlans === "object"
        ? data.dailyPlans
        : {},

    bonusCompleted: Math.max(0, Number(data.bonusCompleted) || 0),
    focusSessions: Math.max(0, Number(data.focusSessions) || 0),

    unlocked: Array.isArray(data.unlocked)
      ? data.unlocked.filter((id) =>
          ACHIEVEMENTS.some((achievement) => achievement.id === id)
        )
      : []
  };
}

async function importData(file) {
  if (!file) return;

  try {
    const object = JSON.parse(await file.text());
    const nextState = validateBackup(object);

    if (
      !confirm(
        "Import this backup? Your current DailyApp data will be replaced."
      )
    ) {
      return;
    }

    state = nextState;
    activeQuest = null;

    save();
    ensureDailyTasks();
    renderQuest();
    renderAll();

    toast("Backup imported successfully.");
  } catch (error) {
    alert(error.message || "Could not import this file.");
  }
}

function resetAllData() {
  const confirmed = confirm(
    "Reset all DailyApp data? This cannot be undone unless you have a backup."
  );

  if (!confirmed) return;

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
  renderQuest();
  renderAll();

  toast("DailyApp data has been reset.");
}


/* =========================================
   CATEGORY MANAGEMENT
========================================= */

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

  if (
    state.categories.some(
      (item) => item.name.toLowerCase() === cleanName.toLowerCase()
    )
  ) {
    toast("That category already exists.");
    return;
  }

  state.categories.push({
    id: uid(),
    name: cleanName.slice(0, 30),
    xp
  });

  save();
  checkAchievements();
  renderAll();
  toast("Category created.");
}

function editCategoryXP(id) {
  const item = category(id);

  const input = prompt(
    `New XP reward for ${item.name} (1–1000):`,
    String(item.xp)
  );

  if (input === null) return;

  const xp = Number(input);

  if (!Number.isInteger(xp) || xp < 1 || xp > 1000) {
    toast("Enter a whole number from 1 to 1000.");
    return;
  }

  item.xp = xp;

  // Existing tasks keep their already assigned XP rewards.
  save();
  renderAll();
  toast("Category XP updated.");
}

function deleteCategory(id) {
  const item = category(id);

  if (DEFAULT_CATEGORIES.some((defaultItem) => defaultItem.id === id)) {
    toast("Default categories cannot be deleted.");
    return;
  }

  if (
    !confirm(
      `Delete category "${item.name}"? Existing tasks will move to Daily.`
    )
  ) {
    return;
  }

  state.tasks.forEach((task) => {
    if (task.category === id) {
      task.category = "daily";
    }
  });

  state.categories = state.categories.filter(
    (categoryItem) => categoryItem.id !== id
  );

  save();
  renderAll();
  toast("Category deleted.");
}


/* =========================================
   NAVIGATION
========================================= */

function go(view) {
  const requestedView = getView(view);

  if (!requestedView) {
    console.warn(`DailyApp view not found: view-${view}`);
    return;
  }

  $$(".view").forEach((element) => {
    element.classList.toggle("active", element === requestedView);
  });

  $$(".nav-item, [data-view]").forEach((button) => {
    if (button.closest(".bottom-nav, nav")) {
      button.classList.toggle("active", button.dataset.view === view);
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Refresh date-based content whenever its page is opened.
  if (view === "calendar") {
    renderCalendar();
    renderHeatmap();
    renderTaskLists();
  }

  if (view === "analytics") {
    renderAnalytics();
  }
}


/* =========================================
   RENDER EVERYTHING
========================================= */

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


/* =========================================
   EVENT LISTENERS
========================================= */

// Navigation, task actions, calendar, categories and accent swatches.
document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-view]");

  if (
    navButton &&
    navButton.closest(".bottom-nav, nav")
  ) {
    go(navButton.dataset.view);
    return;
  }

  const goButton = event.target.closest("[data-go]");

  if (goButton) {
    go(goButton.dataset.go);
    return;
  }

  const filterButton = event.target.closest("[data-filter]");

  if (filterButton) {
    currentFilter = filterButton.dataset.filter;

    $$("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
    });

    renderTaskLists();
    return;
  }

  const toggleButton = event.target.closest("[data-toggle]");

  if (toggleButton) {
    toggleTask(toggleButton.dataset.toggle);
    return;
  }

  const deleteButton = event.target.closest("[data-delete]");

  if (deleteButton) {
    deleteTask(deleteButton.dataset.delete);
    return;
  }

  const dayButton = event.target.closest("[data-date]");

  if (dayButton) {
    selectedDate = dayButton.dataset.date;
    renderCalendar();
    renderTaskLists();
    return;
  }

  const previousMonth = event.target.closest(
    "#prev-month, [data-calendar-prev]"
  );

  if (previousMonth) {
    calendarCursor = new Date(
      calendarCursor.getFullYear(),
      calendarCursor.getMonth() - 1,
      1
    );

    renderCalendar();
    return;
  }

  const nextMonth = event.target.closest(
    "#next-month, [data-calendar-next]"
  );

  if (nextMonth) {
    calendarCursor = new Date(
      calendarCursor.getFullYear(),
      calendarCursor.getMonth() + 1,
      1
    );

    renderCalendar();
    return;
  }

  const editCategory = event.target.closest("[data-edit-cat]");

  if (editCategory) {
    editCategoryXP(editCategory.dataset.editCat);
    return;
  }

  const removeCategory = event.target.closest("[data-delete-cat]");

  if (removeCategory) {
    deleteCategory(removeCategory.dataset.deleteCat);
    return;
  }

  const accentButton = event.target.closest("[data-accent]");

  if (accentButton && ACCENTS[accentButton.dataset.accent]) {
    appearance.accent = accentButton.dataset.accent;
    saveAppearance();
    toast("Accent color updated.");
  }
});


// Add tasks.
document.addEventListener("submit", (event) => {
  const form = event.target;

  if (
    form.matches("#task-form, [data-task-form]")
  ) {
    event.preventDefault();

    const input = first("#task-input", "#new-task", "[name='task']");
    const categorySelect = first(
      "#task-category",
      "#task-category-select",
      "[data-task-category]"
    );

    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    createTask(text, categorySelect?.value || "daily");
    input.value = "";
    input.focus();
    return;
  }

  if (
    form.matches("#category-form, [data-category-form]")
  ) {
    event.preventDefault();

    const nameInput = first("#category-name", "[name='category-name']");
    const xpInput = first("#category-xp", "[name='category-xp']");

    if (!nameInput || !xpInput) return;

    addCategory(nameInput.value, Number(xpInput.value));
    nameInput.value = "";
  }
});


// Theme selector.
document.addEventListener("change", (event) => {
  if (
    event.target.matches("#theme-select, #theme-picker")
  ) {
    const value = event.target.value;

    if (["dark", "light", "auto"].includes(value)) {
      appearance.theme = value;
      saveAppearance();
      toast("Theme updated.");
    }
  }

  if (
    event.target.matches("#timer-duration, #timer-minutes")
  ) {
    resetTimer();
  }
});


// Timer controls.
document.addEventListener("click", (event) => {
  if (event.target.closest("#timer-start, [data-timer-start]")) {
    startTimer();
  }

  if (event.target.closest("#timer-pause, [data-timer-pause]")) {
    pauseTimer();
  }

  if (event.target.closest("#timer-reset, [data-timer-reset]")) {
    resetTimer();
  }

  if (event.target.closest("#new-quest, [data-new-quest]")) {
    generateQuest();
  }

  if (event.target.closest("#complete-quest, [data-complete-quest]")) {
    completeQuest();
  }

  if (event.target.closest("#export-data, [data-export-data]")) {
    exportData();
  }

  if (event.target.closest("#import-data, [data-import-data]")) {
    first("#import-file", "#import-backup")?.click();
  }

  if (event.target.closest("#reset-data, [data-reset-data]")) {
    resetAllData();
  }
});


// Import a selected JSON backup.
document.addEventListener("change", async (event) => {
  if (!event.target.matches("#import-file, #import-backup")) {
    return;
  }

  const file = event.target.files?.[0];

  if (!file) return;

  await importData(file);

  event.target.value = "";
});


/* =========================================
   INITIALIZATION
========================================= */

applyAppearance();
ensureDailyTasks();
checkAchievements();
renderAll();

window.addEventListener("pageshow", () => {
  renderHome();
  renderCalendar();
  renderHeatmap();
});
```
