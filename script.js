// Task Management
class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.currentFilter = "all";
    this.init();
  }

  init() {
    this.loadTasks();
    this.setupEventListeners();
    this.updateStats();
  }

  loadTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    if (this.tasks.length === 0) {
      taskList.innerHTML = `
                        <div class="empty-state text-center py-12 sm:py-16 px-4 bg-white/70 backdrop-blur-lg rounded-xl transition-all duration-300 hover:shadow-lg">
                            <i class="fas fa-check-circle text-5xl text-indigo-200 mb-4 cursor-pointer hover:text-indigo-400 transition-colors"></i>
                            <h3 class="text-lg sm:text-xl font-medium text-gray-500 mb-2">No tasks yet</h3>
                            <p class="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Add your first task above to get started. You're doing great!</p>
                        </div>
                    `;
      return;
    }

    const filteredTasks = this.filterTasks();

    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  }

  filterTasks() {
    switch (this.currentFilter) {
      case "completed":
        return this.tasks.filter((task) => task.completed);
      case "pending":
        return this.tasks.filter((task) => !task.completed);
      default:
        return this.tasks;
    }
  }

  createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className = `task-card bounce-in bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 flex items-start ${
      task.completed ? "completed" : ""
    } priority-${task.priority}`;
    taskElement.dataset.id = task.id;

    const date = new Date(task.timestamp);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let priorityText = "";
    let priorityClass = "";

    switch (task.priority) {
      case "high":
        priorityText = "High Priority";
        priorityClass = "bg-red-100 text-red-800";
        break;
      case "medium":
        priorityText = "Medium Priority";
        priorityClass = "bg-amber-100 text-amber-800";
        break;
      case "low":
        priorityText = "Low Priority";
        priorityClass = "bg-blue-100 text-blue-800";
        break;
    }

    taskElement.innerHTML = `
                    <div class="flex items-start w-full">
                        <button class="complete-btn mt-1 mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 ${
                          task.completed
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-gray-300"
                        } flex items-center justify-center">
                            ${
                              task.completed
                                ? '<i class="fas fa-check text-white text-xs"></i>'
                                : ""
                            }
                        </button>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="text-base sm:text-lg font-medium text-gray-800 ${
                                      task.completed
                                        ? "line-through text-gray-500"
                                        : ""
                                    }" id="task-text-${task.id}">${
      task.text
    }</div>
                                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                                        <span class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i> ${formattedDate}</span>
                                        <span class="text-xs ${priorityClass} px-2 py-1 rounded-full">${priorityText}</span>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button class="edit-btn text-gray-500 hover:text-indigo-600 p-2 rounded-lg">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button class="delete-btn text-gray-500 hover:text-red-600 p-2 rounded-lg">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

    return taskElement;
  }

  addTask(text, priority) {
    if (!text.trim()) return;

    const newTask = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      priority: priority,
      timestamp: Date.now(),
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.loadTasks();
    this.updateStats();

    document.getElementById("task-input").value = "";
  }

  toggleTaskStatus(id) {
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    this.saveTasks();
    this.loadTasks();
    this.updateStats();
  }

  editTask(id, newText) {
    if (!newText.trim()) return;

    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        return { ...task, text: newText.trim() };
      }
      return task;
    });

    this.saveTasks();
    this.loadTasks();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveTasks();
    this.loadTasks();
    this.updateStats();
  }

  clearCompleted() {
    this.tasks = this.tasks.filter((task) => !task.completed);
    this.saveTasks();
    this.loadTasks();
    this.updateStats();
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("pending-tasks").textContent = pendingTasks;
    document.getElementById("progress-fill").style.width = `${progress}%`;
  }

  setupEventListeners() {
    document.getElementById("task-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const taskInput = document.getElementById("task-input");
      const prioritySelect = document.getElementById("priority-select");
      this.addTask(taskInput.value, prioritySelect.value);
    });

    document.getElementById("task-list").addEventListener("click", (e) => {
      const taskElement = e.target.closest(".task-card");
      if (!taskElement) return;

      const taskId = parseInt(taskElement.dataset.id);

      if (e.target.closest(".complete-btn")) {
        this.toggleTaskStatus(taskId);
      }

      if (e.target.closest(".delete-btn")) {
        this.deleteTask(taskId);
      }

      if (e.target.closest(".edit-btn")) {
        const task = this.tasks.find((t) => t.id === taskId);
        if (task) {
          const newText = prompt("Edit your task:", task.text);
          if (newText !== null) {
            this.editTask(taskId, newText);
          }
        }
      }
    });

    document.getElementById("task-list").addEventListener("dblclick", (e) => {
      const taskElement = e.target.closest(".task-card");
      if (!taskElement) return;

      const taskId = parseInt(taskElement.dataset.id);
      const task = this.tasks.find((t) => t.id === taskId);

      if (task && !e.target.closest("button")) {
        const newText = prompt("Edit your task:", task.text);
        if (newText !== null) {
          this.editTask(taskId, newText);
        }
      }
    });

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
        button.classList.add("active");
        this.currentFilter = button.dataset.filter;
        this.loadTasks();
      });
    });

    document.getElementById("clear-completed").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all completed tasks?")) {
        this.clearCompleted();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const taskManager = new TaskManager();

  if (taskManager.tasks.length === 0) {
    taskManager.addTask("Welcome to TaskFlow!", "medium");
    taskManager.addTask("Click the checkbox to complete tasks", "low");
    taskManager.addTask("Double-tap a task to edit it", "high");
    taskManager.addTask("Try filtering tasks by status", "medium");
  }
});
