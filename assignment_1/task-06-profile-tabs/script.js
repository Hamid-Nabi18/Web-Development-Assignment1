// Task 6: Profile Settings Dashboard Tabs Script
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const toastEl = document.getElementById('toastNotification');

  function switchTab(newTab) {
    // 1. Deactivate all tabs
    tabButtons.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // 2. Hide all tab panels
    tabPanels.forEach(panel => {
      panel.classList.remove('active');
      panel.hidden = true;
    });

    // 3. Activate selected tab
    newTab.classList.add('active');
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');
    newTab.focus();

    // 4. Reveal associated panel
    const targetPanelId = newTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    }
  }

  // Click Event Listener
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab);
    });

    // WAI-ARIA Keyboard Navigation: ArrowLeft / ArrowRight / Home / End
    tab.addEventListener('keydown', (e) => {
      const currentIndex = tabButtons.indexOf(tab);
      let targetIndex;

      switch (e.key) {
        case 'ArrowRight':
          targetIndex = (currentIndex + 1) % tabButtons.length;
          break;
        case 'ArrowLeft':
          targetIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
          break;
        case 'Home':
          targetIndex = 0;
          break;
        case 'End':
          targetIndex = tabButtons.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      switchTab(tabButtons[targetIndex]);
    });
  });

  // Global Toast Feedback Helper
  window.showToast = function(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  };
});
