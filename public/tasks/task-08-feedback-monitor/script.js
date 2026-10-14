// Task 8: Feedback Text Area Monitor Script
document.addEventListener('DOMContentLoaded', () => {
  const MAX_LIMIT = 250;
  const CAUTION_THRESHOLD = 40;
  const DANGER_THRESHOLD = 15;

  // DOM Elements
  const userEmail = document.getElementById('userEmail');
  const emailStatusIcon = document.getElementById('emailStatusIcon');
  const emailErrorMsg = document.getElementById('emailErrorMsg');
  const emailSuccessMsg = document.getElementById('emailSuccessMsg');

  const feedbackText = document.getElementById('feedbackText');
  const remainingCount = document.getElementById('remainingCount');
  const meterFill = document.getElementById('meterFill');
  const textareaContainer = document.querySelector('.textarea-container');
  const warningCallout = document.getElementById('warningCallout');

  const submitBtn = document.getElementById('submitBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const submissionSuccess = document.getElementById('submissionSuccess');
  const submittedSummary = document.getElementById('submittedSummary');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Email Validation Pattern (Standard RFC 5322 pattern check)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  let isEmailValid = false;
  let isFeedbackValid = false;

  // Validate Email Input
  function validateEmail() {
    const value = userEmail.value.trim();

    if (value.length === 0) {
      userEmail.classList.remove('valid', 'invalid');
      emailStatusIcon.textContent = '';
      emailErrorMsg.classList.remove('visible');
      emailSuccessMsg.classList.remove('visible');
      isEmailValid = false;
    } else if (EMAIL_REGEX.test(value)) {
      userEmail.classList.add('valid');
      userEmail.classList.remove('invalid');
      emailStatusIcon.textContent = '\u2713';
      emailErrorMsg.classList.remove('visible');
      emailSuccessMsg.classList.add('visible');
      isEmailValid = true;
    } else {
      userEmail.classList.add('invalid');
      userEmail.classList.remove('valid');
      emailStatusIcon.textContent = '\u2717';
      emailErrorMsg.classList.add('visible');
      emailSuccessMsg.classList.remove('visible');
      isEmailValid = false;
    }

    updateSubmitState();
  }

  // Update Character Counter & Visual Warning States
  function updateCharacterMonitor() {
    const currentLength = feedbackText.value.length;
    const remaining = MAX_LIMIT - currentLength;

    remainingCount.textContent = remaining;

    // Progress bar fill %
    const usedPercentage = Math.min(100, (currentLength / MAX_LIMIT) * 100);
    meterFill.style.width = `${usedPercentage}%`;

    // Visual warning states when limits approach zero
    textareaContainer.classList.remove('state-warning', 'state-danger');
    warningCallout.textContent = '';
    warningCallout.style.color = '';

    if (remaining <= 0) {
      textareaContainer.classList.add('state-danger');
      warningCallout.textContent = 'Maximum character limit reached!';
      warningCallout.style.color = 'var(--color-red)';
    } else if (remaining <= DANGER_THRESHOLD) {
      textareaContainer.classList.add('state-danger');
      warningCallout.textContent = `Critical: Only ${remaining} characters remaining before threshold limit!`;
      warningCallout.style.color = 'var(--color-red)';
    } else if (remaining <= CAUTION_THRESHOLD) {
      textareaContainer.classList.add('state-warning');
      warningCallout.textContent = `Caution: Approaching threshold (${remaining} characters left).`;
      warningCallout.style.color = 'var(--color-amber)';
    }

    isFeedbackValid = currentLength > 0 && remaining >= 0;
    updateSubmitState();
  }

  // Check overall form readiness
  function updateSubmitState() {
    submitBtn.disabled = !(isEmailValid && isFeedbackValid);
  }

  // Event Listeners
  userEmail.addEventListener('input', validateEmail);
  userEmail.addEventListener('blur', validateEmail);

  feedbackText.addEventListener('input', updateCharacterMonitor);

  // Form Submit
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isEmailValid || !isFeedbackValid) return;

    feedbackForm.style.display = 'none';
    submittedSummary.textContent = `Thank you for contacting us from ${userEmail.value}. Your feedback message (${feedbackText.value.length} characters) was logged successfully.`;
    submissionSuccess.style.display = 'block';
  });

  // Reset
  resetFormBtn.addEventListener('click', () => {
    feedbackForm.reset();
    userEmail.classList.remove('valid', 'invalid');
    emailStatusIcon.textContent = '';
    emailErrorMsg.classList.remove('visible');
    emailSuccessMsg.classList.remove('visible');
    textareaContainer.classList.remove('state-warning', 'state-danger');
    remainingCount.textContent = MAX_LIMIT;
    meterFill.style.width = '0%';
    warningCallout.textContent = '';
    isEmailValid = false;
    isFeedbackValid = false;
    updateSubmitState();

    submissionSuccess.style.display = 'none';
    feedbackForm.style.display = 'block';
  });

  // Init
  updateCharacterMonitor();
});
