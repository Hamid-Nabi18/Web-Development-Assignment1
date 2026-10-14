// Task 14: Interactive Canvas Drawing Suite Script
// HTML5 Canvas Graphics API with shapes, undo stack, and artwork export
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // DOM Controls
  const toolButtons = document.querySelectorAll('.tool-choice');
  const nativeColorPicker = document.getElementById('nativeColorPicker');
  const colorHexLabel = document.getElementById('colorHexLabel');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const strokeSizeSlider = document.getElementById('strokeSizeSlider');
  const sizeVal = document.getElementById('sizeVal');
  const undoStrokeBtn = document.getElementById('undoStrokeBtn');
  const redoStrokeBtn = document.getElementById('redoStrokeBtn');
  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  const exportBtn = document.getElementById('exportBtn');

  // Drawing State
  let currentTool = 'brush'; // 'brush', 'line', 'rect', 'circle', 'eraser'
  let currentColor = '#3b82f6';
  let currentLineWidth = 4;
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let snapshotBeforeDrag = null;

  // Undo / Redo History Stack
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 30;

  // Initialize Canvas
  function initCanvas() {
    // Fill with pristine white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }

  // Push Canvas Snapshot to Undo Stack
  function saveState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(imageData);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    // New stroke clears redo branch
    redoStack.length = 0;
    updateHistoryUI();
  }

  function updateHistoryUI() {
    undoStrokeBtn.disabled = undoStack.length <= 1; // Always keep base state
    redoStrokeBtn.disabled = redoStack.length === 0;
  }

  function undo() {
    if (undoStack.length <= 1) return;
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    const prevState = undoStack[undoStack.length - 1];
    ctx.putImageData(prevState, 0, 0);
    updateHistoryUI();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    ctx.putImageData(nextState, 0, 0);
    updateHistoryUI();
  }

  // Coordinate Conversion Helper (accounting for canvas scaling)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Mouse / Pointer Event Listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    startX = coords.x;
    startY = coords.y;

    // Save image data snapshot to preview shapes on mousemove
    snapshotBeforeDrag = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
    }

    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY);
      ctx.stroke();
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // Shape preview: restore snapshot first, then draw updated shape
      ctx.putImageData(snapshotBeforeDrag, 0, 0);

      ctx.beginPath();
      ctx.lineWidth = currentLineWidth;
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;

      if (currentTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        const width = coords.x - startX;
        const height = coords.y - startY;
        ctx.strokeRect(startX, startY, width, height);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();
    saveState();
  }

  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Tool Selection
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.getAttribute('data-tool');
    });
  });

  // Color Handling
  function updateActiveColor(colorHex) {
    currentColor = colorHex;
    nativeColorPicker.value = colorHex;
    colorHexLabel.textContent = colorHex.toUpperCase();

    colorSwatches.forEach(swatch => {
      if (swatch.getAttribute('data-color').toLowerCase() === colorHex.toLowerCase()) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  nativeColorPicker.addEventListener('input', (e) => {
    updateActiveColor(e.target.value);
  });

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      updateActiveColor(swatch.getAttribute('data-color'));
    });
  });

  // Line Width Slider
  strokeSizeSlider.addEventListener('input', (e) => {
    currentLineWidth = parseInt(e.target.value, 10);
    sizeVal.textContent = `${currentLineWidth}px`;
  });

  // State Controls
  undoStrokeBtn.addEventListener('click', undo);
  redoStrokeBtn.addEventListener('click', redo);

  clearCanvasBtn.addEventListener('click', () => {
    if (confirm('Clear the entire canvas? This action cannot be undone.')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }
  });

  // Artwork Export (.PNG Download)
  exportBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = dataUrl;
    downloadAnchor.download = `artwork_${Date.now()}.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  });

  // Keyboard Shortcuts (Ctrl+Z for undo, Ctrl+Y for redo)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    }
  });

  initCanvas();
});
