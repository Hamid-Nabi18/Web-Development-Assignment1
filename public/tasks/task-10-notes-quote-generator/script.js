// Task 10: Notes App & Quote Generator Script
document.addEventListener('DOMContentLoaded', () => {
  // 1. QUOTES REPOSITORY
  const quotes = [
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
    { text: "Truth can only be found in one place: the code.", author: "Robert C. Martin" }
  ];

  let currentQuoteIndex = 0;

  // Quote Widget Elements
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const copyIcon = document.getElementById('copyIcon');
  const insertQuoteBtn = document.getElementById('insertQuoteBtn');
  const copyToast = document.getElementById('copyToast');

  // Markdown Editor Elements
  const markdownInput = document.getElementById('markdownInput');
  const htmlPreview = document.getElementById('htmlPreview');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const clearEditorBtn = document.getElementById('clearEditorBtn');
  const sampleEditorBtn = document.getElementById('sampleEditorBtn');

  // Sample markdown text
  const sampleMarkdown = `# Software Architecture Notes

Specialized notes on building **resilient**, *high-performance* web applications.

## Core Architectural Pillars
- **Immutability**: Prevent unwanted side-effects across components.
- **Observability**: Real-time instrumentation and structured logging.
- **Accessibility**: First-class keyboard navigation and WCAG adherence.

### Code Demonstration
\`\`\`javascript
// Pure functional transformation
const filterActiveTasks = (tasks) => tasks.filter(t => !t.completed);
console.log("Modular logic initialized.");
\`\`\`

> "Simplicity is prerequisite for reliability."
> — *Edsger W. Dijkstra*

For further details, inspect the [Web Standards](https://www.w3.org) documentation.

---
*Created with the Notes App dual-pane markdown previewer.*
`;

  // Function to show random quote
  function setRandomQuote() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * quotes.length);
    } while (nextIndex === currentQuoteIndex && quotes.length > 1);

    currentQuoteIndex = nextIndex;
    const q = quotes[currentQuoteIndex];
    quoteTextEl.textContent = q.text;
    quoteAuthorEl.innerHTML = `&mdash; ${q.author}`;
  }

  // One-Click Clipboard Copying
  function copyQuoteToClipboard() {
    const q = quotes[currentQuoteIndex];
    const textToCopy = `"${q.text}" — ${q.author}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(showCopiedFeedback).catch(fallbackCopy);
    } else {
      fallbackCopy(textToCopy);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopiedFeedback();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  }

  function showCopiedFeedback() {
    copyBtnText.textContent = 'Copied!';
    copyIcon.innerHTML = '&#10003;';
    copyToast.classList.add('show');

    setTimeout(() => {
      copyBtnText.textContent = 'Copy Quote';
      copyIcon.innerHTML = '&#128203;';
      copyToast.classList.remove('show');
    }, 2000);
  }

  // Insert Quote into note
  function insertQuoteIntoNote() {
    const q = quotes[currentQuoteIndex];
    const quoteMarkdown = `\n\n> "${q.text}"\n> — *${q.author}*\n\n`;
    markdownInput.value += quoteMarkdown;
    updateMarkdownPreview();
    markdownInput.scrollTop = markdownInput.scrollHeight;
  }

  // 2. PARSE MARKDOWN INTO LIVE HTML ELEMENTS INSTANTLY
  function parseMarkdown(md) {
    if (!md) return '<p style="color: #64748b; font-style: italic;">Nothing to preview yet. Start typing on the left!</p>';

    // Escape raw HTML tags for safety
    let text = md.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;');

    // Code blocks ```js ... ```
    text = text.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
    });

    // Horizontal rule
    text = text.replace(/^---$/gm, '<hr>');

    // Headers (#, ##, ###, ####)
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes (> text)
    text = text.replace(/^\&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

    // Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists (- item)
    text = text.replace(/^\- (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>(\n)?)+/g, '<ul>$&</ul>');

    // Paragraphs (lines separated by double newlines)
    const blocks = text.split(/\n\n+/);
    text = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Don't wrap tags that are already headers, lists, pre, blockquotes, hr
      if (/^<(h[1-6]|ul|pre|blockquote|hr)/.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return text;
  }

  // Update Preview & Stats
  function updateMarkdownPreview() {
    const rawText = markdownInput.value;

    // Render HTML instantly
    htmlPreview.innerHTML = parseMarkdown(rawText);

    // Update Word & Character Counts
    const characters = rawText.length;
    const words = rawText.trim() === '' ? 0 : rawText.trim().split(/\s+/).length;

    charCount.textContent = characters;
    wordCount.textContent = words;
  }

  // Event Listeners
  newQuoteBtn.addEventListener('click', setRandomQuote);
  copyQuoteBtn.addEventListener('click', copyQuoteToClipboard);
  insertQuoteBtn.addEventListener('click', insertQuoteIntoNote);

  markdownInput.addEventListener('input', updateMarkdownPreview);

  clearEditorBtn.addEventListener('click', () => {
    markdownInput.value = '';
    updateMarkdownPreview();
    markdownInput.focus();
  });

  sampleEditorBtn.addEventListener('click', () => {
    markdownInput.value = sampleMarkdown;
    updateMarkdownPreview();
    markdownInput.focus();
  });

  // Init with sample
  markdownInput.value = sampleMarkdown;
  updateMarkdownPreview();
});
