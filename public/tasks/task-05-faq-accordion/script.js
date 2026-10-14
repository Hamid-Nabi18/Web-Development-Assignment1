// Task 5: Expandable Help Center Panel Script
document.addEventListener('DOMContentLoaded', () => {
  const accordionContainer = document.getElementById('faqAccordion');
  if (!accordionContainer) return;

  const accordionItems = accordionContainer.querySelectorAll('.accordion-item');

  accordionContainer.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;

    const currentItem = header.closest('.accordion-item');
    const isCurrentlyActive = currentItem.classList.contains('active');

    // Enforce single-item accordion behavior:
    // First, collapse ALL currently active items
    accordionItems.forEach(item => {
      item.classList.remove('active');
      const btn = item.querySelector('.accordion-header');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    // If the clicked item was not active, open it now
    if (!isCurrentlyActive) {
      currentItem.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
    }
  });

  // Deep linking support via URL hash on load
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement && targetElement.classList.contains('accordion-header')) {
      targetElement.click();
    }
  }
});
