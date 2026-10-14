// Task 12: Search Filter & Infinite Scroll Script
// High-Performance Data Explorer with Debounced Search & Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_ITEMS = 5000;
  const CHUNK_SIZE = 30;
  const DEBOUNCE_DELAY_MS = 300;

  // 1. DATA GENERATOR (Simulating 5,000 server metrics records)
  const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'];
  const statuses = ['Healthy', 'Degraded', 'Critical'];
  const services = ['api-gateway', 'auth-service', 'payment-worker', 'cache-redis', 'db-cluster', 'search-indexer'];

  console.log(`Generating simulated high-volume dataset of ${TOTAL_ITEMS} items...`);
  const dataset = [];
  for (let i = 1; i <= TOTAL_ITEMS; i++) {
    const region = regions[i % regions.length];
    const status = (i % 17 === 0) ? 'Critical' : (i % 7 === 0) ? 'Degraded' : 'Healthy';
    const service = services[i % services.length];
    const ip = `10.${Math.floor(i / 256) % 256}.${i % 254 + 1}.${(i * 3) % 250 + 1}`;
    const cpu = Math.round(15 + (Math.sin(i) * 35 + 35));
    const latency = Math.round(12 + (Math.cos(i) * 45 + 50));

    dataset.push({
      id: `SRV-${String(i).padStart(5, '0')}`,
      hostname: `${service}-${region.slice(0, 3)}-${String(i).padStart(3, '0')}.node`,
      service,
      ip,
      region,
      status,
      cpu,
      latency
    });
  }

  // State
  let filteredRecords = [...dataset];
  let currentRenderedCount = 0;
  let isLoadingChunk = false;
  let debounceTimeoutId = null;

  // DOM Elements
  const totalRecordsCountEl = document.getElementById('totalRecordsCount');
  const matchingRecordsCountEl = document.getElementById('matchingRecordsCount');
  const loadedRecordsCountEl = document.getElementById('loadedRecordsCount');
  const searchInput = document.getElementById('searchInput');
  const debounceIndicator = document.getElementById('debounceIndicator');
  const statusFilter = document.getElementById('statusFilter');
  const regionFilter = document.getElementById('regionFilter');
  const sortOrder = document.getElementById('sortOrder');
  const recordsList = document.getElementById('recordsList');
  const scrollSentinel = document.getElementById('scrollSentinel');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const sentinelText = document.getElementById('sentinelText');
  const noResults = document.getElementById('noResults');

  totalRecordsCountEl.textContent = TOTAL_ITEMS.toLocaleString();

  // 2. DEBOUNCE UTILITY FUNCTION
  function debounce(func, delay) {
    return (...args) => {
      debounceIndicator.textContent = 'Filtering...';
      debounceIndicator.classList.add('filtering');
      clearTimeout(debounceTimeoutId);
      debounceTimeoutId = setTimeout(() => {
        func(...args);
        debounceIndicator.textContent = 'Ready';
        debounceIndicator.classList.remove('filtering');
      }, delay);
    };
  }

  // 3. FILTERING & SORTING ENGINE
  function applyFiltersAndSort() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedRegion = regionFilter.value;
    const selectedSort = sortOrder.value;

    filteredRecords = dataset.filter(item => {
      // Query filter
      const matchQuery = !query ||
        item.hostname.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.ip.includes(query) ||
        item.service.toLowerCase().includes(query) ||
        item.region.toLowerCase().includes(query);

      // Status filter
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;

      // Region filter
      const matchRegion = selectedRegion === 'All' || item.region === selectedRegion;

      return matchQuery && matchStatus && matchRegion;
    });

    // Sorting
    if (selectedSort === 'latency_asc') {
      filteredRecords.sort((a, b) => a.latency - b.latency);
    } else if (selectedSort === 'cpu_desc') {
      filteredRecords.sort((a, b) => b.cpu - a.cpu);
    } else {
      filteredRecords.sort((a, b) => a.id.localeCompare(b.id));
    }

    matchingRecordsCountEl.textContent = filteredRecords.length.toLocaleString();

    // Reset render stream
    currentRenderedCount = 0;
    recordsList.innerHTML = '';

    if (filteredRecords.length === 0) {
      noResults.style.display = 'block';
      scrollSentinel.style.display = 'none';
      loadedRecordsCountEl.textContent = '0';
    } else {
      noResults.style.display = 'none';
      scrollSentinel.style.display = 'flex';
      loadNextChunk();
    }
  }

  // 4. CHUNK LOADER
  function loadNextChunk() {
    if (isLoadingChunk || currentRenderedCount >= filteredRecords.length) {
      if (currentRenderedCount >= filteredRecords.length) {
        sentinelText.textContent = `All ${filteredRecords.length.toLocaleString()} matching records loaded.`;
        loadingSpinner.style.display = 'none';
      }
      return;
    }

    isLoadingChunk = true;
    loadingSpinner.style.display = 'block';
    sentinelText.textContent = 'Streaming next data chunk...';

    // Simulate micro-async fetch latency
    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();
      const endIndex = Math.min(currentRenderedCount + CHUNK_SIZE, filteredRecords.length);

      for (let i = currentRenderedCount; i < endIndex; i++) {
        const item = filteredRecords[i];
        const row = document.createElement('div');
        row.className = 'record-row';
        row.setAttribute('role', 'article');

        row.innerHTML = `
          <div>
            <div class="host-title">${escapeHtml(item.hostname)}</div>
            <div class="host-id">${escapeHtml(item.id)}</div>
          </div>
          <div class="ip-val">${escapeHtml(item.ip)}</div>
          <div>${escapeHtml(item.region)}</div>
          <div>
            <span class="status-badge status-${item.status.toLowerCase()}">${escapeHtml(item.status)}</span>
          </div>
          <div class="metric-bar-group">
            <span class="metric-text">CPU: ${item.cpu}% | ${item.latency}ms</span>
          </div>
        `;
        fragment.appendChild(row);
      }

      recordsList.appendChild(fragment);
      currentRenderedCount = endIndex;
      loadedRecordsCountEl.textContent = currentRenderedCount.toLocaleString();

      isLoadingChunk = false;

      if (currentRenderedCount >= filteredRecords.length) {
        sentinelText.textContent = `All ${filteredRecords.length.toLocaleString()} records loaded.`;
        loadingSpinner.style.display = 'none';
      }
    });
  }

  // 5. INTERSECTION OBSERVER INTEGRATION
  const observerOptions = {
    root: null, // viewport
    rootMargin: '200px', // Fetch early before hitting bottom
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoadingChunk) {
        loadNextChunk();
      }
    });
  }, observerOptions);

  observer.observe(scrollSentinel);

  // 6. EVENT BINDINGS
  const debouncedSearch = debounce(applyFiltersAndSort, DEBOUNCE_DELAY_MS);
  searchInput.addEventListener('input', debouncedSearch);

  statusFilter.addEventListener('change', applyFiltersAndSort);
  regionFilter.addEventListener('change', applyFiltersAndSort);
  sortOrder.addEventListener('change', applyFiltersAndSort);

  // Utility
  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Initial load
  applyFiltersAndSort();
});
