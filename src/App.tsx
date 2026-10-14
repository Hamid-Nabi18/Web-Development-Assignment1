/**
 * Assignment 1 - Web Development & Design
 * Showcase Suite & Verification Testbed
 * Topics: HTML, CSS, JavaScript | Deadline: November 7th, 2026 | Submission: LMS Portal
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ExternalLink, 
  Code2, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check
} from 'lucide-react';

interface TaskMeta {
  id: string;
  number: number;
  part: 'Part 1: Foundational' | 'Part 2: Intermediate' | 'Part 3: Advanced';
  partNum: 1 | 2 | 3;
  taskTitle: string;
  tag: string;
  originalSpec: string;
  folder: string;
  hasScript: boolean;
  keyFeatures: string[];
}

const TASKS: TaskMeta[] = [
  {
    id: 'task-01',
    number: 1,
    part: 'Part 1: Foundational',
    partNum: 1,
    taskTitle: 'Artisan Coffee Shop Landing Page',
    tag: 'FOUNDATIONAL',
    originalSpec: 'Build a fully responsive coffee shop website using clean semantic markup like header, nav, main, section, and footer elements. Structure a multi-column menu grid using CSS Grid that gracefully collapses into single columns on smaller mobile device screens.',
    folder: 'task-01-artisan-coffee-shop',
    hasScript: true,
    keyFeatures: [
      'Clean semantic HTML5 markup (<header>, <nav>, <main>, <section>, <footer>)',
      'Multi-column menu grid powered by CSS Grid with repeat(auto-fit, minmax(...))',
      'Graceful single-column collapse on mobile viewports (<768px)',
      'Responsive navigation toggle and accessible anchor links'
    ]
  },
  {
    id: 'task-02',
    number: 2,
    part: 'Part 1: Foundational',
    partNum: 1,
    taskTitle: 'Dynamic Multiple-Choice Quiz',
    tag: 'CORE JS',
    originalSpec: 'Develop a dynamic web quiz using a JavaScript array of question objects that renders questions and options on the fly. Implement event handlers to evaluate answers, dynamically color choices, lock inputs, and track running test scores.',
    folder: 'task-02-dynamic-quiz',
    hasScript: true,
    keyFeatures: [
      'JavaScript array of question objects rendered on the fly',
      'Event handlers to evaluate answers upon user selection',
      'Dynamically colored choices (green for correct, red for incorrect)',
      'Input locking mechanism disabling options after selection',
      'Live running score tracker and animated progress indicator'
    ]
  },
  {
    id: 'task-03',
    number: 3,
    part: 'Part 1: Foundational',
    partNum: 1,
    taskTitle: 'To-Do List & Task Manager',
    tag: 'STATE & CRUD',
    originalSpec: 'Create a task management tool supporting full CRUD operations: create, read, update status, and delete items from a state list. Persist user data securely across browser refreshes using web storage and add category filter methods.',
    folder: 'task-03-todo-manager',
    hasScript: true,
    keyFeatures: [
      'Full CRUD operations: Create, Read, Update status/title, Delete',
      'LocalStorage persistence preserving tasks across browser refreshes',
      'Category filter methods (All, Work, Personal, Urgent, Study)',
      'Status filters (All, Active, Completed) with live counter badges'
    ]
  },
  {
    id: 'task-04',
    number: 4,
    part: 'Part 1: Foundational',
    partNum: 1,
    taskTitle: 'SaaS Subscription Tiers',
    tag: 'CSS LAYOUT',
    originalSpec: 'Construct a modern subscription pricing table layout featuring three distinct product tiers using flexible box alignment. Highlight the featured professional tier with customized borders, background highlights, and clear visual accents.',
    folder: 'task-04-saas-pricing',
    hasScript: true,
    keyFeatures: [
      'Modern 3-tier pricing layout built with CSS Flexbox alignment',
      'Featured Professional tier prominently highlighted with indigo border & glow',
      'Customized badges, elevated scale, and distinct call-to-action styling',
      'Interactive Monthly / Annual billing toggle recalculating prices'
    ]
  },
  {
    id: 'task-05',
    number: 5,
    part: 'Part 2: Intermediate',
    partNum: 2,
    taskTitle: 'Expandable Help Center Panel',
    tag: 'MEDIUM UI',
    originalSpec: 'Design an interactive frequently asked questions component where clicking questions smoothly expands answer text blocks. Enforce single-item accordion behavior so opening one panel automatically collapses any currently active sections.',
    folder: 'task-05-faq-accordion',
    hasScript: true,
    keyFeatures: [
      'Smooth CSS grid-template-rows expansion/collapse transitions',
      'Enforced single-item accordion behavior: opening one auto-closes others',
      'WAI-ARIA accessibility (aria-expanded, aria-controls, native button focus)',
      'Rotated chevron indicator and URL deep-linking support'
    ]
  },
  {
    id: 'task-06',
    number: 6,
    part: 'Part 2: Intermediate',
    partNum: 2,
    taskTitle: 'Profile Settings Dashboard Tabs',
    tag: 'MEDIUM DOM',
    originalSpec: 'Implement a modular tabbed interface panel allowing users to switch between separate view categories seamlessly on click. Manage active styling states through script logic while preserving clear accessible document structures.',
    folder: 'task-06-profile-tabs',
    hasScript: true,
    keyFeatures: [
      'Modular tabbed view categories: Profile, Security, Notifications, Billing',
      'Seamless switching with script-managed active styling states',
      'Strict WAI-ARIA tabbed accessibility (role="tablist", role="tab", role="tabpanel")',
      'Full keyboard arrow navigation (Left/Right/Home/End)'
    ]
  },
  {
    id: 'task-07',
    number: 7,
    part: 'Part 2: Intermediate',
    partNum: 2,
    taskTitle: 'Newsletter Sign-Up Overlay',
    tag: 'MEDIUM UX',
    originalSpec: 'Build a centered modal dialog box triggered via button clicks with background backdrop dimming and page scroll locking. Enable smooth closure interactions via close icons, backdrop clicks, or keyboard escape key inputs.',
    folder: 'task-07-newsletter-modal',
    hasScript: true,
    keyFeatures: [
      'Centered modal dialog triggered via button clicks with smooth scale transition',
      'Background backdrop dimming with blur effect',
      'Page scroll locking (overflow: hidden) preventing background movement',
      'Triple closure vectors: close icon button, backdrop click, and Escape key'
    ]
  },
  {
    id: 'task-08',
    number: 8,
    part: 'Part 2: Intermediate',
    partNum: 2,
    taskTitle: 'Feedback Text Area Monitor',
    tag: 'MEDIUM FORMS',
    originalSpec: 'Construct a text feedback monitor tracking remaining character quantities live against a fixed maximum threshold limit. Apply visual warning states when limits approach zero and include pattern checks for email form inputs.',
    folder: 'task-08-feedback-monitor',
    hasScript: true,
    keyFeatures: [
      'Live character countdown against a fixed 250-character maximum threshold',
      'Visual warning states: Normal, Caution (<=40 chars), Danger/Critical (<=15 chars)',
      'Dynamic meter progress bar and pulsing border warning effects',
      'RFC 5322 regex pattern validation for email form inputs with live feedback'
    ]
  },
  {
    id: 'task-09',
    number: 9,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Flash Sale Timer & Carousel',
    tag: 'MEDIUM STATE',
    originalSpec: 'Program a live promotional countdown clock updating daily time segments using interval timing loops. Pair this with a responsive product carousel featuring image switching controls and active pagination dots.',
    folder: 'task-09-flash-sale-carousel',
    hasScript: true,
    keyFeatures: [
      'Live promotional countdown clock updating Days, Hours, Mins, Secs via setInterval',
      'Responsive product carousel showcasing hardware deals',
      'Image switching controls (Next & Prev buttons, keyboard arrows)',
      'Active pagination dots and auto-play pause/resume toggle'
    ]
  },
  {
    id: 'task-10',
    number: 10,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Notes App & Quote Generator',
    tag: 'MEDIUM TEXT',
    originalSpec: 'Build a dual-pane text editor that parses markdown syntax into live HTML elements instantly as users type. Combine this with a random quote generator widget featuring one-click clipboard copying functionality.',
    folder: 'task-10-notes-quote-generator',
    hasScript: true,
    keyFeatures: [
      'Dual-pane text editor: markdown textarea on left, live HTML output on right',
      'Instant markdown parser (headings, bold, italic, code blocks, lists, quotes)',
      'Curated quotes generator with random selection algorithm',
      'One-click clipboard copying via navigator.clipboard with feedback toast'
    ]
  },
  {
    id: 'task-11',
    number: 11,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Trello-Style Workflow Manager',
    tag: 'HARD / ARCHITECTURE',
    originalSpec: 'Implement HTML5 drag and drop interaction APIs across multi-column task boards with immutable state management. Persist task placement changes across sessions using reliable browser storage systems.',
    folder: 'task-11-trello-kanban',
    hasScript: true,
    keyFeatures: [
      'Native HTML5 drag and drop interaction APIs (draggable, dragover, drop)',
      'Pure immutable state management (zero direct mutation, deep state cloning)',
      'Reliable browser storage persistence (localStorage) across browser sessions',
      'Interactive card creation modal, column counters, and card deletion'
    ]
  },
  {
    id: 'task-12',
    number: 12,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Search Filter & Infinite Scroll',
    tag: 'HARD / PERFORMANCE',
    originalSpec: 'Simulate large datasets containing thousands of items while implementing debounced search filtering for performance. Integrate Intersection Observer APIs to dynamically fetch and load data chunks during user scrolling.',
    folder: 'task-12-infinite-scroll-search',
    hasScript: true,
    keyFeatures: [
      'Dataset simulator generating 5,000 server telemetry records',
      'Debounced search filtering (300ms delay) preventing UI thrashing',
      'Intersection Observer API dynamically streaming chunks during scrolling',
      'Multi-parameter status and region filters with sorting'
    ]
  },
  {
    id: 'task-13',
    number: 13,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Rich Text Workspace Suite',
    tag: 'HARD / STATE LOGIC',
    originalSpec: 'Construct a secure markdown editor featuring content sanitization against malicious cross-site scripting vectors. Build a custom command pattern history stack enabling full undo and redo functionality.',
    folder: 'task-13-rich-text-workspace',
    hasScript: true,
    keyFeatures: [
      'Robust DOM-based sanitizer neutralizing <script>, onerror, onload, and javascript: URIs',
      'Custom Command Pattern history engine with Command objects and execute/undo methods',
      'Full Undo and Redo functionality with toolbar buttons and Ctrl+Z / Ctrl+Y shortcuts',
      'Interactive "Test XSS Vector" button demonstrating live security neutralization'
    ]
  },
  {
    id: 'task-14',
    number: 14,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Interactive Canvas Drawing Suite',
    tag: 'HARD / CANVAS API',
    originalSpec: 'Utilize the HTML5 canvas graphics API to build a freehand drawing tool supporting shapes and color pickers. Implement drawing state controls allowing users to clear canvases, undo strokes, and export artwork.',
    folder: 'task-14-canvas-drawing-suite',
    hasScript: true,
    keyFeatures: [
      'HTML5 Canvas 2D graphics API with smooth stroke path interpolation',
      'Freehand brush + vector shapes (Straight Lines, Rectangles, Circles, Eraser)',
      'Hex color picker + color presets palette + stroke width slider',
      'Drawing state controls: Undo strokes, Redo strokes, Clear canvas, and PNG Export'
    ]
  },
  {
    id: 'task-15',
    number: 15,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'Multi-Step Form with Schema Validation',
    tag: 'HARD / COMPLEX STATE',
    originalSpec: 'Design a multi-stage user onboarding form with progress indicators and robust input validation rules per step. Cache user input values globally so navigation across steps occurs without data loss prior to final submission.',
    folder: 'task-15-multi-step-onboarding',
    hasScript: true,
    keyFeatures: [
      '4-stage onboarding form: Personal -> Security -> Organization -> Review',
      'Visual stepper progress bar with step numbers and completion checkmarks',
      'Robust schema validation rules per step with descriptive error messages',
      'Global input caching (sessionStorage + memory) preserving data during back/next navigation'
    ]
  },
  {
    id: 'task-16',
    number: 16,
    part: 'Part 3: Advanced',
    partNum: 3,
    taskTitle: 'WCAG Combobox & Custom Router',
    tag: 'HARD / A11Y & ROUTING',
    originalSpec: 'Build a fully accessible keyboard-navigable combobox component adhering strictly to WCAG specifications. Write a vanilla JavaScript client-side router mapping URL path parameters to dynamic view render functions.',
    folder: 'task-16-wcag-combobox-router',
    hasScript: true,
    keyFeatures: [
      'Strict WCAG 2.1 AA combobox (role="combobox", aria-autocomplete, aria-activedescendant)',
      'Full keyboard navigation: Down/Up arrows, Enter, Escape, Home/End, live filtering',
      'Pure vanilla JavaScript client-side router mapping URL path parameters (e.g. #/items/:id)',
      'Dynamic view render functions responding to parameter changes and browser history'
    ]
  }
];

export default function App() {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'spec'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [codeFileTab, setCodeFileTab] = useState<'html' | 'css' | 'js'>('html');
  const [codeContent, setCodeContent] = useState<string>('Loading source code...');
  const [copiedCode, setCopiedCode] = useState(false);
  const [partFilter, setPartFilter] = useState<'all' | 1 | 2 | 3>('all');

  const currentTask = TASKS[selectedTaskIndex];

  // Fetch source code when task or codeFileTab changes
  useEffect(() => {
    if (activeTab !== 'code') return;

    let filename = 'index.html';
    if (codeFileTab === 'css') filename = 'style.css';
    if (codeFileTab === 'js') filename = 'script.js';

    setCodeContent('Fetching source code...');
    fetch(`/tasks/${currentTask.folder}/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => setCodeContent(text))
      .catch(err => setCodeContent(`// Notice: File not available or empty for this tab (${err.message})`));
  }, [currentTask, activeTab, codeFileTab]);

  const filteredTasks = TASKS.filter(task => {
    if (partFilter === 'all') return true;
    return task.partNum === partFilter;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile': return 'max-w-[390px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              A1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Assignment 1 &ndash; Web Development &amp; Design</h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  All 16 Tasks Implemented
                </span>
              </div>
              <p className="text-xs text-slate-400">
                HTML, CSS, Vanilla JavaScript &bull; Deadline: Nov 7th, 2026 &bull; LMS Portal Submission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="/assignment_1.zip" 
              download="assignment_1.zip"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/30 active:scale-95"
              title="Download clean standalone project ZIP archive"
            >
              <Download className="w-4 h-4" />
              <span>Download assignment_1.zip</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar: 16 Tasks List in Original Order */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          {/* Part Filter Bar */}
          <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Filter Part
              </span>
              <span className="text-[11px] text-slate-500">16 Tasks Total</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <button 
                onClick={() => setPartFilter('all')} 
                className={`py-1.5 px-2 rounded-md font-medium text-center transition ${partFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
              >
                All (16)
              </button>
              <button 
                onClick={() => setPartFilter(1)} 
                className={`py-1.5 px-2 rounded-md font-medium text-center transition ${partFilter === 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
              >
                Part 1 (4)
              </button>
              <button 
                onClick={() => setPartFilter(2)} 
                className={`py-1.5 px-2 rounded-md font-medium text-center transition ${partFilter === 2 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
              >
                Part 2 (4)
              </button>
              <button 
                onClick={() => setPartFilter(3)} 
                className={`py-1.5 px-2 rounded-md font-medium text-center transition ${partFilter === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
              >
                Part 3 (8)
              </button>
            </div>
          </div>

          {/* Tasks Accordion/List */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Curriculum Task Order</span>
              <span className="text-[11px] text-emerald-400 font-medium">100% Tested</span>
            </div>
            
            <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-[640px]">
              {filteredTasks.map((t) => {
                const globalIndex = TASKS.findIndex(item => item.id === t.id);
                const isSelected = globalIndex === selectedTaskIndex;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskIndex(globalIndex);
                      if (activeTab === 'code') setCodeFileTab('html');
                    }}
                    className={`w-full text-left p-3.5 transition flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-blue-900/30 border-l-4 border-blue-500 pl-3' 
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold w-6 h-6 rounded-md shrink-0 flex items-center justify-center mt-0.5 ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.number}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400">
                          {t.tag}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Part {t.partNum}
                        </span>
                      </div>
                      <h3 className={`text-xs font-medium leading-snug truncate ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                        {t.taskTitle}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Showcase Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          
          {/* Active Task Summary Card */}
          <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Task {currentTask.number}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {currentTask.tag}
                </span>
                <span className="text-xs text-slate-500">
                  {currentTask.part}
                </span>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={selectedTaskIndex === 0}
                  onClick={() => setSelectedTaskIndex(prev => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                  title="Previous Task"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 px-1 font-mono">
                  {currentTask.number} / {TASKS.length}
                </span>
                <button
                  disabled={selectedTaskIndex === TASKS.length - 1}
                  onClick={() => setSelectedTaskIndex(prev => Math.min(TASKS.length - 1, prev + 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                  title="Next Task"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {currentTask.taskTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 font-mono">
              &ldquo;{currentTask.originalSpec}&rdquo;
            </p>

            {/* Checklist of implemented features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentTask.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Workspace: Tabs & Viewer */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col flex-1">
            
            {/* Tab Controls Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Interactive Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeTab === 'code'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Inspect Source Code
                </button>
              </div>

              {/* Viewport switchers for Preview */}
              {activeTab === 'preview' && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/60">
                    <button
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1.5 rounded text-xs transition ${viewportMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                      title="Desktop view"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewportMode('tablet')}
                      className={`p-1.5 rounded text-xs transition ${viewportMode === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                      title="Tablet view"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1.5 rounded text-xs transition ${viewportMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                      title="Mobile viewport (collapses menu grid)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={`/tasks/${currentTask.folder}/index.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
                    title="Open standalone page in new browser tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Standalone Fullscreen
                  </a>
                </div>
              )}

              {/* File selector for Code tab */}
              {activeTab === 'code' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/60">
                    <button
                      onClick={() => setCodeFileTab('html')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${codeFileTab === 'html' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                    >
                      index.html
                    </button>
                    <button
                      onClick={() => setCodeFileTab('css')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${codeFileTab === 'css' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                    >
                      style.css
                    </button>
                    {currentTask.hasScript && (
                      <button
                        onClick={() => setCodeFileTab('js')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${codeFileTab === 'js' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                      >
                        script.js
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="flex-1 bg-[#090d16] flex justify-center p-2 sm:p-4 min-h-[560px]">
              {activeTab === 'preview' ? (
                <div className={`w-full transition-all duration-300 ${getViewportWidth()} flex flex-col`}>
                  <div className="bg-slate-900 text-slate-400 text-[11px] font-mono px-3 py-1.5 rounded-t-lg border-x border-t border-slate-800 flex items-center justify-between">
                    <span className="truncate">/tasks/{currentTask.folder}/index.html</span>
                    <span className="text-[10px] text-slate-500 uppercase">{viewportMode} mode</span>
                  </div>
                  <iframe
                    key={`${currentTask.id}-${viewportMode}`}
                    src={`/tasks/${currentTask.folder}/index.html`}
                    title={currentTask.taskTitle}
                    className="w-full flex-1 min-h-[580px] bg-white rounded-b-lg border border-slate-800 shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <pre className="w-full flex-1 p-4 bg-[#070b14] border border-slate-800 rounded-lg overflow-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[620px]">
                    <code>{codeContent}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
