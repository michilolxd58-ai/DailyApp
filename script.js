/* DailyApp 3.0 — Command Center + Coin Economy */
(function () {
  "use strict";

  var STORAGE_KEY = "dailyapp-midnight-v1";
  var SETTINGS_KEY = "dailyapp-appearance-v1";
  var DAILY_COINS = 50;
  var MAX_COINS = 100000000;
  var MAX_REWARD_COST = 10000;

  var DEFAULT_CATEGORIES = [
    { id: "daily", name: "Daily", xp: 10 },
    { id: "school", name: "School", xp: 20 },
    { id: "training", name: "Training", xp: 30 },
    { id: "challenge", name: "Challenge", xp: 50 }
  ];

  var TASK_POOL = [
    "Make your bed", "Drink a glass of water",
    "Read for 10 minutes", "Tidy your desk for 5 minutes",
    "Take a short walk", "Stretch for 5 minutes",
    "Write down your top priority", "Review your notes",
    "Prepare your bag for tomorrow",
    "Learn one new coding concept", "Finish a small school task",
    "Put your phone away for 20 minutes",
    "Plan tomorrow's first task", "Clean one small area",
    "Practice a skill for 15 minutes",
    "Spend 10 minutes learning something"
  ];

  var DEFAULT_REWARDS = [
    {
      id: "gaming30",
      name: "Gaming Time",
      description: "30 Minuten geplante Gaming-Freizeit.",
      minutes: 30, cost: 60, icon: "🎮"
    },
    {
      id: "chill60",
      name: "Chill Mode",
      description: "60 Minuten frei verfügbare Freizeit.",
      minutes: 60, cost: 100, icon: "🌙"
    },
    {
      id: "break90",
      name: "Long Break",
      description: "90 Minuten bewusst eingeplante Freizeit.",
      minutes: 90, cost: 140, icon: "🧘"
    }
  ];

  var ACCENTS = {
    toxic: ["#b6ff00", "182,255,0"],
    mint: ["#63e6b0", "99,230,176"],
    blue: ["#73b7ff", "115,183,255"],
    purple: ["#b69cff", "182,156,255"],
    pink: ["#ff8bc2", "255,139,194"],
    orange: ["#ffb86b", "255,184,107"],
    red: ["#ff7788", "255,119,136"],
    cyan: ["#5de2e7", "93,226,231"],
    yellow: ["#f1d66d", "241,214,109"],
    lime: ["#b7e66d", "183,230,109"],
    white: ["#d9e4f5", "217,228,245"]
  };

  var state;
  var appearance;
  var currentFilter = "all";
  var calendarCursor = new Date();
  var selectedDate = dateKey(new Date());
  var timerSeconds = 25 * 60;
  var timerInterval = null;
  var timerRunning = false;
  var toastTimer = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.prototype.slice.call(
      document.querySelectorAll(selector)
    );
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return date.getFullYear() + "-" +
      pad(date.getMonth() + 1) + "-" +
      pad(date.getDate());
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function parseDate(key) {
    var parts = String(key).split("-");
    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
  }

  function shiftDate(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function makeId() {
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
  }

  function isDateKey(value) {
    if (typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    var date = parseDate(value);
    return !isNaN(date.getTime()) &&
      dateKey(date) === value;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function setText(selector, value) {
    var el = $(selector);
    if (el) el.textContent = String(value);
  }

  function setWidth(selector, value) {
    var el = $(selector);
    if (el) {
      el.style.width =
        Math.max(0, Math.min(100, Number(value) || 0)) + "%";
    }
  }

  function toast(message) {
    var el = $("#toast");

    if (!el) {
      console.log(message);
      return;
    }

    el.textContent = message;
    el.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2600);
  }

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clampNumber(value, min, max, fallback) {
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;

    return Math.max(min, Math.min(max, number));
  }

  function defaultState() {
    return {
      version: 3,
      tasks: [],
      categories: copy(DEFAULT_CATEGORIES),
      dailyPlans: {},
      bonusCompleted: 0,
      focusSessions: 0,
      unlocked: [],
      achievementRewardsClaimed: [],
      coins: 0,
      lastDailyRewardDate: "",
      coinTransactions: [],
      rewards: copy(DEFAULT_REWARDS),
      shopHistory: []
    };
  }

  function normalizeTask(task, categoryIds, fallbackCategory) {
    var item = {
      id: String(task.id || makeId()).slice(0, 100),
      text: String(task.text || "Task").slice(0, 120),
      created: isDateKey(task.created) ? task.created : todayKey(),
      done: Boolean(task.done),
      completedAt: isDateKey(task.completedAt)
        ? task.completedAt
        : null,
      category: categoryIds.indexOf(
        String(task.category || "daily")
      ) >= 0
        ? String(task.category || "daily")
        : fallbackCategory,
      kind: String(task.kind || "custom").slice(0, 30)
    };

    if (isDateKey(task.day)) item.day = task.day;

    if (task.xpReward !== undefined &&
        Number.isFinite(Number(task.xpReward))) {
      item.xpReward = clampNumber(task.xpReward, 0, 1000, 10);
    }

    if (task.coinReward !== undefined &&
        Number.isFinite(Number(task.coinReward))) {
      item.coinReward = clampNumber(task.coinReward, 0, 1000, 0);
    }

    item.rewardClaimed = task.rewardClaimed === undefined
      ? Boolean(task.done)
      : Boolean(task.rewardClaimed);

    return item;
  }

  function normalizeReward(reward) {
    if (!reward || typeof reward !== "object") return null;

    var id = String(reward.id || makeId()).slice(0, 100);
    var name = String(reward.name || "").trim().slice(0, 50);

    if (!name) return null;

    return {
      id: id,
      name: name,
      description: String(
        reward.description || "Eigene Freizeit-Belohnung"
      ).slice(0, 160),
      minutes: clampNumber(reward.minutes, 5, 480, 30),
      cost: clampNumber(reward.cost, 1, MAX_REWARD_COST, 60),
      icon: String(reward.icon || "✨").slice(0, 8),
      custom: Boolean(reward.custom)
    };
  }

  function normalizeTransaction(item) {
    if (!item || typeof item !== "object") return null;

    var amount = Number(item.amount);

    if (!Number.isFinite(amount) ||
        Math.abs(amount) > MAX_COINS) {
      return null;
    }

    return {
      id: String(item.id || makeId()).slice(0, 100),
      type: String(item.type || "unknown").slice(0, 30),
      amount: Math.trunc(amount),
      description: String(item.description || "").slice(0, 160),
      date: isDateKey(item.date) ? item.date : todayKey(),
      createdAt: String(item.createdAt || "").slice(0, 40)
    };
  }

  function loadState() {
    var raw;

    try {
      raw = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );
    } catch (error) {
      console.warn("Could not load DailyApp data:", error);
      return defaultState();
    }

    if (!raw || typeof raw !== "object") {
      return defaultState();
    }

    var categories =
      Array.isArray(raw.categories) && raw.categories.length
        ? raw.categories
        : copy(DEFAULT_CATEGORIES);

    categories = categories
      .filter(function (item) {
        return item && typeof item === "object";
      })
      .slice(0, 50)
      .map(function (item) {
        return {
          id: String(item.id || makeId()).slice(0, 100),
          name: String(item.name || "Category").slice(0, 30),
          xp: clampNumber(item.xp, 1, 1000, 10)
        };
      });

    if (!categories.length) {
      categories = copy(DEFAULT_CATEGORIES);
    }

    var categoryIds = categories.map(function (item) {
      return item.id;
    });

    var tasks = Array.isArray(raw.tasks) ? raw.tasks : [];

    tasks = tasks
      .filter(function (task) {
        return task && typeof task === "object";
      })
      .slice(0, 10000)
      .map(function (task) {
        return normalizeTask(task, categoryIds, categories[0].id);
      });

    var plans = {};

    if (raw.dailyPlans && typeof raw.dailyPlans === "object") {
      Object.keys(raw.dailyPlans).slice(-500).forEach(function (key) {
        var plan = raw.dailyPlans[key];

        if (!isDateKey(key) ||
            !plan ||
            typeof plan !== "object" ||
            !Array.isArray(plan.taskTexts)) {
          return;
        }

        plans[key] = {
          goal: clampNumber(plan.goal, 0, 10000, 80),
          taskTexts: plan.taskTexts
            .filter(function (text) {
              return typeof text === "string";
            })
            .slice(0, 10)
            .map(function (text) {
              return text.slice(0, 120);
            })
        };
      });
    }

    var rewards = Array.isArray(raw.rewards)
      ? raw.rewards.map(normalizeReward).filter(Boolean).slice(0, 100)
      : copy(DEFAULT_REWARDS);

    if (!rewards.length) rewards = copy(DEFAULT_REWARDS);

    var transactions = Array.isArray(raw.coinTransactions)
      ? raw.coinTransactions
          .map(normalizeTransaction)
          .filter(Boolean)
          .slice(-500)
      : [];

    var history = Array.isArray(raw.shopHistory)
      ? raw.shopHistory
          .filter(function (item) {
            return item && typeof item === "object";
          })
          .slice(-200)
          .map(function (item) {
            return {
              id: String(item.id || makeId()).slice(0, 100),
              rewardId: String(item.rewardId || "").slice(0, 100),
              name: String(item.name || "Reward").slice(0, 80),
              minutes: clampNumber(item.minutes, 0, 480, 0),
              cost: clampNumber(item.cost, 0, MAX_REWARD_COST, 0),
              date: isDateKey(item.date) ? item.date : todayKey(),
              createdAt: String(item.createdAt || "").slice(0, 40)
            };
          })
      : [];

    return {
      version: 3,
      tasks: tasks,
      categories: categories,
      dailyPlans: plans,
      bonusCompleted: clampNumber(raw.bonusCompleted, 0, 1000000, 0),
      focusSessions: clampNumber(raw.focusSessions, 0, 1000000, 0),
      unlocked: Array.isArray(raw.unlocked)
        ? raw.unlocked.filter(function (id) {
            return typeof id === "string";
          }).slice(0, 100)
        : [],
      achievementRewardsClaimed:
        Array.isArray(raw.achievementRewardsClaimed)
          ? raw.achievementRewardsClaimed.filter(function (id) {
              return typeof id === "string";
            }).slice(0, 100)
          : (Array.isArray(raw.unlocked) ? raw.unlocked.slice(0, 100) : []),
      coins: clampNumber(raw.coins, 0, MAX_COINS, 0),
      lastDailyRewardDate: isDateKey(raw.lastDailyRewardDate)
        ? raw.lastDailyRewardDate
        : "",
      coinTransactions: transactions,
      rewards: rewards,
      shopHistory: history
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save DailyApp data:", error);
      toast("Daten konnten nicht gespeichert werden.");
    }
  }

  function loadAppearance() {
    try {
      var saved = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || "null"
      );

      if (saved && typeof saved === "object") {
        return {
          theme: ["dark", "light", "system", "auto"].indexOf(
            saved.theme
          ) >= 0 ? saved.theme : "dark",
          accent: saved.accent === "mint"
            ? "toxic"
            : (
              Object.prototype.hasOwnProperty.call(ACCENTS, saved.accent)
                ? saved.accent
                : "toxic"
            )
        };
      }
    } catch (error) {
      // Use defaults.
    }

    return { theme: "dark", accent: "toxic" };
  }

  function actualTheme() {
    if (appearance.theme === "system" ||
        appearance.theme === "auto") {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }

    return appearance.theme;
  }

  function applyAppearance() {
    var root = document.documentElement;
    var accent = ACCENTS[appearance.accent] || ACCENTS.toxic;

    root.setAttribute("data-theme", actualTheme());
    root.setAttribute("data-accent", appearance.accent);

    root.style.setProperty("--accent", accent[0]);
    root.style.setProperty("--accent-rgb", accent[1]);
    root.style.setProperty("--toxic", accent[0]);
    root.style.setProperty("--toxic-bright", accent[0]);
    root.style.setProperty("--toxic-rgb", accent[1]);
    root.style.setProperty("--border", "rgba(" + accent[1] + ", .20)");

    var themeColor = $("#theme-color");
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        actualTheme() === "dark" ? "#050605" : "#f4f6f3"
      );
    }

    var themeSelect = $("#theme-select");
    if (themeSelect) {
      themeSelect.value =
        appearance.theme === "auto" ? "system" : appearance.theme;
    }

    var accentContainer = $("#accent-options");

    if (accentContainer &&
        !accentContainer.getAttribute("data-built")) {
      accentContainer.innerHTML =
        Object.keys(ACCENTS).map(function (name) {
          return (
            '<button type="button" class="accent-swatch" ' +
            'data-accent="' + name + '" ' +
            'aria-label="' + name + ' accent color" ' +
            'title="' + name + '" ' +
            'style="background:' + ACCENTS[name][0] + '"></button>'
          );
        }).join("");

      accentContainer.setAttribute("data-built", "yes");
    }

    $$("#accent-options button[data-accent]").forEach(function (button) {
      var selected =
        button.getAttribute("data-accent") === appearance.accent;

      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function saveAppearance() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(appearance));
    } catch (error) {
      console.warn("Could not save settings:", error);
    }

    applyAppearance();
  }

  function getCategory(id) {
    return state.categories.find(function (item) {
      return item.id === id;
    }) || state.categories[0] || DEFAULT_CATEGORIES[0];
  }

  function taskXP(task) {
    if (task.xpReward !== undefined &&
        Number.isFinite(Number(task.xpReward))) {
      return clampNumber(task.xpReward, 0, 1000, 0);
    }

    return getCategory(task.category).xp;
  }

  function taskCoins(task) {
    if (task.coinReward !== undefined &&
        Number.isFinite(Number(task.coinReward))) {
      return clampNumber(task.coinReward, 0, 1000, 0);
    }

    return Math.max(1, Math.min(25, Math.ceil(taskXP(task) / 2)));
  }

  function completedTasks() {
    return state.tasks.filter(function (task) {
      return task.done;
    });
  }

  function totalXP() {
    return completedTasks().reduce(function (sum, task) {
      return sum + taskXP(task);
    }, 0);
  }

  function levelInfo(xp) {
    var safe = Math.max(0, xp);

    return {
      level: Math.floor(safe / 100) + 1,
      inside: safe % 100
    };
  }

  function addCoins(amount, type, description) {
    amount = Math.trunc(Number(amount));

    if (!Number.isFinite(amount) || amount <= 0) return false;

    var credited = Math.min(amount, MAX_COINS - state.coins);

    if (credited <= 0) {
      toast("Dein Coin-Limit ist erreicht.");
      return false;
    }

    state.coins += credited;

    state.coinTransactions.push({
      id: makeId(),
      type: String(type || "reward"),
      amount: credited,
      description: String(description || "Coins erhalten").slice(0, 160),
      date: todayKey(),
      createdAt: new Date().toISOString()
    });

    state.coinTransactions = state.coinTransactions.slice(-500);
    return true;
  }

  function awardDailyCoins() {
    var today = todayKey();

    if (state.lastDailyRewardDate === today) return false;

    state.lastDailyRewardDate = today;
    var added = addCoins(
      DAILY_COINS,
      "daily-bonus",
      "Täglicher Login-Bonus"
    );

    save();

    if (added) toast("Tagesbonus: +" + DAILY_COINS + " Coins!");

    return added;
  }

  function getPlan(day) {
    day = day || todayKey();

    var plan = state.dailyPlans[day];

    if (!plan ||
        typeof plan !== "object" ||
        !Array.isArray(plan.taskTexts) ||
        !plan.taskTexts.length) {
      var pool = TASK_POOL.slice();
      var chosen = [];
      var amount = 4 + Math.floor(Math.random() * 2);

      while (chosen.length < amount && pool.length) {
        chosen.push(
          pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
        );
      }

      var goals = [60, 70, 80, 90, 100, 110, 120, 140];

      plan = {
        goal: goals[Math.floor(Math.random() * goals.length)],
        taskTexts: chosen
      };

      state.dailyPlans[day] = plan;
      save();
    }

    return plan;
  }

  function ensureDailyTasks(day) {
    day = day || todayKey();

    getPlan(day).taskTexts.forEach(function (text) {
      var exists = state.tasks.some(function (task) {
        return task.kind === "daily-plan" &&
          task.day === day &&
          task.text === text;
      });

      if (!exists) {
        state.tasks.push({
          id: makeId(),
          text: text,
          created: day,
          done: false,
          completedAt: null,
          category: "daily",
          kind: "daily-plan",
          day: day,
          xpReward: 10,
          coinReward: 5,
          rewardClaimed: false
        });
      }
    });

    save();
  }

  function tasksForToday() {
    var today = todayKey();

    return state.tasks.filter(function (task) {
      return task.created === today ||
        (task.kind === "daily-plan" && task.day === today);
    });
  }

  function streakInfo() {
    var days = {};

    completedTasks().forEach(function (task) {
      if (task.completedAt) days[task.completedAt] = true;
    });

    var date = new Date();
    var key = dateKey(date);

    if (!days[key]) {
      date = shiftDate(date, -1);
      key = dateKey(date);
    }

    var current = 0;

    while (days[key]) {
      current++;
      date = shiftDate(date, -1);
      key = dateKey(date);
    }

    var sorted = Object.keys(days).sort();
    var best = 0;
    var run = 0;
    var previous = null;

    sorted.forEach(function (day) {
      var parsed = parseDate(day);

      if (previous) {
        var diff = Math.round(
          (parsed.getTime() - previous.getTime()) / 86400000
        );

        run = diff === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }

      best = Math.max(best, run);
      previous = parsed;
    });

    return { current: current, best: best };
  }

  function weekKeys(reference) {
    var start = new Date(reference || new Date());

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    var result = [];

    for (var i = 0; i < 7; i++) {
      result.push(dateKey(shiftDate(start, i)));
    }

    return result;
  }

  function countDoneBetween(start, end) {
    return state.tasks.filter(function (task) {
      return task.done && task.completedAt &&
        task.completedAt >= start && task.completedAt <= end;
    }).length;
  }

  function xpBetween(start, end) {
    return state.tasks.filter(function (task) {
      return task.done && task.completedAt &&
        task.completedAt >= start && task.completedAt <= end;
    }).reduce(function (sum, task) {
      return sum + taskXP(task);
    }, 0);
  }

  function taskHTML(task, allowDelete) {
    var cat = getCategory(task.category);

    var status = task.done
      ? (task.completedAt ? "Erledigt " + task.completedAt : "Erledigt")
      : (task.created === todayKey()
          ? "Heute hinzugefügt"
          : "Hinzugefügt " + task.created);

    var html =
      '<article class="task-card ' + (task.done ? "done" : "") + '">';

    html +=
      '<button type="button" class="task-check" ' +
      'data-toggle="' + escapeHTML(task.id) + '" ' +
      'aria-label="' + (task.done ? "Wieder öffnen" : "Aufgabe erledigen") +
      '" aria-pressed="' + String(task.done) + '">' +
      (task.done ? "✓" : "") + '</button>';

    html +=
      '<div class="task-copy">' +
      '<div class="task-title">' + escapeHTML(task.text) + '</div>' +
      '<div class="task-sub">' + escapeHTML(cat.name) + ' · ' +
      escapeHTML(status) + '</div></div>';

    html += '<span class="task-xp">+' + taskXP(task) + ' XP</span>';

    if (allowDelete) {
      html +=
        '<button type="button" class="delete-task" ' +
        'data-delete="' + escapeHTML(task.id) + '" ' +
        'aria-label="Aufgabe löschen">×</button>';
    }

    return html + '</article>';
  }

  function renderHome() {
    var tasks = tasksForToday();

    var done = tasks.filter(function (task) {
      return task.done;
    }).length;

    var percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    var level = levelInfo(totalXP());
    var dateEl = $("#home-date");

    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString(
        "de-AT",
        { day: "numeric", month: "short" }
      );
    }

    setText(
      "#today-label",
      "DEIN TAG · " +
      new Date().toLocaleDateString(
        "de-AT",
        { weekday: "long" }
      ).toUpperCase()
    );

    setText("#daily-progress-text", done + " von " + tasks.length + " erledigt");
    setText("#daily-progress-percent", percent + "%");
    setWidth("#daily-progress-fill", percent);
    setText("#home-xp", totalXP());
    setText("#home-level", "Level " + level.level);
    setText("#home-streak", streakInfo().current + " Tage");
    setText("#home-coins", state.coins);
    setText("#daily-coin-bonus",
      state.lastDailyRewardDate === todayKey()
        ? "✓ Heute erhalten"
        : "+50 Coins verfügbar");

    var homeList = $("#home-tasks");

    if (homeList) {
      homeList.innerHTML = tasks.length
        ? tasks.slice(0, 5).map(function (task) {
            return taskHTML(task, false);
          }).join("")
        : '<div class="empty-state">Keine Aufgaben für heute.</div>';
    }
  }

  function renderTaskList() {
    var list = $("#task-lists");
    if (!list) return;

    var tasks = state.tasks.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return String(b.created).localeCompare(String(a.created));
    }).filter(function (task) {
      if (currentFilter === "open") return !task.done;
      if (currentFilter === "done") return task.done;
      return true;
    });

    list.innerHTML = tasks.length
      ? tasks.map(function (task) {
          return taskHTML(task, true);
        }).join("")
      : '<div class="empty-state">Keine Aufgaben in dieser Ansicht. Erstelle oben eine neue Aufgabe.</div>';
  }

  function renderCategories() {
    var select = $("#task-category");

    if (select) {
      var previous = select.value;

      select.innerHTML = state.categories.map(function (item) {
        return '<option value="' + escapeHTML(item.id) + '">' +
          escapeHTML(item.name) + ' · ' + item.xp + ' XP</option>';
      }).join("");

      if (state.categories.some(function (item) {
        return item.id === previous;
      })) {
        select.value = previous;
      }
    }

    var list = $("#category-list");

    if (list) {
      list.innerHTML = state.categories.map(function (item) {
        var isDefault = DEFAULT_CATEGORIES.some(function (base) {
          return base.id === item.id;
        });

        return '<div class="category-row"><div><strong>' +
          escapeHTML(item.name) + '</strong><small>' +
          item.xp + ' XP pro Aufgabe</small></div>' +
          (isDefault ? "" :
            '<button type="button" class="delete-task" data-delete-cat="' +
            escapeHTML(item.id) +
            '" aria-label="Kategorie löschen">×</button>') +
          '</div>';
      }).join("");
    }
  }

  function renderCalendar() {
    var label = $("#calendar-month");

    if (label) {
      label.textContent = calendarCursor.toLocaleDateString(
        "de-AT",
        { month: "long", year: "numeric" }
      );
    }

    var grid = $("#calendar-days");

    if (grid) {
      var year = calendarCursor.getFullYear();
      var month = calendarCursor.getMonth();
      var offset = (new Date(year, month, 1).getDay() + 6) % 7;
      var numberDays = new Date(year, month + 1, 0).getDate();
      var html = "";

      for (var i = 0; i < offset; i++) {
        html += '<span aria-hidden="true"></span>';
      }

      for (var day = 1; day <= numberDays; day++) {
        var key = dateKey(new Date(year, month, day));

        var has = state.tasks.some(function (task) {
          return task.created === key || task.completedAt === key;
        });

        var classes = "calendar-day" +
          (key === todayKey() ? " today" : "") +
          (key === selectedDate ? " selected" : "") +
          (has ? " has-activity" : "");

        html += '<button type="button" class="' + classes +
          '" data-date="' + key + '" aria-pressed="' +
          String(key === selectedDate) + '">' + day + '</button>';
      }

      grid.innerHTML = html;
    }

    var title = $("#selected-date-title");

    if (title) {
      title.textContent = parseDate(selectedDate).toLocaleDateString(
        "de-AT",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
    }

    var dayList = $("#calendar-tasks");

    if (dayList) {
      var selected = state.tasks.filter(function (task) {
        return task.created === selectedDate ||
          task.completedAt === selectedDate;
      });

      dayList.innerHTML = selected.length
        ? selected.map(function (task) {
            return taskHTML(task, false);
          }).join("")
        : '<div class="empty-state">Für diesen Tag sind keine Aufgaben gespeichert.</div>';
    }
  }

  function renderHeatmap() {
    var grid = $("#activity-heatmap");
    if (!grid) return;

    var counts = {};

    completedTasks().forEach(function (task) {
      if (task.completedAt) {
        counts[task.completedAt] = (counts[task.completedAt] || 0) + 1;
      }
    });

    var today = parseDate(todayKey());
    var start = shiftDate(today, -363);

    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    var html = "";
    var total = 371;

    for (var i = 0; i < total; i++) {
      var date = shiftDate(start, i);
      var key = dateKey(date);
      var count = counts[key] || 0;

      var level = count === 0 ? 0
        : count === 1 ? 1
        : count === 2 ? 2
        : count <= 4 ? 3
        : 4;

      if (date > today) level = 0;

      html += '<div class="heat-cell heat-' + level +
        '" title="' + key + ': ' + count +
        ' erledigte Aufgabe(n)" aria-label="' +
        key + ': ' + count + '"></div>';
    }

    grid.innerHTML = html;

    var monthEl = $("#heatmap-months");

    if (monthEl) {
      var labels = [];
      var lastMonth = -1;

      for (var j = 0; j < total; j++) {
        var d = shiftDate(start, j);

        if (d.getMonth() !== lastMonth) {
          labels.push(d.toLocaleDateString("de-AT", { month: "short" }));
          lastMonth = d.getMonth();
        }
      }

      monthEl.innerHTML = labels.map(function (name) {
        return "<span>" + escapeHTML(name) + "</span>";
      }).join("");
    }

    var summary = $("#heatmap-summary");

    if (summary) {
      summary.textContent = completedTasks().filter(function (task) {
        return task.completedAt &&
          task.completedAt >= dateKey(shiftDate(today, -364));
      }).length + " Aufgaben in den letzten 12 Monaten erledigt.";
    }
  }

  function renderProgress() {
    var xp = totalXP();
    var info = levelInfo(xp);
    var done = completedTasks().length;
    var total = state.tasks.length;
    var streak = streakInfo();

    setText("#progress-level", "Level " + info.level);
    setText("#level-orb", info.level);
    setText(
      "#progress-title",
      info.level < 3 ? "Getting started" :
        info.level < 6 ? "Building momentum" :
          "Consistency builder"
    );
    setWidth("#level-progress-fill", info.inside);
    setText("#level-xp-text", info.inside + " / 100 XP");
    setText("#level-next",
      (100 - info.inside) + " XP bis Level " + (info.level + 1));
    setText("#progress-done", done);
    setText("#progress-rate",
      (total ? Math.round(done / total * 100) : 0) + "%");
    setText("#progress-focus", state.focusSessions || 0);

    if (!Array.isArray(state.unlocked)) state.unlocked = [];
    if (!Array.isArray(state.achievementRewardsClaimed)) {
      state.achievementRewardsClaimed = state.unlocked.slice();
    }

    var finished = completedTasks();
    var customCategories = state.categories.filter(function (cat) {
      return !DEFAULT_CATEGORIES.some(function (base) {
        return base.id === cat.id;
      });
    });

    var earnedCoins = state.coinTransactions.reduce(function (sum, tx) {
      return sum + Math.max(0, Number(tx.amount) || 0);
    }, 0);

    var activeDays = {};
    finished.forEach(function (task) {
      if (task.completedAt) activeDays[task.completedAt] = true;
    });

    var weekendCount = finished.filter(function (task) {
      if (!task.completedAt) return false;
      var day = parseDate(task.completedAt).getDay();
      return day === 0 || day === 6;
    }).length;

    var categoriesUsed = DEFAULT_CATEGORIES.filter(function (cat) {
      return finished.some(function (task) {
        return task.category === cat.id;
      });
    }).length;

    var todayTasks = tasksForToday();
    var todayDone = todayTasks.filter(function (task) {
      return task.done;
    }).length;

    var dailyDone = finished.filter(function (task) {
      return task.kind === "daily-plan";
    }).length;

    var achievements = [];

    function addAchievement(item) {
      item.progress = Math.max(0, Number(item.progress) || 0);
      item.target = Math.max(1, Number(item.target) || 1);
      item.reward = Math.max(0, Number(item.reward) || 0);
      item.done = item.done === true || item.progress >= item.target;
      item.secret = item.secret === true;
      item.rarity = item.rarity || "common";
      achievements.push(item);
    }

    function addMilestones(config) {
      config.targets.forEach(function (target, index) {
        var id = config.prefix + target;

        if (config.prefix === "tasks-" && target === 1) id = "first";
        if (config.prefix === "tasks-" && target === 5) id = "five";
        if (config.prefix === "tasks-" && target === 25) id = "twentyfive";
        if (config.prefix === "tasks-" && target === 100) id = "hundred";
        if (config.prefix === "xp-" && target === 100) id = "xp100";
        if (config.prefix === "xp-" && target === 1000) id = "xp1000";
        if (config.prefix === "streak-" && target === 3) id = "streak3";
        if (config.prefix === "streak-" && target === 7) id = "streak7";
        if (config.prefix === "focus-" && target === 1) id = "focus";
        if (config.prefix === "category-" && target === 1) id = "category";

        var rarity = index >= 12 ? "legendary"
          : index >= 9 ? "epic"
          : index >= 5 ? "rare"
          : index >= 2 ? "uncommon"
          : "common";

        addAchievement({
          id: id,
          icon: config.icon,
          name: config.name(target),
          desc: config.description(target),
          progress: config.value(),
          target: target,
          rarity: rarity,
          reward: config.rewards[index] ||
            (index >= 12 ? 1000 : index >= 9 ? 500 :
              index >= 5 ? 200 : index >= 2 ? 75 : 25)
        });
      });
    }

    addMilestones({
      prefix: "tasks-",
      icon: "🏆",
      targets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500,
        5000, 10000, 25000, 50000, 100000],
      value: function () { return done; },
      name: function (n) {
        return n === 1 ? "First Step" : n.toLocaleString("de-AT") + " Tasks";
      },
      description: function (n) {
        return "Erledige " + n.toLocaleString("de-AT") + " Aufgaben.";
      },
      rewards: [10, 20, 30, 50, 75, 100, 150, 250, 400, 600,
        800, 1000, 1500, 2000, 2500]
    });

    addMilestones({
      prefix: "xp-",
      icon: "✨",
      targets: [100, 250, 500, 1000, 2500, 5000, 10000, 25000,
        50000, 100000, 250000, 500000, 1000000, 2500000, 5000000],
      value: function () { return xp; },
      name: function (n) { return n.toLocaleString("de-AT") + " XP"; },
      description: function (n) {
        return "Sammle insgesamt " + n.toLocaleString("de-AT") + " XP.";
      }
    });

    addMilestones({
      prefix: "streak-",
      icon: "🔥",
      targets: [2, 3, 5, 7, 10, 14, 21, 30, 60, 100],
      value: function () { return streak.best; },
      name: function (n) { return n + "-Day Streak"; },
      description: function (n) {
        return "Erreiche eine Serie von " + n + " aktiven Tagen.";
      }
    });

    addMilestones({
      prefix: "focus-",
      icon: "⏱️",
      targets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500],
      value: function () { return state.focusSessions || 0; },
      name: function (n) { return n + " Focus Sessions"; },
      description: function (n) {
        return "Schließe " + n + " Fokus-Sessions ab.";
      }
    });

    addMilestones({
      prefix: "coins-",
      icon: "🪙",
      targets: [100, 500, 1000, 2500, 5000, 10000, 25000,
        50000, 100000, 1000000],
      value: function () { return earnedCoins; },
      name: function (n) {
        return n.toLocaleString("de-AT") + " Coins Earned";
      },
      description: function (n) {
        return "Verdiene insgesamt " + n.toLocaleString("de-AT") + " Coins.";
      }
    });

    addMilestones({
      prefix: "shop-",
      icon: "🎁",
      targets: [1, 3, 5, 10, 25, 50, 100, 250, 500, 1000],
      value: function () { return state.shopHistory.length; },
      name: function (n) { return n + " Shop Rewards"; },
      description: function (n) {
        return "Löse " + n + " Rewards im Shop ein.";
      }
    });

    addMilestones({
      prefix: "category-",
      icon: "🛠️",
      targets: [1, 2, 3, 5, 10, 15, 20, 25, 30, 40],
      value: function () { return customCategories.length; },
      name: function (n) { return n + " Custom Categories"; },
      description: function (n) {
        return "Erstelle " + n + " eigene Kategorien.";
      }
    });

    addMilestones({
      prefix: "dailyplan-",
      icon: "📅",
      targets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500],
      value: function () { return dailyDone; },
      name: function (n) { return n + " Daily Tasks"; },
      description: function (n) {
        return "Erledige " + n + " Aufgaben aus deinem Tagesplan.";
      }
    });

    [
      {
        id: "special-perfect-day",
        icon: "🌟",
        name: "Perfect Day",
        desc: "Erledige alle heutigen Aufgaben.",
        progress: todayTasks.length > 0 && todayDone === todayTasks.length ? 1 : 0,
        target: 1, reward: 150, rarity: "epic"
      },
      {
        id: "special-active-days",
        icon: "🗓️",
        name: "Active Week",
        desc: "Sei an mindestens 7 verschiedenen Tagen aktiv.",
        progress: Object.keys(activeDays).length,
        target: 7, reward: 100, rarity: "rare"
      },
      {
        id: "special-weekend",
        icon: "🌈",
        name: "Weekend Warrior",
        desc: "Erledige 10 Aufgaben am Wochenende.",
        progress: weekendCount,
        target: 10, reward: 200, rarity: "epic"
      },
      {
        id: "special-all-categories",
        icon: "🧠",
        name: "All-Rounder",
        desc: "Erledige Aufgaben in allen vier Standard-Kategorien.",
        progress: categoriesUsed,
        target: 4, reward: 250, rarity: "legendary"
      },
      {
        id: "special-wallet",
        icon: "💰",
        name: "Coin Reserve",
        desc: "Halte mindestens 1.000 Coins gleichzeitig.",
        progress: state.coins,
        target: 1000, reward: 100, rarity: "rare"
      },
      {
        id: "special-task-collection",
        icon: "📚",
        name: "Task Collector",
        desc: "Habe mindestens 50 Aufgaben gespeichert.",
        progress: state.tasks.length,
        target: 50, reward: 100, rarity: "rare"
      },
      {
        id: "secret-daily-master",
        icon: "🌌",
        name: "Daily Master",
        desc: "Schließe 100 tägliche Plan-Aufgaben ab.",
        progress: dailyDone,
        target: 100, reward: 500, rarity: "secret", secret: true
      },
      {
        id: "secret-five-today",
        icon: "⚡",
        name: "Power Day",
        desc: "Erledige an einem Tag mindestens 5 Aufgaben.",
        progress: todayDone,
        target: 5, reward: 200, rarity: "secret", secret: true
      },
      {
        id: "secret-focus-legend",
        icon: "🧿",
        name: "Focus Legend",
        desc: "Schließe 100 Fokus-Sessions ab.",
        progress: state.focusSessions || 0,
        target: 100, reward: 500, rarity: "secret", secret: true
      },
      {
        id: "secret-coin-millionaire",
        icon: "👑",
        name: "Coin Millionaire",
        desc: "Verdiene insgesamt 50.000 Coins.",
        progress: earnedCoins,
        target: 50000, reward: 1000, rarity: "secret", secret: true
      }
    ].forEach(addAchievement);

    var newUnlocks = [];

    achievements.forEach(function (item) {
      item.done = item.done || item.progress >= item.target;

      if (!item.done) return;

      if (state.unlocked.indexOf(item.id) === -1) {
        state.unlocked.push(item.id);
        newUnlocks.push(item);
      }

      if (state.achievementRewardsClaimed.indexOf(item.id) === -1) {
        state.achievementRewardsClaimed.push(item.id);
        addCoins(item.reward, "achievement", "Achievement: " + item.name);
      }
    });

    state.unlocked = Array.from(new Set(state.unlocked)).slice(-100);
    state.achievementRewardsClaimed =
      Array.from(new Set(state.achievementRewardsClaimed)).slice(-100);

    var achievementGrid = $("#achievements");

    if (achievementGrid) {
      var rarityNames = {
        all: "Alle Seltenheiten",
        common: "Common",
        uncommon: "Uncommon",
        rare: "Rare",
        epic: "Epic",
        legendary: "Legendary",
        secret: "Secret"
      };

      var oldRarity = $("#achievement-rarity-filter");
      var oldStatus = $("#achievement-status-filter");
      var rarityFilter = oldRarity ? oldRarity.value : "all";
      var statusFilter = oldStatus ? oldStatus.value : "all";

      var visible = achievements.filter(function (item) {
        if (item.secret && !item.done) return false;
        if (rarityFilter !== "all" && item.rarity !== rarityFilter) return false;
        if (statusFilter === "unlocked" && !item.done) return false;
        if (statusFilter === "locked" && item.done) return false;
        return true;
      });

      var filters =
        '<div class="achievement-filters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
          '<label style="display:flex;flex-direction:column;gap:4px">Seltenheit' +
            '<select id="achievement-rarity-filter" style="max-width:190px">' +
              Object.keys(rarityNames).map(function (key) {
                return '<option value="' + key + '"' +
                  (rarityFilter === key ? " selected" : "") + ">" +
                  rarityNames[key] + "</option>";
              }).join("") +
            '</select></label>' +
          '<label style="display:flex;flex-direction:column;gap:4px">Status' +
            '<select id="achievement-status-filter" style="max-width:190px">' +
              '<option value="all"' + (statusFilter === "all" ? " selected" : "") + '>Alle sichtbaren</option>' +
              '<option value="unlocked"' + (statusFilter === "unlocked" ? " selected" : "") + '>Freigeschaltet</option>' +
              '<option value="locked"' + (statusFilter === "locked" ? " selected" : "") + '>Gesperrt</option>' +
            '</select></label>' +
        '</div>';

      var cards = visible.map(function (item) {
        var percent = Math.min(100, Math.round(item.progress / item.target * 100));
        var rarityLabel = item.rarity.charAt(0).toUpperCase() +
          item.rarity.slice(1);

        return '<article class="achievement ' +
          (item.done ? "unlocked" : "locked") +
          '" data-rarity="' + escapeHTML(item.rarity) + '">' +
          '<div class="achievement-icon">' + item.icon + '</div>' +
          '<h3>' + escapeHTML(item.name) + '</h3>' +
          '<p>' + escapeHTML(item.desc) + '</p>' +
          '<div style="height:6px;background:rgba(128,128,128,.2);border-radius:6px;overflow:hidden;margin:10px 0">' +
            '<div style="height:100%;width:' + percent +
              '%;background:var(--accent,#b6ff00);transition:width .2s"></div>' +
          '</div>' +
          '<small>' + (item.done ? "UNLOCKED" : "LOCKED") +
            ' · ' + rarityLabel + '</small>' +
          '<div style="margin-top:6px;font-size:12px">+' +
            item.reward + ' Coins · ' +
            Math.min(item.progress, item.target).toLocaleString("de-AT") +
            ' / ' + item.target.toLocaleString("de-AT") + '</div>' +
        '</article>';
      }).join("");

      achievementGrid.innerHTML = filters + cards;

      var raritySelect = $("#achievement-rarity-filter");
      var statusSelect = $("#achievement-status-filter");

      if (raritySelect) {
        raritySelect.addEventListener("change", renderProgress);
      }
      if (statusSelect) {
        statusSelect.addEventListener("change", renderProgress);
      }

      var unlockedCount = achievements.filter(function (item) {
        return item.done;
      }).length;

      var summary = $("#achievement-summary");

      if (!summary) {
        summary = document.createElement("p");
        summary.id = "achievement-summary";
        summary.className = "muted";
        achievementGrid.parentNode.insertBefore(summary, achievementGrid);
      }

      summary.textContent = unlockedCount + " / " + achievements.length +
        " Achievements freigeschaltet";
    }

    var weekly = $("#weekly-report");

    if (weekly) {
      var keys = weekKeys(new Date());
      var weekTasks = state.tasks.filter(function (task) {
        return task.done && keys.indexOf(task.completedAt) >= 0;
      });

      var active = {};
      weekTasks.forEach(function (task) {
        active[task.completedAt] = true;
      });

      weekly.innerHTML =
        '<div class="weekly-row"><span>Aufgaben diese Woche</span><strong>' +
        weekTasks.length + '</strong></div>' +
        '<div class="weekly-row"><span>XP diese Woche</span><strong>' +
        weekTasks.reduce(function (sum, task) {
          return sum + taskXP(task);
        }, 0) + '</strong></div>' +
        '<div class="weekly-row"><span>Aktive Tage</span><strong>' +
        Object.keys(active).length + '/7</strong></div>' +
        '<div class="weekly-row"><span>Aktuelle Serie</span><strong>' +
        streak.current + ' Tage</strong></div>' +
        '<div class="weekly-row"><span>Beste Serie</span><strong>' +
        streak.best + ' Tage</strong></div>';
    }

    var recent = $("#recent-activity");

    if (recent) {
      var activity = finished.slice().sort(function (a, b) {
        return String(b.completedAt || "").localeCompare(
          String(a.completedAt || "")
        );
      }).slice(0, 8);

      recent.innerHTML = activity.length
        ? activity.map(function (task) {
            return taskHTML(task, false);
          }).join("")
        : '<div class="empty-state">Erledige eine Aufgabe, um deine Aktivität zu sehen.</div>';
    }

    save();

    if (newUnlocks.length) {
      toast(newUnlocks.length === 1
        ? "Achievement freigeschaltet: " + newUnlocks[0].name +
          " · +" + newUnlocks[0].reward + " Coins!"
        : newUnlocks.length + " Achievements freigeschaltet!");
    }
  }

  function barHTML(label, value, max) {
    var height = max > 0 ? Math.max(0, value / max * 100) : 0;

    return '<div class="bar-col" title="' +
      escapeHTML(label) + ': ' + value +
      '"><span class="bar-value">' + value +
      '</span><div class="bar-track"><div class="bar-fill" style="height:' +
      height + '%"></div></div><span class="bar-label">' +
      escapeHTML(label) + '</span></div>';
  }
    function renderAnalytics() {
    var today = parseDate(todayKey());
    var start = dateKey(shiftDate(today, -6));
    var previousStart = dateKey(shiftDate(today, -13));
    var previousEnd = dateKey(shiftDate(today, -7));

    var thisWeek = countDoneBetween(start, todayKey());
    var previousWeek = countDoneBetween(previousStart, previousEnd);
    var xpWeek = xpBetween(start, todayKey());

    var total = state.tasks.length;
    var done = completedTasks().length;
    var keys = [];

    for (var i = 6; i >= 0; i--) {
      keys.push(dateKey(shiftDate(today, -i)));
    }

    var counts = keys.map(function (key) {
      return state.tasks.filter(function (task) {
        return task.done && task.completedAt === key;
      }).length;
    });

    var max = Math.max.apply(Math, [1].concat(counts));

    setText("#analytics-week-done", thisWeek);
    setText("#analytics-week-xp", xpWeek + " XP");

    var activeDays = {};

    state.tasks.forEach(function (task) {
      if (task.done && keys.indexOf(task.completedAt) >= 0) {
        activeDays[task.completedAt] = true;
      }
    });

    setText("#analytics-active-days", Object.keys(activeDays).length + "/7");
    setText("#analytics-rate", (total ? Math.round(done / total * 100) : 0) + "%");

    var chart = $("#analytics-week-chart");

    if (chart) {
      chart.innerHTML = keys.map(function (key, index) {
        return barHTML(
          parseDate(key).toLocaleDateString("de-AT", { weekday: "short" }),
          counts[index],
          max
        );
      }).join("");
    }

    var comparison = $("#analytics-comparison");

    if (comparison) {
      var compareMax = Math.max(1, thisWeek, previousWeek);

      comparison.innerHTML =
        '<div class="compare-metric"><div class="compare-top">' +
        '<strong>Diese 7 Tage</strong><span>' + thisWeek +
        ' Aufgaben</span></div><div class="compare-bars">' +
        '<div class="compare-bar"><span style="width:' +
        (thisWeek / compareMax * 100) +
        '%"></span></div></div></div>' +
        '<div class="compare-metric"><div class="compare-top">' +
        '<strong>Vorherige 7 Tage</strong><span>' + previousWeek +
        ' Aufgaben</span></div><div class="compare-bars">' +
        '<div class="compare-bar previous"><span style="width:' +
        (previousWeek / compareMax * 100) +
        '%"></span></div></div></div>';
    }

    var months = [];

    for (var m = 5; m >= 0; m--) {
      var monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      var monthStart = dateKey(monthDate);
      var monthEnd = dateKey(shiftDate(
        new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
        -1
      ));

      months.push({
        label: monthDate.toLocaleDateString("de-AT", { month: "short" }),
        count: countDoneBetween(monthStart, monthEnd)
      });
    }

    var monthMax = Math.max.apply(
      Math,
      [1].concat(months.map(function (item) {
        return item.count;
      }))
    );

    var monthChart = $("#analytics-month-chart");

    if (monthChart) {
      monthChart.innerHTML = months.map(function (item) {
        return barHTML(item.label, item.count, monthMax);
      }).join("");
    }

    var insight = $("#analytics-insights");

    if (insight) {
      var message = thisWeek > previousWeek
        ? "Du hast " + (thisWeek - previousWeek) + " Aufgaben mehr erledigt als im Zeitraum davor."
        : thisWeek < previousWeek
          ? "Du hast " + (previousWeek - thisWeek) + " Aufgaben weniger erledigt. Das sind Daten, kein Urteil."
          : "Deine Aufgabenanzahl entspricht dem vorherigen 7-Tage-Zeitraum.";

      insight.innerHTML =
        '<p class="insight-line">' + escapeHTML(message) + '</p>' +
        '<p class="insight-line">Insgesamt erledigt: ' + done +
        ' Aufgaben · ' + totalXP() + ' XP.</p>' +
        '<p class="insight-line">Beste Serie: ' + streakInfo().best + ' Tage.</p>';
    }
  }

  function renderShop() {
    setText("#shop-coins", state.coins);

    var history = $("#shop-history");
    if (!history) return;

    if (!state.shopHistory.length) {
      history.innerHTML = '<p class="muted">Deine eingelösten Rewards erscheinen hier.</p>';
      return;
    }

    history.innerHTML = state.shopHistory.slice().reverse().slice(0, 30)
      .map(function (item) {
        return '<div class="shop-history-item">' +
          '<div><strong>' + escapeHTML(item.name) + '</strong>' +
          '<small>' + escapeHTML(item.date) + ' · ' +
          item.minutes + ' Minuten Freizeit</small></div>' +
          '<strong>−' + item.cost + ' ◈</strong></div>';
      }).join("");
  }

  function renderAll() {
    renderCategories();
    renderHome();
    renderTaskList();
    renderCalendar();
    renderHeatmap();
    renderProgress();
    renderAnalytics();
    renderShop();
    updateTimerDisplay();
  }

  function createTask(text, categoryId, kind) {
    text = String(text || "").trim();
    if (!text) return;

    var cat = getCategory(categoryId || "daily");

    state.tasks.unshift({
      id: makeId(),
      text: text.slice(0, 120),
      created: todayKey(),
      done: false,
      completedAt: null,
      category: cat.id,
      kind: kind === "daily" ? "daily-custom" : "custom",
      xpReward: cat.xp,
      coinReward: Math.max(1, Math.min(25, Math.ceil(cat.xp / 2))),
      rewardClaimed: false
    });

    save();
    renderAll();
    toast("Aufgabe hinzugefügt.");
  }

  function toggleTask(id) {
    var task = state.tasks.find(function (item) {
      return item.id === id;
    });

    if (!task) return;

    if (task.done) {
      task.done = false;
      task.completedAt = null;
      task.rewardClaimed = true;

      save();
      renderAll();
      toast("Aufgabe wieder offen. Bereits verdiente Rewards bleiben unverändert.");
      return;
    }

    task.done = true;
    task.completedAt = todayKey();

    var xp = taskXP(task);
    var coinsEarned = 0;

    if (!task.rewardClaimed) {
      task.rewardClaimed = true;
      coinsEarned = taskCoins(task);
      addCoins(coinsEarned, "task-reward", "Aufgabe: " + task.text);
    }

    save();
    renderAll();

    toast(
      "Aufgabe erledigt · +" + xp + " XP" +
      (coinsEarned ? " · +" + coinsEarned + " Coins" : "")
    );
  }

  function deleteTask(id) {
    var task = state.tasks.find(function (item) {
      return item.id === id;
    });

    if (!task || !window.confirm('Aufgabe "' + task.text + '" löschen?')) {
      return;
    }

    state.tasks = state.tasks.filter(function (item) {
      return item.id !== id;
    });

    save();
    renderAll();
    toast("Aufgabe gelöscht.");
  }

  function addCategory(name) {
    name = String(name || "").trim();
    if (!name) return;

    if (state.categories.some(function (item) {
      return item.name.toLowerCase() === name.toLowerCase();
    })) {
      toast("Diese Kategorie gibt es bereits.");
      return;
    }

    state.categories.push({
      id: makeId(),
      name: name.slice(0, 30),
      xp: 10
    });

    save();
    renderAll();
    toast("Kategorie erstellt · 10 XP pro Aufgabe.");
  }

  function deleteCategory(id) {
    if (DEFAULT_CATEGORIES.some(function (item) {
      return item.id === id;
    })) return;

    var cat = getCategory(id);

    if (!window.confirm(
      'Kategorie "' + cat.name + '" löschen? Aufgaben wechseln zu Daily.'
    )) return;

    state.tasks.forEach(function (task) {
      if (task.category === id) {
        task.category = "daily";
      }
    });

    state.categories = state.categories.filter(function (item) {
      return item.id !== id;
    });

    save();
    renderAll();
    toast("Kategorie gelöscht.");
  }

  function buyReward(rewardId) {
    var reward = state.rewards.find(function (item) {
      return item.id === rewardId;
    });

    if (!reward) {
      toast("Diese Reward wurde nicht gefunden.");
      return;
    }

    var cost = clampNumber(reward.cost, 1, MAX_REWARD_COST, 1);

    if (state.coins < cost) {
      toast("Nicht genug Coins. Dir fehlen " + (cost - state.coins) + ".");
      return;
    }

    if (!window.confirm(
      '"' + reward.name + '" für ' + cost + ' Coins einlösen?'
    )) return;

    if (state.coins < cost) {
      toast("Dein Guthaben reicht nicht mehr aus.");
      return;
    }

    state.coins -= cost;

    var transaction = {
      id: makeId(),
      type: "shop-purchase",
      amount: -cost,
      description: "Reward eingelöst: " + reward.name,
      date: todayKey(),
      createdAt: new Date().toISOString()
    };

    state.coinTransactions.push(transaction);
    state.coinTransactions = state.coinTransactions.slice(-500);

    state.shopHistory.push({
      id: makeId(),
      rewardId: reward.id,
      name: reward.name,
      minutes: reward.minutes,
      cost: cost,
      date: todayKey(),
      createdAt: new Date().toISOString()
    });

    state.shopHistory = state.shopHistory.slice(-200);

    save();
    renderAll();
    toast("Reward eingelöst! Gönn dir deine Freizeit. ◈");
  }

  function openCustomReward() {
    var panel = $("#custom-reward-panel");
    if (!panel) return;

    panel.hidden = false;

    var input = $("#custom-reward-name");
    if (input) input.focus();
  }

  function closeCustomReward() {
    var panel = $("#custom-reward-panel");
    if (panel) panel.hidden = true;
  }

  function createCustomReward() {
    var nameInput = $("#custom-reward-name");
    var minutesInput = $("#custom-reward-minutes");
    var costInput = $("#custom-reward-cost");

    if (!nameInput || !minutesInput || !costInput) return;

    var name = nameInput.value.trim();
    var minutes = Number(minutesInput.value);
    var cost = Number(costInput.value);

    if (!name) {
      toast("Bitte gib deiner Reward einen Namen.");
      nameInput.focus();
      return;
    }

    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) {
      toast("Freizeit muss zwischen 5 und 480 Minuten liegen.");
      minutesInput.focus();
      return;
    }

    if (!Number.isInteger(cost) || cost < 1 || cost > MAX_REWARD_COST) {
      toast("Der Preis muss zwischen 1 und 10.000 Coins liegen.");
      costInput.focus();
      return;
    }

    if (state.rewards.length >= 100) {
      toast("Du kannst maximal 100 Rewards speichern.");
      return;
    }

    state.rewards.push({
      id: makeId(),
      name: name.slice(0, 50),
      description: minutes + " Minuten selbst geplante Freizeit.",
      minutes: minutes,
      cost: cost,
      icon: "✨",
      custom: true
    });

    save();

    nameInput.value = "";
    minutesInput.value = "30";
    costInput.value = "60";
    closeCustomReward();
    renderAll();
    toast("Eigene Reward erstellt.");
  }

  function go(view) {
    var page = $("#view-" + view);

    if (!page) {
      console.warn("DailyApp view not found:", view);
      return;
    }

    $$(".view").forEach(function (item) {
      item.classList.toggle("active", item === page);
    });

    $$(".bottom-nav [data-view]").forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-view") === view
      );
    });

    if (view === "calendar") {
      renderCalendar();
      renderHeatmap();
    }

    if (view === "analytics") renderAnalytics();
    if (view === "shop") renderShop();

    window.scrollTo(0, 0);
  }

  function updateTimerDisplay() {
    var display = $("#timer-display");

    if (display) {
      display.textContent =
        pad(Math.floor(timerSeconds / 60)) + ":" +
        pad(timerSeconds % 60);
    }

    var button = $("#timer-start");

    if (button) {
      button.textContent = timerRunning
        ? "Pause"
        : (timerSeconds < 25 * 60 ? "Weiter" : "Start");
    }
  }

  function pauseTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;
    updateTimerDisplay();
    setText("#timer-status", "Pausiert. Weiter, wenn du bereit bist.");
  }

  function startTimer() {
    if (timerRunning) {
      pauseTimer();
      return;
    }

    if (timerSeconds <= 0) timerSeconds = 25 * 60;

    timerRunning = true;
    updateTimerDisplay();
    setText("#timer-status", "Fokus läuft …");

    timerInterval = setInterval(function () {
      timerSeconds = Math.max(0, timerSeconds - 1);
      updateTimerDisplay();

      if (timerSeconds === 0) {
        pauseTimer();

        state.focusSessions = (state.focusSessions || 0) + 1;

        save();
        renderProgress();
        renderAnalytics();

        setText("#timer-status", "Session fertig. Eine Pause ist okay.");
        toast("Fokus-Session abgeschlossen!");
      }
    }, 1000);
  }

  function resetTimer(minutes) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;
    timerSeconds = clampNumber(minutes, 1, 180, 25) * 60;

    $$("[data-minutes]").forEach(function (button) {
      button.classList.toggle(
        "active",
        Number(button.getAttribute("data-minutes")) ===
          Number(minutes || 25)
      );
    });

    setText("#timer-status", "Bereit, wenn du es bist.");
    updateTimerDisplay();
  }

  function exportData() {
    var blob = new Blob(
      [JSON.stringify({
        app: "DailyApp",
        version: 3,
        exportedAt: new Date().toISOString(),
        data: state
      }, null, 2)],
      { type: "application/json" }
    );

    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = "dailyapp-backup-" + todayKey() + ".json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    toast("Backup exportiert.");
  }

  function importData(file) {
    if (!file) return;

    var reader = new FileReader();

    reader.onload = function () {
      try {
        var object = JSON.parse(String(reader.result || ""));
        var data = object.data || object;

        if (!data ||
            !Array.isArray(data.tasks) ||
            !Array.isArray(data.categories)) {
          throw new Error("Das ist kein gültiges DailyApp-Backup.");
        }

        if (!window.confirm(
          "Backup importieren? Deine aktuellen Aufgaben und Coins werden ersetzt."
        )) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        state = loadState();
        ensureDailyTasks();
        awardDailyCoins();

        renderAll();
        toast("Backup importiert.");
      } catch (error) {
        window.alert(
          error.message || "Backup konnte nicht importiert werden."
        );
      }
    };

    reader.onerror = function () {
      window.alert("Datei konnte nicht gelesen werden.");
    };

    reader.readAsText(file);
  }

  function resetAllData() {
    if (!window.confirm(
      "Alle DailyApp-Aufgaben, Coins und Statistiken zurücksetzen? Das kann nicht rückgängig gemacht werden."
    )) return;

    state = defaultState();
    ensureDailyTasks();
    awardDailyCoins();
    renderAll();
    toast("DailyApp-Daten zurückgesetzt.");
  }

  function handleClick(event) {
    var target = event.target;

    if (!target || !target.closest) return;

    var nav = target.closest("[data-view]");

    if (nav && nav.closest(".bottom-nav, nav")) {
      go(nav.getAttribute("data-view"));
      return;
    }

    var goButton = target.closest("[data-go]");

    if (goButton) {
      go(goButton.getAttribute("data-go"));
      return;
    }

    var toggle = target.closest("[data-toggle]");

    if (toggle) {
      toggleTask(toggle.getAttribute("data-toggle"));
      return;
    }

    var remove = target.closest("[data-delete]");

    if (remove) {
      deleteTask(remove.getAttribute("data-delete"));
      return;
    }

    var dateButton = target.closest("[data-date]");

    if (dateButton) {
      selectedDate = dateButton.getAttribute("data-date");
      renderCalendar();
      return;
    }

    if (target.closest("#prev-month")) {
      calendarCursor = new Date(
        calendarCursor.getFullYear(),
        calendarCursor.getMonth() - 1,
        1
      );

      renderCalendar();
      return;
    }

    if (target.closest("#next-month")) {
      calendarCursor = new Date(
        calendarCursor.getFullYear(),
        calendarCursor.getMonth() + 1,
        1
      );

      renderCalendar();
      return;
    }

    var filter = target.closest("[data-filter]");

    if (filter) {
      currentFilter = filter.getAttribute("data-filter");

      $$("[data-filter]").forEach(function (button) {
        button.classList.toggle("active", button === filter);
      });

      renderTaskList();
      return;
    }

    var accentButton = target.closest(
      "#accent-options button[data-accent]"
    );

    if (accentButton &&
        ACCENTS[accentButton.getAttribute("data-accent")]) {
      appearance.accent = accentButton.getAttribute("data-accent");
      saveAppearance();
      toast("Akzentfarbe geändert.");
      return;
    }

    var categoryRemove = target.closest("[data-delete-cat]");

    if (categoryRemove) {
      deleteCategory(categoryRemove.getAttribute("data-delete-cat"));
      return;
    }

    var minutes = target.closest("[data-minutes]");

    if (minutes) {
      resetTimer(minutes.getAttribute("data-minutes"));
      return;
    }

    var buyButton = target.closest("[data-reward]");

    if (buyButton) {
      buyReward(buyButton.getAttribute("data-reward"));
      return;
    }

    if (target.closest("#custom-reward-open")) {
      openCustomReward();
      return;
    }

    if (target.closest("#custom-reward-cancel")) {
      closeCustomReward();
      return;
    }

    if (target.closest("#command-add-task") ||
        target.closest("#quick-add")) {
      go("tasks");

      var input = $("#task-input");
      if (input) input.focus();

      return;
    }

    if (target.closest("#timer-start")) {
      startTimer();
      return;
    }

    if (target.closest("#timer-reset")) {
      resetTimer(25);
      return;
    }

    if (target.closest("#export-data")) {
      exportData();
      return;
    }

    if (target.closest("#reset-data")) {
      resetAllData();
      return;
    }
  }

  function handleSubmit(event) {
    var form = event.target;

    if (form.matches("#task-form")) {
      event.preventDefault();

      var input = $("#task-input");
      var select = $("#task-category");
      var kind = $("#task-kind");

      if (!input || !input.value.trim()) return;

      createTask(
        input.value,
        select ? select.value : "daily",
        kind ? kind.value : "task"
      );

      input.value = "";
      input.focus();
      return;
    }

    if (form.matches("#category-form")) {
      event.preventDefault();

      var categoryInput = $("#category-input");

      if (!categoryInput || !categoryInput.value.trim()) return;

      addCategory(categoryInput.value);
      categoryInput.value = "";
      return;
    }

    if (form.matches("#custom-reward-form")) {
      event.preventDefault();
      createCustomReward();
    }
  }

  function handleChange(event) {
    if (event.target.matches("#theme-select")) {
      appearance.theme = ["dark", "light", "system"].indexOf(
        event.target.value
      ) >= 0 ? event.target.value : "dark";

      saveAppearance();
      toast("Darstellung geändert.");
      return;
    }

    if (event.target.matches("#import-file")) {
      var file = event.target.files && event.target.files[0];

      if (file) importData(file);

      event.target.value = "";
    }
  }

  function init() {
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("change", handleChange);

    window.addEventListener("pageshow", function () {
      try {
        renderAll();
      } catch (error) {
        console.error("DailyApp refresh error:", error);
      }
    });

    try {
      state = loadState();
      appearance = loadAppearance();

      applyAppearance();
      ensureDailyTasks();
      awardDailyCoins();
      renderAll();

      if (window.matchMedia) {
        var media = window.matchMedia("(prefers-color-scheme: dark)");

        if (media.addEventListener) {
          media.addEventListener("change", function () {
            if (appearance.theme === "system" ||
                appearance.theme === "auto") {
              applyAppearance();
            }
          });
        }
      }

      console.log("DailyApp 3.0 ready.");
    } catch (error) {
      console.error("DailyApp could not start:", error);

      var toastEl = $("#toast");

      if (toastEl) {
        toastEl.textContent =
          "DailyApp error: " + (error.message || error);
        toastEl.classList.add("show");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
  
