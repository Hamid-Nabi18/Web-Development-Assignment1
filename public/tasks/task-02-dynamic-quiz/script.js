// Task 2: Dynamic Multiple-Choice Quiz Script
// Array of question objects
const quizData = [
  {
    question: "Which HTML5 semantic element is most suitable for encapsulating independent, self-contained syndicatable content?",
    options: [
      "<section>",
      "<article>",
      "<aside>",
      "<div>"
    ],
    correctIndex: 1,
    explanation: "The <article> element represents a complete, self-contained composition in a document, page, or site."
  },
  {
    question: "In CSS Grid Layout, which CSS function creates an automatically repeating track pattern that accommodates items without overflowing?",
    options: [
      "repeat(auto-fit, minmax(250px, 1fr))",
      "flex-basis: calc(100% / 3)",
      "grid-template: span auto",
      "columns: auto 3"
    ],
    correctIndex: 0,
    explanation: "repeat(auto-fit, minmax(...)) dynamically expands and wraps grid columns based on the available container width."
  },
  {
    question: "What will `typeof NaN` evaluate to in JavaScript?",
    options: [
      "'undefined'",
      "'null'",
      "'number'",
      "'NaN'"
    ],
    correctIndex: 2,
    explanation: "In JavaScript, NaN ('Not-a-Number') has a primitive numeric type ('number') according to the IEEE 754 floating-point standard."
  },
  {
    question: "Which Web API interface enables asynchronous observation of the intersection of target elements with an ancestor viewport?",
    options: [
      "MutationObserver",
      "ResizeObserver",
      "IntersectionObserver",
      "PerformanceObserver"
    ],
    correctIndex: 2,
    explanation: "The Intersection Observer API asynchronously observes changes in the intersection of a target element with an ancestor element or top-level viewport."
  },
  {
    question: "Which of the following creates a deep clone of a plain serializable JavaScript object without external dependencies in modern browsers?",
    options: [
      "Object.assign({}, target)",
      "structuredClone(target)",
      "{ ...target }",
      "target.slice(0)"
    ],
    correctIndex: 1,
    explanation: "structuredClone() is built into modern browsers to create deep copies of JavaScript values including nested objects, dates, and arrays."
  }
];

// State
let currentQuestionIndex = 0;
let score = 0;
let answerSubmitted = false;

// DOM Elements
const questionProgressEl = document.getElementById('questionProgress');
const progressBarEl = document.getElementById('progressBar');
const runningScoreEl = document.getElementById('runningScore');
const questionTextEl = document.getElementById('questionText');
const optionsGridEl = document.getElementById('optionsGrid');
const feedbackBannerEl = document.getElementById('feedbackBanner');
const nextBtn = document.getElementById('nextBtn');
const questionContainer = document.getElementById('questionContainer');
const resultScreen = document.getElementById('resultScreen');
const finalScoreText = document.getElementById('finalScoreText');
const finalPercentText = document.getElementById('finalPercentText');
const restartBtn = document.getElementById('restartBtn');

// Initialize Quiz
function initQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answerSubmitted = false;
  runningScoreEl.textContent = score;
  questionContainer.style.display = 'block';
  resultScreen.style.display = 'none';
  nextBtn.style.display = 'inline-block';
  renderQuestion();
}

