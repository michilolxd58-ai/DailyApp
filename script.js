
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");

let tasks = JSON.parse(
  localStorage.getItem("dailyapp-tasks") || "[]"
);

function renderTasks() {
localStorage.setItem("dailyapp-tasks", JSON.stringify(tasks));
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      renderTasks();
    });

    const label = document.createElement("span");
    label.textContent = task.text;

    if (task.done) {
      label.classList.add("completed");
    }

    const removeButton = document.createElement("button");
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Task löschen");

    removeButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
    });

    li.append(checkbox, label, removeButton);
    taskList.appendChild(li);
  });

  const completed = tasks.filter(task => task.done).length;
  taskCount.textContent =
    `${completed} von ${tasks.length} Tasks erledigt`;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, done: false });
  taskInput.value = "";

  renderTasks();
});
