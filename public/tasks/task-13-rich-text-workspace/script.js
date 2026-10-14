// Task 13: Rich Text Workspace Suite Script
// Secure Markdown Editor with XSS Sanitization & Command Pattern History Stack
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const editor = document.getElementById('editorTextarea');
  const sanitizedOutput = document.getElementById('sanitizedOutput');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const historyDepthVal = document.getElementById('historyDepthVal');
  const sanitizeStatus = document.getElementById('sanitizeStatus');
  const auditLogEntries = document.getElementById('auditLogEntries');
  const injectXssBtn = document.getElementById('injectXssBtn');

  let blockedThreatsCount = 0;

  // 1. COMMAND PATTERN HISTORY STACK
  class TextCommand {
    constructor(editorEl, previousText, newText, prevSelection, newSelection) {
      this.editor = editorEl;
      this.previousText = previousText;
      this.newText = newText;
      this.prevSelection = prevSelection;
      this.newSelection = newSelection;
    }

    execute() {
      this.editor.value = this.newText;
      if (this.newSelection) {
        this.editor.setSelectionRange(this.newSelection.start, this.newSelection.end);
      }
      this.editor.dispatchEvent(new Event('render'));
    }

    undo() {
      this.editor.value = this.previousText;
      if (this.prevSelection) {
        this.editor.setSelectionRange(this.prevSelection.start, this.prevSelection.end);
      }
      this.editor.dispatchEvent(new Event('render'));
    }
  }

  class CommandHistory {
    constructor() {
      this.undoStack = [];
      this.redoStack = [];
      this.maxStackSize = 50;
    }

    executeCommand(command) {
      command.execute();
      this.undoStack.push(command);
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift();
      }
      // Any new command clears the redo branch
      this.redoStack = [];
      this.updateUI();
    }

    undo() {
      if (this.undoStack.length === 0) return;
      const cmd = this.undoStack.pop();
      cmd.undo();
      this.redoStack.push(cmd);
      this.updateUI();
    }

    redo() {
      if (this.redoStack.length === 0) return;
      const cmd = this.redoStack.pop();
      cmd.execute();
      this.undoStack.push(cmd);
      this.updateUI();
    }

    updateUI() {
      undoBtn.disabled = this.undoStack.length === 0;
      redoBtn.disabled = this.redoStack.length === 0;
      historyDepthVal.textContent = this.undoStack.length;
    }
  }

  const history = new CommandHistory();

  // Helper to apply formatting command
  function applyFormattingCommand(prefix, suffix = '', defaultText = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const oldText = editor.value;

    const selected = oldText.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newText = oldText.substring(0, start) + replacement + oldText.substring(end);

    const newStart = start + prefix.length;
    const newEnd = newStart + selected.length;

    const cmd = new TextCommand(
      editor,
      oldText,
      newText,
      { start, end },
      { start: newStart, end: newEnd }
    );

    history.executeCommand(cmd);
    editor.focus();
  }

  // 2. CONTENT SANITIZATION ENGINE (Defending against Malicious XSS Vectors)
  function sanitizeHtml(dirtyHtml) {
    // Parse into detached DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirtyHtml, 'text/html');

    // List of forbidden dangerous elements
    const forbiddenTags = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'BASE', 'META', 'LINK', 'STYLE', 'APPLET', 'FORM'];

    // List of dangerous protocols
    const forbiddenProtocols = ['javascript:', 'data:', 'vbscript:'];

    const elements = doc.body.querySelectorAll('*');
    elements.forEach(node => {
      // 1. Remove dangerous tags
      if (forbiddenTags.includes(node.tagName)) {
        logThreat(`Blocked hostile element: <${node.tagName.toLowerCase()}>`);
        node.remove();
        return;
      }

      // 2. Strip dangerous event handlers (onerror, onload, onclick, etc.)
      const attributes = Array.from(node.attributes);
      attributes.forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase().trim();

        // Check event handler pattern (e.g. on*)
        if (name.startsWith('on')) {
          logThreat(`Blocked inline event handler: ${name}="${attr.value}" on <${node.tagName.toLowerCase()}>`);
          node.removeAttribute(attr.name);
        }

        // Check href/src protocols
        if (name === 'href' || name === 'src') {
          if (forbiddenProtocols.some(proto => value.startsWith(proto))) {
            logThreat(`Neutralized malicious URI protocol: ${attr.name}="${attr.value}"`);
            node.removeAttribute(attr.name);
            node.setAttribute(attr.name, '#blocked-unsafe-uri');
          }
        }
      });
    });

    return doc.body.innerHTML;
  }

  function logThreat(detail) {
    blockedThreatsCount++;
    sanitizeStatus.textContent = `${blockedThreatsCount} threat${blockedThreatsCount === 1 ? '' : 's'} blocked`;
    sanitizeStatus.style.color = '#ef4444';

    const item = document.createElement('div');
    item.className = 'log-item neutralized';
    const timestamp = new Date().toLocaleTimeString();
    item.textContent = `[${timestamp}] [XSS-BLOCKED] ${detail}`;
    auditLogEntries.prepend(item);
  }

  // Basic markdown parser
  function parseMarkdownToHtml(md) {
    if (!md) return '<p style="color: #64748b;">Editor is empty.</p>';

    let text = md;
    // Headings
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquote
    text = text.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold & Italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Lists
    text = text.replace(/^\- (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>(\n)?)+/g, '<ul>$&</ul>');

    // Paragraphs
    const blocks = text.split(/\n\n+/);
    return blocks.map(b => {
      const trimmed = b.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|ul|pre|blockquote|div|p)/i.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  function renderSanitizedContent() {
    const rawMarkdown = editor.value;
    const rawHtml = parseMarkdownToHtml(rawMarkdown);
    const safeHtml = sanitizeHtml(rawHtml);
    sanitizedOutput.innerHTML = safeHtml;
  }

  // Handle typing input with debounced command capture
  let typingTimer = null;
  let lastCapturedText = editor.value;

  editor.addEventListener('input', () => {
    renderSanitizedContent();

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      const currentText = editor.value;
      if (currentText !== lastCapturedText) {
        const cmd = new TextCommand(
          editor,
          lastCapturedText,
          currentText,
          null,
          { start: editor.selectionStart, end: editor.selectionEnd }
        );
        history.executeCommand(cmd);
        lastCapturedText = currentText;
      }
    }, 600);
  });

  editor.addEventListener('render', () => {
    lastCapturedText = editor.value;
    renderSanitizedContent();
  });

  // Toolbar formatting commands
  document.getElementById('cmdBold').addEventListener('click', () => applyFormattingCommand('**', '**', 'bold text'));
  document.getElementById('cmdItalic').addEventListener('click', () => applyFormattingCommand('*', '*', 'italic text'));
  document.getElementById('cmdH1').addEventListener('click', () => applyFormattingCommand('# ', '', 'Document Title'));
  document.getElementById('cmdH2').addEventListener('click', () => applyFormattingCommand('## ', '', 'Section Heading'));
  document.getElementById('cmdQuote').addEventListener('click', () => applyFormattingCommand('> ', '', 'Quoted insight'));
  document.getElementById('cmdCode').addEventListener('click', () => applyFormattingCommand('```\n', '\n```', '// code snippet'));
  document.getElementById('cmdList').addEventListener('click', () => applyFormattingCommand('- ', '', 'List item'));
  document.getElementById('cmdLink').addEventListener('click', () => applyFormattingCommand('[', '](https://example.com)', 'hyperlink'));

  // History toolbar triggers
  undoBtn.addEventListener('click', () => history.undo());
  redoBtn.addEventListener('click', () => history.redo());

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        history.redo();
      } else {
        history.undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      history.redo();
    }
  });

  // Inject Test XSS Vector Button
  injectXssBtn.addEventListener('click', () => {
    const maliciousPayload = `\n\n# Security Attack Simulation
<script>alert("Hostile script execution!");</script>
<img src="invalid-image.jpg" onerror="alert('Exploit trigger!')">
<a href="javascript:alert('Stolen Cookies')">Dangerous Link Payload</a>

Safe text resumes normally.`;

    applyFormattingCommand(maliciousPayload);
  });

  // Initial Content
  const starterContent = `# Secure Architectural Blueprint

This workspace guarantees **resilience against XSS vulnerabilities** while recording every modification in a custom \`Command\` history tree.

## Security Guarantees
- Strict elimination of \`<script>\` vectors.
- Automated removal of \`onerror\`, \`onload\`, and all inline event attributes.
- Protocol restrictions rejecting dangerous \`javascript:\` URIs.

> Test the security engine by clicking the **Test XSS Vector** button in the toolbar above!`;

  editor.value = starterContent;
  lastCapturedText = starterContent;
  renderSanitizedContent();
});