// Render Question on the Fly
function renderQuestion() {
  answerSubmitted = false;
  nextBtn.disabled = true;
  feedbackBannerEl.className = 'feedback-banner';
  feedbackBannerEl.textContent = '';

  const currentQ = quizData[currentQuestionIndex];
  const totalQ = quizData.length;

  // Update progress
  questionProgressEl.textContent = `${currentQuestionIndex + 1} of ${totalQ}`;
  progressBarEl.style.width = `${((currentQuestionIndex + 1) / totalQ) * 100}%`;
  questionTextEl.textContent = `${currentQuestionIndex + 1}. ${currentQ.question}`;

  // Clear previous options
  optionsGridEl.innerHTML = '';

  // Render options dynamically
  const prefixes = ['A', 'B', 'C', 'D'];
  currentQ.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('data-index', index);

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'option-prefix';
    prefixSpan.textContent = prefixes[index];

    const textSpan = document.createElement('span');
    textSpan.className = 'option-text';
    textSpan.textContent = optText;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'option-icon';
    iconSpan.innerHTML = '';

    btn.appendChild(prefixSpan);
    btn.appendChild(textSpan);
    btn.appendChild(iconSpan);

    // Event Handler for Option Selection
    btn.addEventListener('click', () => handleOptionSelect(index));

    optionsGridEl.appendChild(btn);
  });
}

// Evaluate Answer, Color Choices, Lock Inputs, Track Score
function handleOptionSelect(selectedIndex) {
  if (answerSubmitted) return; // Prevent double trigger
  answerSubmitted = true;

  const currentQ = quizData[currentQuestionIndex];
  const isCorrect = selectedIndex === currentQ.correctIndex;
  const optionButtons = optionsGridEl.querySelectorAll('.option-btn');

  // Input Locking: Lock all inputs immediately
  optionButtons.forEach((btn, idx) => {
    btn.disabled = true; // Lock inputs
    const icon = btn.querySelector('.option-icon');

    if (idx === currentQ.correctIndex) {
      // Correct choice dynamically colored green
      btn.classList.add('correct-choice');
      icon.innerHTML = '&#10003;'; // Checkmark
      btn.setAttribute('aria-checked', 'true');
    } else if (idx === selectedIndex && !isCorrect) {
      // Wrong choice dynamically colored red
      btn.classList.add('wrong-choice');
      icon.innerHTML = '&#10007;'; // Cross mark
      btn.setAttribute('aria-checked', 'true');
    }
  });

  // Track running score
  if (isCorrect) {
    score += 1;
    runningScoreEl.textContent = score;
    feedbackBannerEl.textContent = 'Correct! ' + currentQ.explanation;
    feedbackBannerEl.className = 'feedback-banner show correct';
  } else {
    feedbackBannerEl.textContent = 'Incorrect. ' + currentQ.explanation;
    feedbackBannerEl.className = 'feedback-banner show wrong';
  }

  // Enable Next button or Show Results if last question
  nextBtn.disabled = false;
  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.textContent = 'View Final Results';
  } else {
    nextBtn.textContent = 'Next Question \u2192';
  }
}

// Handle Next Question Advance
nextBtn.addEventListener('click', () => {
  if (!answerSubmitted) return;

  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
});

// Show Results Summary
function showResults() {
  questionContainer.style.display = 'none';
  nextBtn.style.display = 'none';
  resultScreen.style.display = 'block';

  const total = quizData.length;
  const percent = Math.round((score / total) * 100);

  finalScoreText.textContent = `${score}/${total}`;
  finalPercentText.textContent = `${percent}%`;

  const resultTitle = document.getElementById('resultTitle');
  const resultFeedback = document.getElementById('resultFeedback');
  const resultIcon = document.getElementById('resultIcon');

  if (percent >= 80) {
    resultTitle.textContent = 'Outstanding Mastery!';
    resultFeedback.textContent = 'You have demonstrated a comprehensive understanding of modern web engineering fundamentals.';
    resultIcon.innerHTML = '&#127942;';
  } else if (percent >= 60) {
    resultTitle.textContent = 'Good Job!';
    resultFeedback.textContent = 'Solid grasp of core concepts. Review the missed questions to attain complete mastery.';
    resultIcon.innerHTML = '&#128077;';
  } else {
    resultTitle.textContent = 'Review Recommended';
    resultFeedback.textContent = 'Keep practicing web development standards, DOM mechanics, and JavaScript fundamentals!';
    resultIcon.innerHTML = '&#128218;';
  }
}

// Restart Quiz
restartBtn.addEventListener('click', initQuiz);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initQuiz);
