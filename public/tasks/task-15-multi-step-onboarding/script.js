// Task 15: Multi-Step Form with Schema Validation Script
// Multi-Stage Onboarding with Progress Indicators, Schema Validators, and Global State Caching
document.addEventListener('DOMContentLoaded', () => {
  const CACHE_STORAGE_KEY = 'onboarding_wizard_cached_state_v1';

  // Global State Cache
  let formDataCache = {
    fullName: '',
    workEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    teamSize: '',
    primaryCloud: ''
  };

  let currentStep = 1;
  const TOTAL_STEPS = 4;

  // DOM Elements
  const stages = [
    document.getElementById('stage1'),
    document.getElementById('stage2'),
    document.getElementById('stage3'),
    document.getElementById('stage4')
  ];

  const indicators = document.querySelectorAll('.step-indicator');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitWizardBtn = document.getElementById('submitWizardBtn');
  const wizardForm = document.getElementById('wizardForm');
  const completionScreen = document.getElementById('completionScreen');
  const startOverBtn = document.getElementById('startOverBtn');

  // Input Field References
  const fields = {
    fullName: document.getElementById('fullName'),
    workEmail: document.getElementById('workEmail'),
    phoneNumber: document.getElementById('phoneNumber'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    companyName: document.getElementById('companyName'),
    teamSize: document.getElementById('teamSize'),
    primaryCloud: document.getElementById('primaryCloud')
  };

  // 1. GLOBAL STATE CACHING
  function loadCachedData() {
    try {
      const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) {
        formDataCache = { ...formDataCache, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Session storage cache unreadable:', e);
    }

    // Populate DOM inputs from cached values
    Object.keys(fields).forEach(key => {
      if (fields[key] && formDataCache[key] !== undefined) {
        fields[key].value = formDataCache[key];
      }
    });

    checkPasswordCriteria(formDataCache.password || '');
  }

  function saveCache() {
    // Sync current values from DOM into cache
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        formDataCache[key] = fields[key].value;
      }
    });

    try {
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(formDataCache));
    } catch (e) {
      console.warn('Failed to persist session cache:', e);
    }
  }

  // 2. ROBUST SCHEMA VALIDATION RULES PER STEP
  const schemas = {
    step1: () => {
      const errors = {};
      const name = fields.fullName.value.trim();
      const email = fields.workEmail.value.trim();
      const phone = fields.phoneNumber.value.trim();

      if (!name || name.length < 3) {
        errors.fullName = 'Full legal name must contain at least 3 characters.';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errors.workEmail = 'Please provide a valid enterprise email format.';
      }

      const phoneClean = phone.replace(/[^0-9]/g, '');
      if (!phone || phoneClean.length < 8) {
        errors.phoneNumber = 'Phone number requires at least 8 digits.';
      }

      return errors;
    },

    step2: () => {
      const errors = {};
      const pass = fields.password.value;
      const confirm = fields.confirmPassword.value;

      const hasMinLen = pass.length >= 8;
      const hasUpper = /[A-Z]/.test(pass);
      const hasNumber = /[0-9]/.test(pass);

      if (!hasMinLen || !hasUpper || !hasNumber) {
        errors.password = 'Password does not satisfy the three security constraints below.';
      }

      if (!confirm || confirm !== pass) {
        errors.confirmPassword = 'Passwords do not match.';
      }

      return errors;
    },

    step3: () => {
      const errors = {};
      const comp = fields.companyName.value.trim();
      const size = fields.teamSize.value;
      const cloud = fields.primaryCloud.value;

      if (!comp || comp.length < 2) {
        errors.companyName = 'Company name is required.';
      }

      if (!size) {
        errors.teamSize = 'Please select your engineering team size.';
      }

      if (!cloud) {
        errors.primaryCloud = 'Please select a primary cloud provider.';
      }

      return errors;
    }
  };

  function validateCurrentStep() {
    clearErrors();
    const validator = schemas[`step${currentStep}`];
    if (!validator) return true; // Review step has no inputs

    const errors = validator();
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      Object.keys(errors).forEach(fieldId => {
        const input = fields[fieldId];
        const errorEl = document.getElementById(`err-${fieldId}`);
        if (input) input.classList.add('input-error');
        if (errorEl) errorEl.textContent = errors[fieldId];
      });
      return false;
    }

    return true;
  }

  function clearErrors() {
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
  }

  // Live password criteria feedback
  function checkPasswordCriteria(pass) {
    const critLen = document.getElementById('crit-len');
    const critUpper = document.getElementById('crit-upper');
    const critNum = document.getElementById('crit-num');

    if (pass.length >= 8) critLen.classList.add('valid');
    else critLen.classList.remove('valid');

    if (/[A-Z]/.test(pass)) critUpper.classList.add('valid');
    else critUpper.classList.remove('valid');

    if (/[0-9]/.test(pass)) critNum.classList.add('valid');
    else critNum.classList.remove('valid');
  }

  fields.password.addEventListener('input', (e) => {
    checkPasswordCriteria(e.target.value);
  });

  // 3. STEPPER NAVIGATION & PROGRESS INDICATOR
  function updateStepUI() {
    // Manage stages
    stages.forEach((stage, idx) => {
      if (idx + 1 === currentStep) {
        stage.classList.add('active');
      } else {
        stage.classList.remove('active');
      }
    });

    // Manage progress indicators
    indicators.forEach((indicator, idx) => {
      const stepNum = idx + 1;
      indicator.classList.remove('active', 'completed');
      const circle = indicator.querySelector('.step-circle');

      if (stepNum < currentStep) {
        indicator.classList.add('completed');
        circle.innerHTML = '&#10003;';
      } else if (stepNum === currentStep) {
        indicator.classList.add('active');
        circle.textContent = stepNum;
      } else {
        circle.textContent = stepNum;
      }
    });

    // Manage buttons
    prevBtn.disabled = currentStep === 1;

    if (currentStep === TOTAL_STEPS) {
      nextBtn.style.display = 'none';
      submitWizardBtn.style.display = 'inline-block';
      populateReviewSummary();
    } else {
      nextBtn.style.display = 'inline-block';
      submitWizardBtn.style.display = 'none';
    }
  }

  // Populate Review Screen (Step 4) from Cached Values
  function populateReviewSummary() {
    saveCache();
    document.getElementById('rev-name').textContent = formDataCache.fullName || '—';
    document.getElementById('rev-email').textContent = formDataCache.workEmail || '—';
    document.getElementById('rev-phone').textContent = formDataCache.phoneNumber || '—';
    document.getElementById('rev-company').textContent = formDataCache.companyName || '—';
    document.getElementById('rev-teamsize').textContent = formDataCache.teamSize || '—';
    document.getElementById('rev-cloud').textContent = formDataCache.primaryCloud || '—';
  }

  // Next Step Action
  nextBtn.addEventListener('click', () => {
    saveCache();
    if (!validateCurrentStep()) return;

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStepUI();
    }
  });

  // Previous Step Action (preserves cached data without validation barrier)
  prevBtn.addEventListener('click', () => {
    saveCache();
    clearErrors();
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  });

  // Final Form Submission
  wizardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCache();

    // Show completion screen
    wizardForm.style.display = 'none';
    completionScreen.style.display = 'block';

    // Clear session cache on successful submission
    try {
      sessionStorage.removeItem(CACHE_STORAGE_KEY);
    } catch (err) {}
  });

  // Restart Form
  startOverBtn.addEventListener('click', () => {
    wizardForm.reset();
    formDataCache = {};
    currentStep = 1;
    clearErrors();
    completionScreen.style.display = 'none';
    wizardForm.style.display = 'block';
    updateStepUI();
  });

  // Auto-save cache on input blur/change
  Object.values(fields).forEach(input => {
    input.addEventListener('change', saveCache);
  });

  // Init
  loadCachedData();
  updateStepUI();
});
