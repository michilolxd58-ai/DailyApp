
/* DailyApp 2.3 — clean replacement for the current index.html */
(function () {
  "use strict";

  var STORAGE_KEY = "dailyapp-midnight-v1";
  var SETTINGS_KEY = "dailyapp-appearance-v1";

  var DEFAULT_CATEGORIES = [
    { id: "daily", name: "Daily", xp: 10 },
    { id: "school", name: "School", xp: 20 },
    { id: "training", name: "Training", xp: 30 },
    { id: "challenge", name: "Challenge", xp: 50 }
  ];

  var TASK_POOL = [
    "Make your bed",
    "Drink a glass of water",
    "Read for 10 minutes",
    "Tidy your desk for 5 minutes",
    "Take a short walk",
    "Stretch for 5 minutes",
    "Write down your top priority",
    "Review your notes",
    "Prepare your bag for tomorrow",
    "Learn one new coding concept",
    "Finish a small school task",
    "Put your phone away for 20 minutes",
    "Plan tomorrow's first task",
    "Clean one small area",
    "Practice a skill for 15 minutes",
    "Spend 10 minutes learning something"
  ];

  var ACCENTS = {
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
    return typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value);
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
    var element = $(selector);
    if (element) element.textContent = String(value);
  }

  function setWidth(selector, value) {
    var element = $(selector);
    if (element) {
      element.style.width =
        Math.max(0, Math.min(100, Number(value) || 0)) + "%";
    }
  }

  function toast(message) {
    var element = $("#toast");

    if (!element) {
      console.log(message);
      return;
    }

    element.textContent = message;
    element.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      element.classList.remove("show");
    }, 2400);
  }

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaultState() {
    return {
      version: 2,
      tasks: [],
      categories: copy(DEFAULT_CATEGORIES),
      dailyPlans: {},
      bonusCompleted: 0,
      focusSessions: 0,
      unlocked: []
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
      .map(function (item) {
        return {
          id: String(item.id || makeId()),
          name: String(item.name || "Category").slice(0, 30),
          xp: Math.max(1, Math.min(1000, Number(item.xp) || 10))
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
      .map(function (task) {
        var item = {
          id: String(task.id || makeId()),
          text: String(task.text || "Task"),
          created: isDateKey(task.created)
            ? task.created
            : todayKey(),
          done: Boolean(task.done),
          completedAt: isDateKey(task.completedAt)
            ? task.completedAt
            : null,
          category: categoryIds.indexOf(
            String(task.category || "daily")
          ) >= 0
            ? String(task.category || "daily")
            : categories[0].id,
          kind: String(task.kind || "custom")
        };

        if (isDateKey(task.day)) item.day = task.day;

        if (
          task.xpReward !== undefined &&
          isFinite(Number(task.xpReward))
        ) {
          item.xpReward = Number(task.xpReward);
        }

        return item;
      });

    return {
      version: 2,
      tasks: tasks,
      categories: categories,
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
      unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : []
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save DailyApp data:", error);
      toast("Could not save data in this browser.");
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
          accent: Object.prototype.hasOwnProperty.call(
            ACCENTS,
            saved.accent
          ) ? saved.accent : "mint"
        };
      }
    } catch (error) {
      // Use default appearance.
    }

    return { theme: "dark", accent: "mint" };
  }

  function actualTheme() {
    if (
      appearance.theme === "system" ||
      appearance.theme === "auto"
    ) {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return appearance.theme;
  }

  function applyAppearance() {
    var root = document.documentElement;
    var accent = ACCENTS[appearance.accent] || ACCENTS.mint;

    root.setAttribute("data-theme", actualTheme());
    root.setAttribute("data-accent", appearance.accent);
    root.style.setProperty("--accent", accent[0]);
    root.style.setProperty("--accent-rgb", accent[1]);

    var themeSelect = $("#theme-select");

    if (themeSelect) {
      themeSelect.value =
        appearance.theme === "auto" ? "system" : appearance.theme;
    }

    var accentContainer = $("#accent-options");

    if (
      accentContainer &&
      !accentContainer.getAttribute("data-built")
    ) {
      accentContainer.innerHTML = Object.keys(ACCENTS)
        .map(function (name) {
          return '<button type="button" class="accent-swatch" ' +
            'data-accent="' + name + '" ' +
            'aria-label="' + name + ' accent color" ' +
            'title="' + name + '" ' +
            'style="background:' + ACCENTS[name][0] + '"></button>';
        })
        .join("");

      accentContainer.setAttribute("data-built", "yes");
    }

    $$("[data-accent]").forEach(function (button) {
      var selected =
        button.getAttribute("data-accent") === appearance.accent;

      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function saveAppearance() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(appearance)
      );
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
    if (
      task.xpReward !== undefined &&
      isFinite(Number(task.xpReward))
    ) {
      return Math.max(0, Number(task.xpReward));
    }

    return getCategory(task.category).xp;
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

  function getPlan(day) {
    day = day || todayKey();

    var plan = state.dailyPlans[day];

    if (
      !plan ||
      typeof plan !== "object" ||
      !Array.isArray(plan.taskTexts) ||
      !plan.taskTexts.length
    ) {
      var pool = TASK_POOL.slice();
      var chosen = [];
      var amount = 4 + Math.floor(Math.random() * 2);

      while (chosen.length < amount && pool.length) {
        chosen.push(
          pool.splice(
            Math.floor(Math.random() * pool.length),
            1
          )[0]
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
          xpReward: 10
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

  function dailyEarned(day) {
    day = day || todayKey();

    return state.tasks
      .filter(function (task) {
        return task.done && task.completedAt === day;
      })
      .reduce(function (sum, task) {
        return sum + taskXP(task);
      }, 0);
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
    start.setDate(
      start.getDate() - ((start.getDay() + 6) % 7)
    );

    var result = [];

    for (var i = 0; i < 7; i++) {
      result.push(dateKey(shiftDate(start, i)));
    }

    return result;
  }

  function countDoneBetween(start, end) {
    return state.tasks.filter(function (task) {
      return task.done &&
        task.completedAt &&
        task.completedAt >= start &&
        task.completedAt <= end;
    }).length;
  }

  function xpBetween(start, end) {
    return state.tasks
      .filter(function (task) {
        return task.done &&
          task.completedAt &&
          task.completedAt >= start &&
          task.completedAt <= end;
      })
      .reduce(function (sum, task) {
        return sum + taskXP(task);
      }, 0);
  }

  function taskHTML(task, allowDelete) {
    var cat = getCategory(task.category);

    var status = task.done
      ? (task.completedAt
        ? "Completed " + task.completedAt
        : "Completed")
      : (task.created === todayKey()
        ? "Added today"
        : "Added " + task.created);

    var html = '<article class="task-card ' +
      (task.done ? "done" : "") + '">';

    html += '<button type="button" class="task-check" ' +
      'data-toggle="' + escapeHTML(task.id) + '" ' +
      'aria-label="' + (task.done ? "Mark active" : "Complete task") +
      '" aria-pressed="' + String(task.done) + '">' +
      (task.done ? "✓" : "") + '</button>';

    html += '<div class="task-copy">' +
      '<div class="task-title">' + escapeHTML(task.text) + '</div>' +
      '<div class="task-sub">' + escapeHTML(cat.name) +
      ' · ' + escapeHTML(status) + '</div></div>';

    html += '<span class="task-xp">+' + taskXP(task) + ' XP</span>';

    if (allowDelete) {
      html += '<button type="button" class="delete-task" ' +
        'data-delete="' + escapeHTML(task.id) + '" ' +
        'aria-label="Delete task">×</button>';
    }

    return html + '</article>';
  }

  function renderHome() {
    var tasks = tasksForToday();
    var done = tasks.filter(function (task) {
      return task.done;
    }).length;

    var percent = tasks.length
      ? Math.round(done / tasks.length * 100)
      : 0;

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
          item.xp + ' XP per task</small></div>' +
          (isDefault
            ? ""
            : '<button type="button" class="delete-task" data-delete-cat="' +
              escapeHTML(item.id) +
              '" aria-label="Delete category">×</button>') +
          '</div>';
      }).join("");
    }
  }

  function renderCalendar() {
    var label = $("#calendar-month");

    if (label) {
      label.textContent = calendarCursor.toLocaleDateString(
        "en-GB",
        { month: "long", year: "numeric" }
      );
    }

    var grid = $("#calendar-days");

    if (grid) {
      var year = calendarCursor.getFullYear();
      var month = calendarCursor.getMonth();

      var offset = (
        new Date(year, month, 1).getDay() + 6
      ) % 7;

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
          '" data-date="' + key +
          '" aria-pressed="' + String(key === selectedDate) +
          '">' + day + '</button>';
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
        counts[task.completedAt] =
          (counts[task.completedAt] || 0) + 1;
      }
    });

    var today = parseDate(todayKey());
    var start = shiftDate(today, -363);

    start.setDate(
      start.getDate() - ((start.getDay() + 6) % 7)
    );

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
        ' completed task(s)" aria-label="' +
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
          labels.push(
            d.toLocaleDateString("en-GB", { month: "short" })
          );
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

    setText("#progress-level", "Level " + info.level);
    setText("#level-orb", info.level);

    setText(
      "#progress-title",
      info.level < 3
        ? "Getting started"
        : info.level < 6
          ? "Building momentum"
          : "Consistency builder"
    );

    setWidth("#level-progress-fill", info.inside);
    setText("#level-xp-text", info.inside + " / 100 XP");
    setText(
      "#level-next",
      (100 - info.inside) + " XP bis Level " + (info.level + 1)
    );
    setText("#progress-done", done);
    setText(
      "#progress-rate",
      (total ? Math.round(done / total * 100) : 0) + "%"
    );
    setText("#progress-focus", state.focusSessions || 0);

    var achievements = [
      { id: "first", icon: "🌱", name: "First Step", desc: "Complete your first task.", done: done >= 1 },
      { id: "five", icon: "⚡", name: "Getting Momentum", desc: "Complete 5 tasks.", done: done >= 5 },
      { id: "twentyfive", icon: "🧩", name: "Consistent Builder", desc: "Complete 25 tasks.", done: done >= 25 },
      { id: "hundred", icon: "💯", name: "Century Club", desc: "Complete 100 tasks.", done: done >= 100 },
      { id: "xp100", icon: "✨", name: "XP Collector", desc: "Earn 100 XP.", done: xp >= 100 },
      { id: "xp1000", icon: "🏅", name: "XP Machine", desc: "Earn 1,000 XP.", done: xp >= 1000 },
      { id: "streak3", icon: "🔥", name: "Three-Day Spark", desc: "Reach a 3-day streak.", done: streakInfo().best >= 3 },
      { id: "streak7", icon: "🗓️", name: "One-Week Rhythm", desc: "Reach a 7-day streak.", done: streakInfo().best >= 7 },
      { id: "focus", icon: "⏱️", name: "Focus Starter", desc: "Complete a focus session.", done: (state.focusSessions || 0) >= 1 },
      {
        id: "category",
        icon: "🛠️",
        name: "Make It Yours",
        desc: "Create a custom category.",
        done: state.categories.some(function (item) {
          return !DEFAULT_CATEGORIES.some(function (base) {
            return base.id === item.id;
          });
        })
      }
    ];

    state.unlocked = achievements
      .filter(function (item) { return item.done; })
      .map(function (item) { return item.id; });

    var achievementGrid = $("#achievements");

    if (achievementGrid) {
      achievementGrid.innerHTML = achievements.map(function (item) {
        return '<article class="achievement ' +
          (item.done ? "unlocked" : "locked") +
          '"><div class="achievement-icon">' + item.icon +
          '</div><h3>' + escapeHTML(item.name) +
          '</h3><p>' + escapeHTML(item.desc) +
          '</p><small>' + (item.done ? "UNLOCKED" : "LOCKED") +
          '</small></article>';
      }).join("");
    }

    var weekly = $("#weekly-report");

    if (weekly) {
      var keys = weekKeys(new Date());

      var weekTasks = state.tasks.filter(function (task) {
        return task.done && keys.indexOf(task.completedAt) >= 0;
      });

      var activeDays = {};

      weekTasks.forEach(function (task) {
        activeDays[task.completedAt] = true;
      });

      weekly.innerHTML =
        '<div class="weekly-row"><span>Tasks completed this week</span><strong>' +
        weekTasks.length + '</strong></div>' +
        '<div class="weekly-row"><span>XP earned this week</span><strong>' +
        weekTasks.reduce(function (sum, task) {
          return sum + taskXP(task);
        }, 0) + '</strong></div>' +
        '<div class="weekly-row"><span>Active days</span><strong>' +
        Object.keys(activeDays).length + '/7</strong></div>' +
        '<div class="weekly-row"><span>Current streak</span><strong>' +
        streakInfo().current + ' days</strong></div>' +
        '<div class="weekly-row"><span>Best streak</span><strong>' +
        streakInfo().best + ' days</strong></div>';
    }

    var recent = $("#recent-activity");

    if (recent) {
      var activity = completedTasks()
        .sort(function (a, b) {
          return String(b.completedAt || "").localeCompare(
            String(a.completedAt || "")
          );
        })
        .slice(0, 8);

      recent.innerHTML = activity.length
        ? activity.map(function (task) {
            return taskHTML(task, false);
          }).join("")
        : '<div class="empty-state">Erledige eine Aufgabe, um deine Aktivität zu sehen.</div>';
    }

    save();
  }

  function barHTML(label, value, max) {
    var height = max > 0 ? Math.max(0, value / max * 100) : 0;

    return '<div class="bar-col" title="' + escapeHTML(label) +
      ': ' + value + '">' +
      '<span class="bar-value">' + value + '</span>' +
      '<div class="bar-track"><div class="bar-fill" style="height:' +
      height + '%"></div></div>' +
      '<span class="bar-label">' + escapeHTML(label) + '</span>' +
      '</div>';
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
    setText(
      "#analytics-rate",
      (total ? Math.round(done / total * 100) : 0) + "%"
    );

    var chart = $("#analytics-week-chart");

    if (chart) {
      chart.innerHTML = keys.map(function (key, index) {
        return barHTML(
          parseDate(key).toLocaleDateString(
            "en-GB",
            { weekday: "short" }
          ),
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
        (thisWeek / compareMax * 100) + '%"></span></div></div></div>' +
        '<div class="compare-metric"><div class="compare-top">' +
        '<strong>Vorherige 7 Tage</strong><span>' + previousWeek +
        ' Aufgaben</span></div><div class="compare-bars">' +
        '<div class="compare-bar previous"><span style="width:' +
        (previousWeek / compareMax * 100) + '%"></span></div></div></div>';
    }

    var months = [];

    for (var m = 5; m >= 0; m--) {
      var monthDate = new Date(
        today.getFullYear(),
        today.getMonth() - m,
        1
      );

      var monthStart = dateKey(monthDate);
      var monthEnd = dateKey(
        shiftDate(
          new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            1
          ),
          -1
        )
      );

      months.push({
        label: monthDate.toLocaleDateString(
          "en-GB",
          { month: "short" }
        ),
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
        ? "Du hast " + (thisWeek - previousWeek) +
          " Aufgaben mehr erledigt als im Zeitraum davor."
        : thisWeek < previousWeek
          ? "Du hast " + (previousWeek - thisWeek) +
            " Aufgaben weniger erledigt als im Zeitraum davor. Das sind Daten, kein Urteil."
          : "Deine Aufgabenanzahl entspricht dem vorherigen 7-Tage-Zeitraum.";

      insight.innerHTML =
        '<p class="insight-line">' + escapeHTML(message) + '</p>' +
        '<p class="insight-line">Insgesamt erledigt: ' + done +
        ' Aufgaben · ' + totalXP() + ' XP.</p>' +
        '<p class="insight-line">Beste Serie: ' +
        streakInfo().best + ' Tage.</p>';
    }
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
      xpReward: cat.xp
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

    task.done = !task.done;
    task.completedAt = task.done ? todayKey() : null;

    save();
    renderAll();

    toast(
      task.done
        ? "Aufgabe erledigt · +" + taskXP(task) + " XP"
        : "Aufgabe wieder offen."
    );
  }

  function deleteTask(id) {
    var task = state.tasks.find(function (item) {
      return item.id === id;
    });

    if (!task || !window.confirm(
      'Aufgabe "' + task.text + '" löschen?'
    )) return;

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
      'Kategorie "' + cat.name +
      '" löschen? Aufgaben wechseln zu Daily.'
    )) return;

    state.tasks.forEach(function (task) {
      if (task.category === id) {
        task.category = "daily";
        task.xpReward = getCategory("daily").xp;
      }
    });

    state.categories = state.categories.filter(function (item) {
      return item.id !== id;
    });

    save();
    renderAll();
    toast("Kategorie gelöscht.");
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

    window.scrollTo(0, 0);
  }

  function renderAll() {
    renderCategories();
    renderHome();
    renderTaskList();
    renderCalendar();
    renderHeatmap();
    renderProgress();
    renderAnalytics();
    updateTimerDisplay();
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

        setText(
          "#timer-status",
          "Session fertig. Eine Pause ist okay."
        );

        toast("Fokus-Session abgeschlossen!");
      }
    }, 1000);
  }

  function resetTimer(minutes) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;

    timerSeconds = Math.max(
      1,
      Math.min(180, Number(minutes) || 25)
    ) * 60;

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
        version: 2,
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

        if (
          !data ||
          !Array.isArray(data.tasks) ||
          !Array.isArray(data.categories)
        ) {
          throw new Error("Das ist kein gültiges DailyApp-Backup.");
        }

        if (!window.confirm(
          "Backup importieren? Deine aktuellen Aufgaben werden ersetzt."
        )) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        state = loadState();
        ensureDailyTasks();
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
      "Alle DailyApp-Aufgaben und Statistiken zurücksetzen? Das kann nicht rückgängig gemacht werden."
    )) return;

    state = defaultState();
    ensureDailyTasks();
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

    var accent = target.closest("[data-accent]");

    if (
      accent &&
      ACCENTS[accent.getAttribute("data-accent")]
    ) {
      appearance.accent = accent.getAttribute("data-accent");
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

    if (target.closest("#quick-add")) {
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
    }
  }

  function handleChange(event) {
    if (event.target.matches("#theme-select")) {
      appearance.theme = [
        "dark",
        "light",
        "system"
      ].indexOf(event.target.value) >= 0
        ? event.target.value
        : "dark";

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
      renderAll();

      if (window.matchMedia) {
        var media = window.matchMedia(
          "(prefers-color-scheme: dark)"
        );

        if (media.addEventListener) {
          media.addEventListener("change", function () {
            if (
              appearance.theme === "system" ||
              appearance.theme === "auto"
            ) {
              applyAppearance();
            }
          });
        }
      }

      console.log("DailyApp 2.3 ready.");
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
