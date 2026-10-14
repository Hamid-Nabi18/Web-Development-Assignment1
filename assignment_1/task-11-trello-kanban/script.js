// Task 11: Trello-Style Workflow Manager Script
// HTML5 Drag and Drop APIs with Immutable State Management & LocalStorage Persistence
const STORAGE_KEY = 'kanban_workflow_board_state_v1';

// Initial Columns & Tasks Immutable Template
const initialBoardState = {
  columns: [
    { id: 'todo', title: 'To Do', color: 'todo' },
    { id: 'in_progress', title: 'In Progress', color: 'in_progress' },
    { id: 'review', title: 'Code Review', color: 'review' },
    { id: 'done', title: 'Completed', color: 'done' }
  ],
  tasks: [
    { id: 'card-101', columnId: 'todo', title: 'Implement OAuth PKCE code flow', description: 'Ensure secure client-side tokens without secret disclosure.', tag: 'Backend' },
    { id: 'card-102', columnId: 'todo', title: 'Optimize WebGL canvas render loops', description: 'Throttle requestAnimationFrame and benchmark draw calls.', tag: 'Frontend' },
    { id: 'card-103', columnId: 'in_progress', title: 'Refactor immutable Redux-style reducers', description: 'Prevent accidental array/object mutations in board state.', tag: 'Frontend' },
    { id: 'card-104', columnId: 'review', title: 'Audit CSP headers and XSS protections', description: 'Verify script-src directives and DOMPurify sanitization rules.', tag: 'DevOps' },
    { id: 'card-105', columnId: 'done', title: 'Configure GitHub Actions CI pipeline', description: 'Run test suites, linting, and auto-build previews on PRs.', tag: 'DevOps' }
  ]
};

// Global Immutable State
let boardState = null;
let draggedCardId = null;

// DOM Elements
const boardContainer = document.getElementById('boardContainer');
const addCardModalBtn = document.getElementById('addCardModalBtn');
const resetBoardBtn = document.getElementById('resetBoardBtn');
const addCardModal = document.getElementById('addCardModal');
const cancelCardModalBtn = document.getElementById('cancelCardModalBtn');
const createCardForm = document.getElementById('createCardForm');

// Load State from LocalStorage
function loadBoardState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      boardState = Object.freeze(JSON.parse(raw));
    } else {
      boardState = Object.freeze(structuredClone(initialBoardState));
      saveBoardState(boardState);
    }
  } catch (err) {
    console.error('Failed loading state from storage:', err);
    boardState = Object.freeze(structuredClone(initialBoardState));
  }
}

// Persist State to LocalStorage
function saveBoardState(newState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (err) {
    console.error('Failed persisting state:', err);
  }
}

// Pure Immutable Reducer: Move Card
function moveCardImmutable(state, cardId, targetColumnId, targetIndex = null) {
  // Find card
  const card = state.tasks.find(t => t.id === cardId);
  if (!card) return state;

  // Filter out moved card from task list
  const remainingTasks = state.tasks.filter(t => t.id !== cardId);
  const updatedCard = { ...card, columnId: targetColumnId };

  let newTasks;
  if (targetIndex !== null && targetIndex >= 0) {
    // Collect tasks in destination column
    const colTasks = remainingTasks.filter(t => t.columnId === targetColumnId);
    const otherTasks = remainingTasks.filter(t => t.columnId !== targetColumnId);

    colTasks.splice(targetIndex, 0, updatedCard);
    newTasks = [...otherTasks, ...colTasks];
  } else {
    newTasks = [...remainingTasks, updatedCard];
  }

  // Return new frozen immutable state
  return Object.freeze({
    ...state,
    tasks: newTasks
  });
}

// Pure Immutable Reducer: Add Card
function addCardImmutable(state, newCardData) {
  const newCard = {
    id: `card-${Date.now()}`,
    ...newCardData
  };

  return Object.freeze({
    ...state,
    tasks: [...state.tasks, newCard]
  });
}

// Pure Immutable Reducer: Delete Card
function deleteCardImmutable(state, cardId) {
  return Object.freeze({
    ...state,
    tasks: state.tasks.filter(t => t.id !== cardId)
  });
}

