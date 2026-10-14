// Task 16: WCAG Combobox & Custom Router Script
// Strict WCAG 2.1 AA Keyboard-Navigable Combobox paired with a Vanilla JS Parameterized SPA Router
document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. DATA REPOSITORY FOR COMBOBOX & ROUTER
  // -------------------------------------------------------------
  const serviceCatalog = [
    { id: 'srv-auth', name: 'Identity & Authentication Gateway', category: 'Security', uptime: '99.99%', latency: '18ms', desc: 'Handles OAuth2 PKCE authorization flows and JWT token issuance.' },
    { id: 'srv-payments', name: 'Global Payment Processing Engine', category: 'Fintech', uptime: '99.98%', latency: '42ms', desc: 'PCI-DSS Level 1 compliant gateway with Stripe and Adyen routing.' },
    { id: 'srv-telemetry', name: 'Real-Time Distributed Telemetry', category: 'Observability', uptime: '99.95%', latency: '8ms', desc: 'Ingests 450,000 metrics per second across microservice meshes.' },
    { id: 'srv-storage', name: 'Encrypted Object Storage Cluster', category: 'Storage', uptime: '99.999%', latency: '24ms', desc: 'Multi-region S3-compatible chunk storage with AES-256 encryption.' }
  ];

  const comboboxCatalog = [
    { label: 'Identity Gateway (Auth)', route: '/items/srv-auth', category: 'Service' },
    { label: 'Payment Processing Engine', route: '/items/srv-payments', category: 'Service' },
    { label: 'Distributed Telemetry Mesh', route: '/items/srv-telemetry', category: 'Service' },
    { label: 'Encrypted Object Storage', route: '/items/srv-storage', category: 'Service' },
    { label: 'Performance Latency Metrics', route: '/analytics/performance', category: 'Analytics' },
    { label: 'Security Vulnerability Logs', route: '/analytics/security', category: 'Analytics' },
    { label: 'Service Catalog Directory', route: '/items', category: 'View' },
    { label: 'Main Control Dashboard', route: '/', category: 'View' }
  ];

  // -------------------------------------------------------------
  // 2. VANILLA JAVASCRIPT CLIENT-SIDE ROUTER WITH PATH PARAMETERS
  // -------------------------------------------------------------
  class SPARouter {
    constructor(viewportEl, routeDisplayEl) {
      this.viewport = viewportEl;
      this.routeDisplay = routeDisplayEl;
      this.routes = [];

      window.addEventListener('hashchange', () => this.handleRouting());
    }

    // Register route with pattern and dynamic view render function
    addRoute(pattern, renderFn) {
      // Convert pattern like "/items/:id" into regex: /^\/items\/([^/]+)$/
      const paramNames = [];
      const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });

      this.routes.push({
        pattern,
        regex: new RegExp(`^${regexPattern}$`),
        paramNames,
        renderFn
      });
    }

    navigateTo(path) {
      window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
    }

    handleRouting() {
      let rawHash = window.location.hash.slice(1); // remove '#'
      if (!rawHash) rawHash = '/';
      if (!rawHash.startsWith('/')) rawHash = `/${rawHash}`;

      this.routeDisplay.textContent = `#${rawHash}`;

      // Update Nav links active state
      document.querySelectorAll('.spa-nav .nav-link').forEach(link => {
        const linkRoute = link.getAttribute('data-route');
        if (linkRoute === rawHash || (linkRoute.includes(':') && rawHash.startsWith(linkRoute.split('/:')[0]))) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Match route against registered routes
      for (const route of this.routes) {
        const match = rawHash.match(route.regex);
        if (match) {
          const params = {};
          route.paramNames.forEach((name, index) => {
            params[name] = decodeURIComponent(match[index + 1]);
          });

          // Execute Dynamic View Render Function with extracted parameters
          this.viewport.innerHTML = route.renderFn(params);
          return;
        }
      }

      // 404 Not Found fallback
      this.viewport.innerHTML = this.renderNotFound(rawHash);
    }

    renderNotFound(path) {
      return `
        <div class="view-card">
          <h2>404 &ndash; View Not Found</h2>
          <p>No route mapped to path: <code>${escapeHtml(path)}</code></p>
          <a href="#/" class="btn-back">&larr; Return to Dashboard</a>
        </div>
      `;
    }
  }

  // Router View Render Functions
  function renderDashboardView() {
    return `
      <div class="view-card">
        <h2>Enterprise Operations Dashboard</h2>
        <p>Real-time microservice architecture control center. Select an item from the WCAG combobox above or navigate using the tabs.</p>
        <div class="metrics-grid">
          <div class="metric-stat-card">
            <div class="metric-val">4/4</div>
            <div class="metric-lbl">Services Online</div>
          </div>
          <div class="metric-stat-card">
            <div class="metric-val">12.4ms</div>
            <div class="metric-lbl">Global Mean Latency</div>
          </div>
          <div class="metric-stat-card">
            <div class="metric-val">99.99%</div>
            <div class="metric-lbl">Composite SLA</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCatalogView() {
    const cards = serviceCatalog.map(srv => `
      <a href="#/items/${srv.id}" class="service-card">
        <h3>${escapeHtml(srv.name)}</h3>
        <p>${escapeHtml(srv.desc)}</p>
        <div class="detail-row">
          <span class="opt-badge">${escapeHtml(srv.category)}</span>
          <span>${srv.latency}</span>
        </div>
      </a>
    `).join('');

    return `
      <div class="view-card">
        <h2>Service Catalog Directory</h2>
        <p>Listing all provisioned production services. Click any card to load dynamic route <code>#/items/:id</code>.</p>
        <div class="items-grid">${cards}</div>
      </div>
    `;
  }

  function renderItemDetailView(params) {
    const srvId = params.id;
    const srv = serviceCatalog.find(s => s.id === srvId);

    if (!srv) {
      return `
        <div class="view-card">
          <h2>Service Not Found</h2>
          <p>No service matching path parameter ID: <code>${escapeHtml(srvId)}</code></p>
          <a href="#/items" class="btn-back">&larr; Back to Service Catalog</a>
        </div>
      `;
    }

    return `
      <div class="view-card">
        <div class="detail-card">
          <span class="param-badge">Route Param ID: ${escapeHtml(srv.id)}</span>
          <h2>${escapeHtml(srv.name)}</h2>
          <p>${escapeHtml(srv.desc)}</p>
          <div class="detail-specs">
            <div class="spec-line"><span>Domain Category:</span> <strong>${escapeHtml(srv.category)}</strong></div>
            <div class="spec-line"><span>SLA Availability:</span> <strong style="color: #10b981;">${escapeHtml(srv.uptime)}</strong></div>
            <div class="spec-line"><span>Average Latency:</span> <strong style="color: #38bdf8;">${escapeHtml(srv.latency)}</strong></div>
            <div class="spec-line"><span>Health Status:</span> <strong style="color: #10b981;">Nominal &ndash; All Nodes Healthy</strong></div>
          </div>
          <a href="#/items" class="btn-back">&larr; Back to Catalog</a>
        </div>
      </div>
    `;
  }

  function renderAnalyticsView(params) {
    const metricType = params.metric;
    const isSecurity = metricType === 'security';

    return `
      <div class="view-card">
        <span class="param-badge">Route Param Metric: ${escapeHtml(metricType)}</span>
        <h2>${isSecurity ? 'Security Audit Telemetry' : 'Performance Latency Profiling'}</h2>
        <p>${isSecurity ? 'Real-time threat monitoring and SSL certificate validation metrics.' : 'Network packet timing and memory utilization curves across edge gateways.'}</p>
        <div class="metrics-grid">
          <div class="metric-stat-card">
            <div class="metric-val">${isSecurity ? '0' : '99.4%'}</div>
            <div class="metric-lbl">${isSecurity ? 'Active CVE Alerts' : 'Cache Hit Ratio'}</div>
          </div>
          <div class="metric-stat-card">
            <div class="metric-val">${isSecurity ? '100%' : '14ms'}</div>
            <div class="metric-lbl">${isSecurity ? 'TLS 1.3 Coverage' : 'P99 Latency'}</div>
          </div>
          <div class="metric-stat-card">
            <div class="metric-val">${isSecurity ? 'Verified' : '2.1 GB/s'}</div>
            <div class="metric-lbl">${isSecurity ? 'SOC2 Compliance' : 'Throughput'}</div>
          </div>
        </div>
        <a href="#/" class="btn-back">&larr; Return to Dashboard</a>
      </div>
    `;
  }

  // Initialize Router
  const spaViewport = document.getElementById('spaViewport');
  const currentRouteDisplay = document.getElementById('currentRouteDisplay');
  const router = new SPARouter(spaViewport, currentRouteDisplay);

  router.addRoute('/', renderDashboardView);
  router.addRoute('/items', renderCatalogView);
  router.addRoute('/items/:id', renderItemDetailView);
  router.addRoute('/analytics/:metric', renderAnalyticsView);

  // -------------------------------------------------------------
  // 3. WCAG 2.1 AA KEYBOARD-ACCESSIBLE COMBOBOX COMPONENT
  // -------------------------------------------------------------
  const comboboxInput = document.getElementById('wcagComboboxInput');
  const comboboxToggleBtn = document.getElementById('comboboxToggleBtn');
  const comboboxListbox = document.getElementById('comboboxListbox');
  const comboboxAnnouncer = document.getElementById('comboboxAnnouncer');

  let activeIndex = -1;
  let matchingOptions = [...comboboxCatalog];
  let isOpen = false;

  function openCombobox() {
    if (isOpen) return;
    isOpen = true;
    comboboxInput.setAttribute('aria-expanded', 'true');
    comboboxListbox.hidden = false;
    renderComboboxOptions();
  }

  function closeCombobox() {
    if (!isOpen) return;
    isOpen = false;
    comboboxInput.setAttribute('aria-expanded', 'false');
    comboboxInput.removeAttribute('aria-activedescendant');
    comboboxListbox.hidden = true;
    activeIndex = -1;
  }

  function filterOptions(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      matchingOptions = [...comboboxCatalog];
    } else {
      matchingOptions = comboboxCatalog.filter(opt => 
        opt.label.toLowerCase().includes(q) || opt.category.toLowerCase().includes(q)
      );
    }
    activeIndex = -1;
    renderComboboxOptions();

    // WCAG Accessibility: Announce match count to screen readers via aria-live
    comboboxAnnouncer.textContent = `${matchingOptions.length} option${matchingOptions.length === 1 ? '' : 's'} available. Use arrow keys to navigate.`;
  }

  function renderComboboxOptions() {
    comboboxListbox.innerHTML = '';

    if (matchingOptions.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'no-options';
      emptyLi.textContent = 'No matching options';
      emptyLi.setAttribute('role', 'presentation');
      comboboxListbox.appendChild(emptyLi);
      return;
    }

    matchingOptions.forEach((opt, idx) => {
      const li = document.createElement('li');
      const optId = `combobox-opt-${idx}`;
      li.id = optId;
      li.className = 'combobox-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');

      if (idx === activeIndex) {
        li.classList.add('is-active');
        comboboxInput.setAttribute('aria-activedescendant', optId);
      }

      li.innerHTML = `
        <span>${escapeHtml(opt.label)}</span>
        <span class="opt-badge">${escapeHtml(opt.category)}</span>
      `;

      // Click to select
      li.addEventListener('click', () => {
        selectOption(opt);
      });

      comboboxListbox.appendChild(li);
    });

    if (activeIndex >= 0) {
      const activeEl = document.getElementById(`combobox-opt-${activeIndex}`);
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function setActiveOption(index) {
    if (matchingOptions.length === 0) return;

    if (index < 0) {
      activeIndex = 0;
    } else if (index >= matchingOptions.length) {
      activeIndex = matchingOptions.length - 1;
    } else {
      activeIndex = index;
    }

    renderComboboxOptions();
  }

  function selectOption(opt) {
    comboboxInput.value = opt.label;
    closeCombobox();
    // Route to selected view
    router.navigateTo(opt.route);
  }

  // Keyboard Event Navigation adhering strictly to WCAG Combobox specifications
  comboboxInput.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openCombobox();
          setActiveOption(0);
        } else {
          setActiveOption(activeIndex + 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openCombobox();
          setActiveOption(matchingOptions.length - 1);
        } else {
          setActiveOption(activeIndex - 1);
        }
        break;

      case 'Enter':
        if (isOpen && activeIndex >= 0 && activeIndex < matchingOptions.length) {
          e.preventDefault();
          selectOption(matchingOptions[activeIndex]);
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          closeCombobox();
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setActiveOption(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setActiveOption(matchingOptions.length - 1);
        }
        break;

      default:
        // Typing will trigger 'input' event
        break;
    }
  });

  comboboxInput.addEventListener('input', (e) => {
    openCombobox();
    filterOptions(e.target.value);
  });

  comboboxInput.addEventListener('focus', () => {
    openCombobox();
  });

  comboboxToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeCombobox();
    } else {
      openCombobox();
      comboboxInput.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combobox-wrapper')) {
      closeCombobox();
    }
  });

  // Utility Escape HTML
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

  // Initial Router Render
  router.handleRouting();
});
