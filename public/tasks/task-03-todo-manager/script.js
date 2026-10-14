// Task 3: To-Do List & Task Manager Script
// Web Storage Key
const STORAGE_KEY = 'productivity_dashboard_tasks_v1';

// Initial Sample Data if storage empty
const defaultTasks = [
  { id: '1', title: 'Architect modular state manager', category: 'Work', priority: 'High', completed: false, createdAt: Date.now() - 3600000 },
  { id: '2', title: 'Review accessibility contrast standards', category: 'Study', priority: 'Medium', completed: true, createdAt: Date.now() - 7200000 },
  { id: '3', title: 'Submit quarterly LMS assessment', category: 'Urgent', priority: 'High', completed: false, createdAt: Date.now() - 10800000 },
  { id: '4', title: 'Prep roasted pour-over coffee beans', category: 'Personal', priority: 'Low', completed: false, createdAt: Date.now() - 14400000 }
];

// App State
let tasks = [];
let currentCategoryFilter = 'All';
let currentStatusFilter = 'all'; // 'all', 'active', 'completed'
let editingTaskId = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskCategorySelect = document.getElementById('taskCategorySelect');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const categoryFiltersEl = document.getElementById('categoryFilters');
const statusButtons = document.querySelectorAll('.status-btn');
const statCompleted = document.getElementById('statCompleted');
const statTotal = document.getElementById('statTotal');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Load Data from LocalStorage (Read)
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      tasks = JSON.parse(raw);
    } else {
      tasks = [...defaultTasks];
      saveTasks();
    }
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    tasks = [...defaultTasks];
  }
}

// Persist Data to LocalStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
  updateFilterCounts();
  updateStats();
}

// Update Top Level Stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  statTotal.textContent = total;
  statCompleted.textContent = completed;
}

// Update Filter Pill Badges
function updateFilterCounts() {
  document.getElementById('countAll').textContent = tasks.length;
  document.getElementById('countWork').textContent = tasks.filter(t => t.category === 'Work').length;
  document.getElementById('countPersonal').textContent = tasks.filter(t => t.category === 'Personal').length;
  document.getElementById('countUrgent').textContent = tasks.filter(t => t.category === 'Urgent').length;
  document.getElementById('countStudy').textContent = tasks.filter(t => t.category === 'Study').length;
}

// Render Tasks (Read)
function renderTasks() {
  taskList.innerHTML = '';

  // Apply filters
  const filtered = tasks.filter(task => {
    const matchCategory = currentCategoryFilter === 'All' || task.category === currentCategoryFilter;
    const matchStatus = currentStatusFilter === 'all' ||
      (currentStatusFilter === 'active' && !task.completed) ||
      (currentStatusFilter === 'completed' && task.completed);
    return matchCategory && matchStatus;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    const isEditing = editingTaskId === task.id;

    li.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''} 
          aria-label="Mark task as complete"
        >
        <div class="task-content">
          ${isEditing 
            ? `<input type="text" class="inline-edit-input" value="${escapeHtml(task.title)}" autofocus>` 
            : `<span class="task-text">${escapeHtml(task.title)}</span>`
          }
          <div class="task-meta">
            <span class="badge-cat cat-${task.category.toLowerCase()}">${escapeHtml(task.category)}</span>
            <span class="badge-priority">&bull; ${escapeHtml(task.priority)} Priority</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        ${isEditing
          ? `<button class="btn-icon-action btn-save-edit" title="Save">&#10003;</button>
             <button class="btn-icon-action btn-cancel-edit" title="Cancel">&#10005;</button>`
          : `<button class="btn-icon-action btn-edit" title="Edit task">&#9998;</button>
             <button class="btn-icon-action btn-delete" title="Delete task">&#128465;</button>`
        }
      </div>
    `;

    // Event: Toggle Status (Update Status)
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => {
      toggleTaskStatus(task.id);
    });

    if (isEditing) {
      const editInput = li.querySelector('.inline-edit-input');
      const saveBtn = li.querySelector('.btn-save-edit');
      const cancelBtn = li.querySelector('.btn-cancel-edit');

      saveBtn.addEventListener('click', () => {
        commitEdit(task.id, editInput.value);
      });

      cancelBtn.addEventListener('click', () => {
        editingTaskId = null;
        renderTasks();
      });

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commitEdit(task.id, editInput.value);
        if (e.key === 'Escape') {
          editingTaskId = null;
          renderTasks();
        }
      });
    } else {
      // Event: Edit (Update Text)
      const editBtn = li.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => {
        editingTaskId = task.id;
        renderTasks();
      });

      // Event: Delete (Delete)
      const deleteBtn = li.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
      });
    }

    taskList.appendChild(li);
  });
}

// CRUD: Create
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString(),
    title: title,
    category: taskCategorySelect.value,
    priority: taskPrioritySelect.value,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskTitleInput.value = '';
  taskTitleInput.focus();
});

// CRUD: Update Status
function toggleTaskStatus(id) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      return { ...t, completed: !t.completed };
    }
    return t;
  });
  saveTasks();
  renderTasks();
}

// CRUD: Update Content
function commitEdit(id, newTitle) {
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  tasks = tasks.map(t => {
    if (t.id === id) {
      return { ...t, title: trimmed };
    }
    return t;
  });
  editingTaskId = null;
  saveTasks();
  renderTasks();
}

// CRUD: Delete
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Clear All Completed
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

// Category Filter Handling
categoryFiltersEl.addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;

  categoryFiltersEl.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
  pill.classList.add('active');

  currentCategoryFilter = pill.getAttribute('data-category');
  renderTasks();
});

// Status Filter Handling
statusButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    statusButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatusFilter = btn.getAttribute('data-status');
    renderTasks();
  });
});

// Utility: Escape HTML
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  updateFilterCounts();
  updateStats();
  renderTasks();
});