// Render Board UI
function renderBoard() {
  boardContainer.innerHTML = '';

  boardState.columns.forEach(column => {
    const colTasks = boardState.tasks.filter(t => t.columnId === column.id);

    const colEl = document.createElement('div');
    colEl.className = 'kanban-column';
    colEl.setAttribute('data-column-id', column.id);

    // Header
    colEl.innerHTML = `
      <div class="column-header">
        <div class="column-title-group">
          <span class="col-indicator indicator-${column.color}"></span>
          <h2>${escapeHtml(column.title)}</h2>
        </div>
        <span class="card-count-badge">${colTasks.length}</span>
      </div>
      <div class="cards-drop-zone" data-column-id="${column.id}"></div>
    `;

    const dropZone = colEl.querySelector('.cards-drop-zone');

    // Render Cards
    colTasks.forEach(task => {
      const cardEl = document.createElement('article');
      cardEl.className = 'task-card';
      cardEl.setAttribute('draggable', 'true');
      cardEl.setAttribute('data-card-id', task.id);

      cardEl.innerHTML = `
        <div class="card-top">
          <span class="tag-badge tag-${task.tag.toLowerCase()}">${escapeHtml(task.tag)}</span>
          <button class="btn-card-del" title="Delete card" data-card-id="${task.id}">&times;</button>
        </div>
        <h3 class="card-title">${escapeHtml(task.title)}</h3>
        <p class="card-description">${escapeHtml(task.description || '')}</p>
      `;

      // HTML5 Drag Events on Card
      cardEl.addEventListener('dragstart', handleDragStart);
      cardEl.addEventListener('dragend', handleDragEnd);

      // Delete Button Event
      const delBtn = cardEl.querySelector('.btn-card-del');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextState = deleteCardImmutable(boardState, task.id);
        commitState(nextState);
      });

      dropZone.appendChild(cardEl);
    });

    // HTML5 Drop Zone Events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    boardContainer.appendChild(colEl);
  });
}

// HTML5 Drag and Drop Handlers
function handleDragStart(e) {
  draggedCardId = this.getAttribute('data-card-id');
  this.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedCardId);
}

function handleDragEnd() {
  this.classList.remove('is-dragging');
  document.querySelectorAll('.cards-drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
  });
  draggedCardId = null;
}

function handleDragOver(e) {
  e.preventDefault(); // Necessary for allowing drop
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  // Only remove if leaving the drop container itself
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
  const targetColumnId = this.getAttribute('data-column-id');

  if (!cardId || !targetColumnId) return;

  // Calculate target index relative to cards in this dropzone
  const afterElement = getDragAfterElement(this, e.clientY);
  let targetIndex = null;
  if (afterElement) {
    const afterCardId = afterElement.getAttribute('data-card-id');
    const colCards = boardState.tasks.filter(t => t.columnId === targetColumnId && t.id !== cardId);
    targetIndex = colCards.findIndex(t => t.id === afterCardId);
  }

  // Pure Immutable State Transition
  const nextState = moveCardImmutable(boardState, cardId, targetColumnId, targetIndex);
  commitState(nextState);
}

// Helper to determine exact drop placement position
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-card:not(.is-dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Commit & Persist State Change
function commitState(newState) {
  boardState = newState;
  saveBoardState(boardState);
  renderBoard();
}

// Modal Handlers
addCardModalBtn.addEventListener('click', () => {
  addCardModal.style.display = 'flex';
  document.getElementById('cardTitleInput').focus();
});

cancelCardModalBtn.addEventListener('click', () => {
  addCardModal.style.display = 'none';
  createCardForm.reset();
});

createCardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('cardTitleInput').value.trim();
  const description = document.getElementById('cardDescInput').value.trim();
  const columnId = document.getElementById('cardColSelect').value;
  const tag = document.getElementById('cardTagSelect').value;

  if (!title) return;

  const nextState = addCardImmutable(boardState, {
    title,
    description,
    columnId,
    tag
  });

  commitState(nextState);

  createCardForm.reset();
  addCardModal.style.display = 'none';
});

// Reset Default Board
resetBoardBtn.addEventListener('click', () => {
  if (confirm('Reset board to default sample state?')) {
    const nextState = Object.freeze(structuredClone(initialBoardState));
    commitState(nextState);
  }
});

// Escape HTML utility
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
  loadBoardState();
  renderBoard();
});
