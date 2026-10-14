// Task 9: Flash Sale Timer & Carousel Script
document.addEventListener('DOMContentLoaded', () => {
  // 1. LIVE PROMOTIONAL COUNTDOWN CLOCK
  // End target: 3 days, 14 hours, 22 minutes from today (or dynamic midnight loop)
  const countdownDurationMs = (3 * 24 * 60 * 60 + 14 * 60 * 60 + 22 * 60 + 45) * 1000;
  let targetTime = Date.now() + countdownDurationMs;

  const daysVal = document.getElementById('daysVal');
  const hoursVal = document.getElementById('hoursVal');
  const minsVal = document.getElementById('minsVal');
  const secsVal = document.getElementById('secsVal');

  function updateCountdown() {
    const now = Date.now();
    let diff = targetTime - now;

    if (diff <= 0) {
      // Reset loop for ongoing promotional demo
      targetTime = Date.now() + countdownDurationMs;
      diff = countdownDurationMs;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysVal.textContent = String(days).padStart(2, '0');
    hoursVal.textContent = String(hours).padStart(2, '0');
    minsVal.textContent = String(minutes).padStart(2, '0');
    secsVal.textContent = String(seconds).padStart(2, '0');
  }

  // Interval Timing Loop
  updateCountdown();
  const timerInterval = setInterval(updateCountdown, 1000);

  // 2. RESPONSIVE PRODUCT CAROUSEL
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dotBtns = Array.from(document.querySelectorAll('.dot-btn'));
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const slideCounter = document.getElementById('slideCounter');
  const autoplayToggle = document.getElementById('autoplayToggle');

  let currentSlideIndex = 0;
  let isAutoplay = true;
  let autoplayTimer = null;

  function goToSlide(index) {
    // Wrap around boundaries
    if (index < 0) {
      currentSlideIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    // Update slides
    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update active pagination dots
    dotBtns.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });

    // Update counter
    slideCounter.textContent = `Slide ${currentSlideIndex + 1} of ${slides.length}`;
  }

  // Switching Controls
  prevBtn.addEventListener('click', () => {
    goToSlide(currentSlideIndex - 1);
    restartAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentSlideIndex + 1);
    restartAutoplay();
  });

  // Pagination Dot Clicks
  dotBtns.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(targetIndex);
      restartAutoplay();
    });
  });

  // Autoplay functionality
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentSlideIndex + 1);
    }, 4500);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    if (isAutoplay) {
      startAutoplay();
    }
  }

  autoplayToggle.addEventListener('click', () => {
    isAutoplay = !isAutoplay;
    if (isAutoplay) {
      autoplayToggle.textContent = 'Pause Auto-play';
      startAutoplay();
    } else {
      autoplayToggle.textContent = 'Resume Auto-play';
      stopAutoplay();
    }
  });

  // Keyboard navigation (ArrowLeft / ArrowRight)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(currentSlideIndex - 1);
      restartAutoplay();
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentSlideIndex + 1);
      restartAutoplay();
    }
  });

  startAutoplay();
});
