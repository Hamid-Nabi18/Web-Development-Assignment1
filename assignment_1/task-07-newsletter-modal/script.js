// Task 7: Newsletter Sign-Up Overlay Script
document.addEventListener('DOMContentLoaded', () => {
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const doneModalBtn = document.getElementById('doneModalBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalDialog = document.getElementById('modalDialog');
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const modalSuccess = document.getElementById('modalSuccess');

  let previousActiveElement = null;

  // Open Modal Function
  function openModal() {
    previousActiveElement = document.activeElement;

    // 1. Reveal modal
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');

    // 2. Lock page scroll (Essential UX requirement)
    document.body.style.overflow = 'hidden';

    // 3. Shift focus into the modal
    setTimeout(() => {
      newsletterEmail.focus();
    }, 50);

    // 4. Attach Escape key listener
    document.addEventListener('keydown', handleKeyDown);
  }

  // Close Modal Function
  function closeModal() {
    // 1. Smoothly fade out
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');

    // 2. Restore page scroll
    document.body.style.overflow = '';

    // 3. Remove Escape key listener
    document.removeEventListener('keydown', handleKeyDown);

    // 4. Restore previous focus
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }

    // Reset form state after transition completes
    setTimeout(() => {
      newsletterForm.style.display = 'flex';
      modalSuccess.style.display = 'none';
      newsletterForm.reset();
    }, 300);
  }

  // Trigger Open
  openModalBtn.addEventListener('click', openModal);

  // Triple Closure Interactions:
  // 1. Close icon button click
  closeModalBtn.addEventListener('click', closeModal);

  // 2. Backdrop click (closing when clicking on backdrop, but not inside modalDialog)
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // 3. Keyboard Escape key input
  function handleKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeModal();
    }
  }

  // Done button
  if (doneModalBtn) {
    doneModalBtn.addEventListener('click', closeModal);
  }

  // Handle Form Submission
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email) return;

    newsletterForm.style.display = 'none';
    modalSuccess.style.display = 'block';
  });
});
