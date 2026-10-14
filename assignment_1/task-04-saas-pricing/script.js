// Task 4: SaaS Subscription Tiers Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  const billingToggle = document.getElementById('billingToggle');
  const priceAmounts = document.querySelectorAll('.price-amount');
  const billingNotes = document.querySelectorAll('.billing-note');
  const monthlyLabel = document.getElementById('monthlyLabel');
  const annualLabel = document.getElementById('annualLabel');

  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;

    if (isAnnual) {
      monthlyLabel.style.color = 'var(--text-muted)';
      annualLabel.style.color = '#fff';
    } else {
      monthlyLabel.style.color = '#fff';
      annualLabel.style.color = 'var(--text-muted)';
    }

    priceAmounts.forEach(el => {
      const targetPrice = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
      el.textContent = targetPrice;
    });

    billingNotes.forEach(el => {
      const targetNote = isAnnual ? el.getAttribute('data-note-annual') : el.getAttribute('data-note-monthly');
      el.textContent = targetNote;
    });
  });
});
