/* ============================================================
   Fear of Falling — Free Introduction
   A static recreation of the full course app (expedition-psychology.co.uk/course/…)
   limited to Chapters 1–5. Markup and class names mirror the full course so its
   stylesheet (course.css) renders it identically. Hash routing; progress is saved
   in localStorage because the free version has no accounts.
   Content, videos and the upgrade link live in content.js.
   ============================================================ */
(function () {
  'use strict';

  const C = window.FOF_FREE;
  const FREE = C.freeChapters;
  const TOTAL = C.chapters.length;
  const UPGRADE = C.upgradeUrl;
  const TOOLKIT_PAGE = '/fear-of-falling';

  /* ---------------------------------------------------------- */
  /* Progress storage                                            */
  /* ---------------------------------------------------------- */
  const KEY = 'ep-fof-free-v1';
  const blank = () => ({ v: 1, done: {}, tasks: {}, finishedAt: null });
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage unavailable: progress lasts for this visit only */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------------------------------------------------- */
  /* Course rules (mirroring the full course)                    */
  /* ---------------------------------------------------------- */
  // Chapters unlock in order. Completed chapters stay open, the first unfinished one is
  // "current", and the one after it can be opened in Preview Mode but not completed.
  // Chapters beyond the free introduction are always locked and have no content here.
  const chapter = (n) => C.chapters.find((c) => c.n === n);
  const task = (id) => C.tasks.find((t) => t.id === id);
  const isFree = (n) => n >= 1 && n <= FREE;
  const isDone = (n) => !!state.done[n];
  const taskDone = (id) => !!(state.tasks[id] && state.tasks[id].done);
  const freeDoneCount = () => C.chapters.filter((c) => isFree(c.n) && isDone(c.n)).length;
  const allFreeDone = () => freeDoneCount() === FREE;
  function current() {
    for (let n = 1; n <= FREE; n++) if (!isDone(n)) return n;
    return null;
  }
  const isCurrent = (n) => current() === n;
  const isPreview = (n) => isFree(n) && current() !== null && n === current() + 1;
  const isOpen = (n) => isFree(n) && (isDone(n) || isCurrent(n) || isPreview(n));
  // A workbook task opens once its chapter is reached (Locked: Complete Lesson N-1).
  const taskOpen = (t) => isFree(t.chapter) && (isDone(t.chapter) || isCurrent(t.chapter));
  const canComplete = (n) => isCurrent(n) && (!chapter(n).task || taskDone(chapter(n).task));

  /* ---------------------------------------------------------- */
  /* Helpers                                                     */
  /* ---------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}"></i>`;
  const pad = (n) => String(n).padStart(2, '0');
  const pct = (a, b) => Math.round((a / b) * 100);

  function youtubeId(v) {
    if (!v) return null;
    const m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : null);
  }

  /* ---------------------------------------------------------- */
  /* Shell: navigation                                           */
  /* ---------------------------------------------------------- */
  function renderNav(active) {
    const link = (key, href, ic, label) => {
      const on = active === key;
      return `<a class="group relative flex items-center gap-2 px-4 py-2 font-brand-heading text-[15px] tracking-wide hover-highlight-brand ${on ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-primary'}" href="${href}"${on ? ' aria-current="page"' : ''}>${icon(ic, `w-4 h-4 ${on ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-primary'}`)}<span>${label}</span>${on ? '<div class="absolute -bottom-[29px] left-0 right-0 h-0.5 bg-brand-primary"></div>' : ''}</a>`;
    };
    $('#top-nav').innerHTML = `<div class="max-w-7xl mx-auto px-8"><div class="flex items-center justify-between h-20"><div class="flex items-center gap-5"><a class="group flex items-center text-brand-muted hover:text-brand-primary shrink-0 hover-highlight-brand" href="${TOOLKIT_PAGE}" aria-label="Back to the Fear of Falling Toolkit"><div class="p-1.5 rounded-lg group-hover:bg-brand-offwhite cursor-pointer">${icon('chevron-left', 'w-5 h-5')}</div></a><div class="h-8 w-px bg-brand-offwhite hidden md:block shrink-0"></div><a class="flex flex-col items-start justify-center free-logo" href="#/dashboard"><img src="logo-black.svg" alt="Expedition Psychology" class="h-50 w-auto mb-1 opacity-100 hover:opacity-100 transition-all cursor-pointer shrink-0 object-contain object-left"></a></div><div class="flex gap-2 items-center">${link('dashboard', '#/dashboard', 'layout-grid', 'Dashboard')}${link('content', '#/content', 'book-open', 'Chapters')}${link('workbook', '#/workbook', 'notebook-pen', 'Workbook')}<button type="button" data-locked="log" class="inline-flex items-center justify-center whitespace-nowrap font-medium shrink-0 outline-none gap-1.5 ml-4 rounded-full border border-brand-teal text-brand-teal hover:bg-brand-teal-10 hover:text-brand-teal font-brand-heading uppercase tracking-widest text-[11px] px-4 h-9 shadow-sm transition-colors cursor-pointer">${icon('plus', 'w-3.5 h-3.5 mr-1')}Log Session</button><div class="w-px h-6 bg-brand-offwhite mx-4"></div><a class="group relative flex items-center gap-2 px-4 py-2 font-brand-heading text-[15px] tracking-wide hover-highlight-brand text-brand-teal hover:text-brand-primary whitespace-nowrap" href="${UPGRADE}">${icon('sparkles', 'w-4 h-4')}<span>Unlock<span class="free-nav-long"> Full Course</span></span></a></div></div></div>`;

    $('#mobile-top').innerHTML = `<div class="max-w-1xl mx-auto px-3 w-full flex items-center justify-between gap-3"><a href="#/dashboard"><img src="logo-black.svg" alt="Expedition Psychology" class="w-48 h-auto cursor-pointer object-contain"></a><a class="free-mobile-unlock" href="${UPGRADE}">${icon('sparkles', 'w-4 h-4')}<span>Unlock</span></a></div>`;

    const tab = (key, href, ic, label) => {
      const on = active === key;
      return `<a class="group flex flex-col items-center gap-1 px-3 py-2 font-brand-heading uppercase tracking-wider text-[10px] hover-highlight-brand ${on ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-primary'}" href="${href}"${on ? ' aria-current="page"' : ''}>${icon(ic, `w-5 h-5 ${on ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-primary'}`)}<span>${label}</span></a>`;
    };
    $('#bottom-nav').innerHTML = `<div class="max-w-full"><div class="flex items-center justify-between h-16 px-4"><div class="flex gap-1 items-center w-full justify-around">${tab('dashboard', '#/dashboard', 'layout-grid', 'Dashboard')}${tab('content', '#/content', 'book-open', 'Chapters')}${tab('workbook', '#/workbook', 'notebook-pen', 'Workbook')}<button type="button" data-locked="log" class="flex flex-col items-center gap-1 px-3 py-2 text-brand-teal hover:bg-brand-teal-10 rounded-lg transition-all font-brand-heading uppercase tracking-wider text-[10px] cursor-pointer">${icon('plus', 'w-5 h-5')}<span>Log</span></button></div></div></div>`;
  }

  /* ---------------------------------------------------------- */
  /* Shared pieces                                               */
  /* ---------------------------------------------------------- */
  function progressBar(value) {
    return `<div class="h-3 bg-white rounded-full overflow-hidden border border-[#2E2E2E]/5 shadow-inner"><div class="h-full transition-all duration-1000 ease-out" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" style="width: ${value}%; background-color: var(--brand-teal);"></div></div>`;
  }

  // The free introduction is its own milestone; this line keeps it honest about the whole course.
  function fullCourseNote() {
    return `<p class="text-small text-brand-muted">${freeDoneCount()} of ${FREE} free chapters complete · ${freeDoneCount()} of ${TOTAL} chapters in the full Toolkit</p>`;
  }

  const UPGRADE_BTN = 'free-btn-upgrade';

  /* ---------------------------------------------------------- */
  /* Dashboard                                                   */
  /* ---------------------------------------------------------- */
  function viewDashboard() {
    const done = freeDoneCount();
    const p = pct(done, FREE);
    const cur = current();
    const goals = state.tasks.goals;
    const started = done > 0 || Object.keys(state.tasks).length > 0;

    const goalsCard = goals && goals.done
      ? `<div class="space-y-6 sm:space-y-8 flex-1"><div class="space-y-3"><span class="text-label text-brand-muted">Your goal</span><p class="text-h2 text-brand-primary">${esc(goals.goal)}</p></div>${goals.identity ? `<div class="space-y-3"><span class="text-label text-brand-muted">Your Identity</span><p class="text-body text-brand-purple italic">"I want to be the kind of climber who ${esc(goals.identity)}"</p></div>` : ''}</div>`
      : `<div class="space-y-6 sm:space-y-8 flex-1"><div class="space-y-3"><span class="text-label text-brand-muted">Your goal</span><p class="text-body text-brand-muted">You’ll set your climbing goal and the kind of climber you want to become in Chapter 4.</p></div></div>`;

    const continueCard = cur
      ? { href: `#/chapter/${cur}`, title: started ? 'Continue Learning' : 'Start Learning', sub: `Next: ${esc(chapter(cur).title)}` }
      : { href: '#/complete', title: 'Free Introduction Complete', sub: 'See what comes next' };

    const lockedTile = (ic, title, text, feature) => `<button type="button" data-locked="${feature}" class="justify-center gap-2 text-sm font-medium shrink-0 text-left rounded-xl border border-brand-purple/10 bg-white hover:bg-white shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden flex items-stretch h-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 whitespace-normal"><div class="bg-brand-offwhite px-4 sm:px-6 flex items-center shrink-0">${icon(ic, 'text-brand-teal w-6 h-6 sm:w-8 sm:h-8')}</div><div class="p-6 flex-1 flex flex-col justify-center text-left"><div class="flex justify-between items-start"><div><h3 class="text-h3 text-brand-primary">${title}</h3><p class="text-body text-brand-muted mt-1">${text}</p><p class="free-pill mt-2">${icon('lock', 'w-3 h-3')}Full Toolkit</p></div>${icon('lock', 'text-brand-muted group-hover:text-brand-primary transition-all shrink-0 ml-2 w-4 h-4')}</div></div></button>`;

    return `<div class="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6"><div><h1 class="text-h1 text-brand-primary mb-2">${started ? 'Welcome back' : 'Welcome'}</h1><p class="text-body text-brand-muted font-medium">Your psychological training overview.</p></div><a href="#/content" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all shrink-0 outline-none bg-background hover:text-accent-foreground h-9 px-4 py-2 rounded-full font-bold border-2 border-brand-purple/20 text-brand-primary hover:bg-brand-offwhite w-full sm:w-auto">${icon('book-open', 'w-4 h-4 mr-2')} View All Chapters</a></div>
<div class="w-full space-y-3">${progressBar(p)}<div class="flex justify-between items-baseline px-1"><span class="text-sm font-black uppercase tracking-[0.2em] text-[#2E2E2E]">Free Introduction</span><span class="text-2xl font-black" style="color: rgb(63, 127, 105);">${p}% Complete</span></div><div class="px-1">${fullCourseNote()}</div></div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div class="text-card-foreground flex flex-col gap-6 rounded-xl border border-brand-purple/10 bg-white shadow-sm overflow-hidden h-full"><div class="p-6 sm:p-8 space-y-6 text-left h-full flex flex-col"><div class="flex items-center justify-between"><div class="flex items-center gap-3">${icon('target', 'w-5 h-5 text-brand-teal')}<h2 class="text-label text-brand-purple">Your Training Goals</h2></div>${taskOpen(task('goals')) ? `<a href="#/workbook/goals" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 outline-none gap-1.5 text-brand-muted hover:text-brand-primary rounded-full h-8 px-3">${icon('pencil', 'w-3.5 h-3.5 mr-1.5')}<span class="text-label">Edit</span></a>` : ''}</div>${goalsCard}</div></div>
<div class="text-card-foreground flex flex-col gap-6 rounded-xl border border-brand-purple/10 bg-white shadow-sm overflow-hidden h-full"><div class="p-6 sm:p-8 space-y-6 text-left h-full flex flex-col"><div class="flex items-center justify-between"><div class="flex items-center gap-3">${icon('sparkles', 'w-5 h-5 text-brand-teal')}<h2 class="text-label text-brand-purple">The Full Toolkit</h2></div></div><div class="space-y-4 flex-1"><p class="text-body text-brand-muted">You’re working through the free introduction: Chapters 1–5 of 21. The full course takes you from understanding your fear to practising falls at the wall.</p><ul class="free-ticks"><li>${icon('check', 'w-4 h-4')}Build your personal exposure ladder</li><li>${icon('check', 'w-4 h-4')}Eight guided fall-practice chapters, from top rope to lead</li><li>${icon('check', 'w-4 h-4')}Behavioural, cognitive and mindfulness resilience skills</li><li>${icon('check', 'w-4 h-4')}A practice logbook that tracks your fear over time</li></ul></div><a href="${UPGRADE}" class="${UPGRADE_BTN} free-btn-sm">Unlock Full Course ${icon('arrow-right', 'w-4 h-4')}</a></div></div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<a href="${continueCard.href}" class="justify-center gap-2 text-sm font-medium shrink-0 text-left rounded-xl border border-brand-purple/10 shadow-sm transition-all group cursor-pointer overflow-hidden flex items-stretch h-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 whitespace-normal bg-white hover:bg-white hover:shadow-md"><div class="bg-brand-teal px-4 sm:px-6 flex items-center shrink-0">${icon('book-open', 'text-white w-6 h-6 sm:w-8 sm:h-8')}</div><div class="p-6 flex-1 flex flex-col justify-center"><div class="flex justify-between items-start"><div><h3 class="text-h3 text-brand-primary">${continueCard.title}</h3><p class="text-label text-brand-teal mt-2">${continueCard.sub}</p></div>${icon('chevron-right', 'text-brand-muted group-hover:translate-x-1 group-hover:text-brand-primary transition-all shrink-0 ml-2')}</div></div></a>
<a href="#/workbook" class="justify-center gap-2 text-sm font-medium shrink-0 text-left rounded-xl border border-brand-purple/10 bg-white hover:bg-white shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden flex items-stretch h-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 whitespace-normal"><div class="bg-brand-offwhite px-4 sm:px-6 flex items-center shrink-0">${icon('notebook-pen', 'text-brand-primary w-6 h-6 sm:w-8 sm:h-8')}</div><div class="p-6 flex-1 flex flex-col justify-center text-left"><div class="flex justify-between items-start"><div><h3 class="text-h3 text-brand-primary">Workbook &amp; Logs</h3><p class="text-body text-brand-muted mt-1">Your fear profile and goals</p></div>${icon('chevron-right', 'text-brand-muted group-hover:translate-x-1 group-hover:text-brand-primary transition-all shrink-0 ml-2')}</div></div></a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">${lockedTile('trending-down', 'Progress Comparison', 'See how your fear levels have evolved', 'comparison')}</div>
<div class="text-card-foreground flex flex-col gap-6 rounded-xl border border-brand-teal bg-brand-teal-10 shadow-sm p-6 sm:p-8 text-left cursor-pointer hover:bg-brand-teal/20 transition-all group overflow-hidden" role="button" tabindex="0" data-locked="log" aria-label="Quick log, included in the full Toolkit"><div class="flex items-center justify-between gap-4"><div class="space-y-1"><h3 class="text-h2 text-brand-primary">Quick Log</h3><p class="text-label text-brand-teal">Record a practice session · Full Toolkit</p></div><div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">${icon('lock', 'w-6 h-6 sm:w-8 sm:h-8')}</div></div></div>
<div class="space-y-6 pt-6 sm:pt-10"><div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div class="space-y-1"><div class="flex items-center gap-3">${icon('clipboard-list', 'w-5 h-5 text-brand-teal')}<h3 class="text-label text-brand-purple">Training History</h3></div><p class="text-small text-brand-muted">Your logged practice sessions will appear here.</p></div></div><div class="free-empty">${icon('clipboard-list', 'w-6 h-6')}<p>Fall practice starts in Part 2 of the full Toolkit. Each session you log records your fear before, at its peak and after, so you can watch it come down.</p></div></div>
</div>`;
  }

  /* ---------------------------------------------------------- */
  /* Chapter contents                                            */
  /* ---------------------------------------------------------- */
  function chapterRow(c) {
    if (!isFree(c.n)) {
      return `<button type="button" data-locked="chapter" data-chapter="${c.n}" class="w-full flex items-start gap-5 p-6 rounded-2xl transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 relative overflow-hidden opacity-50 grayscale bg-zinc-50 cursor-pointer free-locked-row"><div class="flex-shrink-0 mt-1">${icon('lock', 'w-6 h-6 text-brand-primary-20')}</div><div class="flex-1 text-left"><h3 class="text-h3 font-brand-heading leading-tight transition-colors text-brand-muted">${c.n}. ${esc(c.title)}</h3></div></button>`;
    }
    if (!isOpen(c.n)) {
      return `<button disabled class="w-full flex items-start gap-5 p-6 rounded-2xl transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 relative overflow-hidden opacity-50 grayscale cursor-not-allowed bg-zinc-50"><div class="flex-shrink-0 mt-1">${icon('lock', 'w-6 h-6 text-brand-primary-20')}</div><div class="flex-1 text-left"><h3 class="text-h3 font-brand-heading leading-tight transition-colors text-brand-muted">${c.n}. ${esc(c.title)}</h3></div></button>`;
    }
    const t = c.task ? task(c.task) : null;
    const taskIcon = t
      ? (taskDone(t.id)
        ? `<div class="flex items-center justify-center w-10 h-10 rounded-full transition-all bg-brand-teal-10 text-brand-teal">${icon('notebook-pen', 'w-4 h-4 fill-brand-teal-20')}</div>`
        : `<div class="flex items-center justify-center w-10 h-10 rounded-full transition-all bg-brand-offwhite text-brand-purple-40">${icon('notebook-pen', 'w-4 h-4')}</div>`)
      : '';
    return `<a href="#/chapter/${c.n}" class="w-full flex items-start gap-5 p-6 rounded-2xl transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 relative overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-md hover:border-brand-primary-10 group">${isPreview(c.n) ? '<div class="absolute top-0 right-0 bg-brand-teal text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl shadow-sm z-10 uppercase tracking-widest">Preview</div>' : ''}<div class="flex-shrink-0 mt-1">${isDone(c.n) ? icon('circle-check', 'w-6 h-6 text-brand-teal') : icon('circle', 'w-6 h-6 text-brand-primary-10 group-hover:text-brand-purple')}</div><div class="flex-1 text-left"><h3 class="text-h3 font-brand-heading leading-tight transition-colors text-brand-primary group-hover:text-brand-teal">${c.n}. ${esc(c.title)}</h3></div><div class="flex items-center gap-3 self-center">${taskIcon}<div class="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-brand-offwhite hover:bg-brand-teal-10 group-hover:bg-brand-teal-10">${icon('play', 'w-3.5 h-3.5 ml-0.5 transition-all fill-brand-primary-30 text-brand-primary-30 group-hover:fill-white group-hover:text-white')}</div></div></a>`;
  }

  function viewContent() {
    const cur = current();
    const p = pct(freeDoneCount(), FREE);
    const resume = cur
      ? `<a href="#/chapter/${cur}" class="block w-full text-left rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#3F7F69] focus-visible:ring-offset-2"><div class="p-8 flex items-center justify-between gap-6 text-left"><div class="space-y-1 flex-1"><h2 class="text-h2 font-brand-heading text-brand-primary leading-tight">${cur}. ${esc(chapter(cur).title)}</h2><p class="text-small text-brand-muted font-brand-body italic">${freeDoneCount() ? 'Continuing where you left off...' : 'Start here'}</p></div><div class="flex-shrink-0"><span aria-hidden="true" class="group/btn w-16 h-16 rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 shadow-md border-brand-teal opacity-40 bg-brand-teal hover:brightness-110 cursor-pointer">${icon('play', 'w-6 h-6 text-white fill-current ml-1')}</span></div></div></a>`
      : `<a href="#/complete" class="block w-full text-left rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#3F7F69] focus-visible:ring-offset-2"><div class="p-8 flex items-center justify-between gap-6 text-left"><div class="space-y-1 flex-1"><h2 class="text-h2 font-brand-heading text-brand-primary leading-tight">Free introduction complete</h2><p class="text-small text-brand-muted font-brand-body italic">See what the full Toolkit adds...</p></div><div class="flex-shrink-0"><span aria-hidden="true" class="group/btn w-16 h-16 rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 shadow-md border-brand-teal bg-brand-teal hover:brightness-110 cursor-pointer">${icon('arrow-right', 'w-6 h-6 text-white')}</span></div></div></a>`;

    const free = C.chapters.filter((c) => isFree(c.n)).map(chapterRow).join('');
    const rest = C.chapters.filter((c) => !isFree(c.n)).map(chapterRow).join('');

    return `<div class="min-h-screen bg-white"><div class="max-w-4xl mx-auto px-8 py-12 space-y-12">
<div class="space-y-8"><a href="#/dashboard" class="group flex items-center gap-2 text-brand-purple hover:text-brand-primary transition-colors text-small font-brand-body">${icon('chevron-left', 'w-4 h-4 transition-transform group-hover:-translate-x-1')}Back to Dashboard</a>
<div class="rounded-3xl border border-brand-purple-15 bg-white p-7 space-y-6"><div class="space-y-2"><p class="text-label text-brand-purple">Course overview · Free introduction</p><h1 class="text-h1 text-brand-primary leading-tight">Fear of Falling Indoors</h1><p class="text-small text-brand-muted">Follow each chapter in order and complete workbook tasks to keep momentum.</p></div><div class="w-full space-y-3 space-y-0">${progressBar(p)}</div><div class="flex flex-wrap items-center justify-between gap-3 border-t border-brand-primary-10 pt-4"><span class="text-label text-brand-teal">Free introduction progress</span><span class="font-brand-heading text-brand-primary text-sm">${p}% complete</span></div>${fullCourseNote()}</div>
<div class="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 border-t border-brand-primary-10"><div class="flex items-center gap-2">${icon('circle-check', 'w-3 h-3 text-brand-teal')}<span class="text-label text-brand-purple">Chapter Complete</span></div><div class="flex items-center gap-2"><div class="w-6 h-6 rounded-full bg-brand-teal-10 flex items-center justify-center">${icon('notebook-pen', 'w-3 h-3 text-brand-teal fill-brand-teal-20')}</div><span class="text-label text-brand-purple">Task Complete</span></div><div class="flex items-center gap-2">${icon('lock', 'w-3 h-3 text-brand-purple')}<span class="text-label text-brand-purple">Full Toolkit</span></div></div></div>
<div class="space-y-4"><div class="flex items-center gap-2 text-brand-primary">${icon('bookmark', 'w-5 h-5 fill-current')}<span class="text-label text-brand-primary">Resume Learning</span></div>${resume}</div>
<div class="space-y-6"><h2 class="text-h2 font-brand-heading text-brand-primary px-1 text-left">Chapter Contents</h2><div class="space-y-3">${free}</div>
<div class="free-divider"><div><p class="text-label text-brand-teal">Chapters 6–${TOTAL} · Full Toolkit</p><p class="text-small text-brand-muted">The exposure ladder, guided fall practice and your practice logbook.</p></div><a href="${UPGRADE}" class="free-link">Unlock ${icon('arrow-right', 'w-4 h-4')}</a></div>
<div class="space-y-3">${rest}</div></div>
</div></div>`;
  }

  /* ---------------------------------------------------------- */
  /* Lesson page                                                 */
  /* ---------------------------------------------------------- */
  const CLS = {
    h2: 'mt-14 mb-6 flex items-center gap-4 text-1xl font-bold tracking-tight text-stone-800 md:text-3xl',
    h3: 'mt-10 mb-4 text-xl font-extrabold tracking-tight text-stone-800 md:text-2xl',
    p: 'mb-6 text-lg font-normal leading-relaxed text-stone-600 antialiased',
    list: 'my-6 space-y-1',
    li: 'mb-3 flex gap-4 text-lg text-stone-600',
    hr: 'my-12 border-stone-100',
    quote: 'my-10 rounded-r-3xl bg-stone-50 py-6 pr-6 pl-8 italic shadow-sm border-l-4 border-[#3F7F69]',
    quoteInner: 'text-lg leading-relaxed text-stone-700 prose-p:m-0',
    a: 'font-bold text-[#3F7F69] underline decoration-2 underline-offset-4 transition-colors hover:text-stone-900',
  };

  // Turns the plain lesson HTML in content.js into the full course's rendered markup.
  function lessonHtml(src) {
    const tpl = document.createElement('template');
    tpl.innerHTML = src.trim();
    const root = tpl.content;
    root.querySelectorAll('h2').forEach((el) => { el.className = CLS.h2; el.insertAdjacentHTML('afterbegin', '<span class="h-8 w-1.5 shrink-0 rounded-full bg-[#3F7F69]"></span>'); });
    root.querySelectorAll('h3').forEach((el) => { el.className = CLS.h3; });
    root.querySelectorAll('p').forEach((el) => { el.className = CLS.p; });
    root.querySelectorAll('ul, ol').forEach((el) => { el.className = CLS.list; });
    root.querySelectorAll('li').forEach((el) => {
      el.className = CLS.li;
      el.innerHTML = `<div class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3F7F69]"></div><span>${el.innerHTML}</span>`;
    });
    root.querySelectorAll('hr').forEach((el) => { el.className = CLS.hr; });
    root.querySelectorAll('a').forEach((el) => { el.className = CLS.a; el.target = '_blank'; el.rel = 'noopener noreferrer'; });
    root.querySelectorAll('blockquote').forEach((el) => {
      const outer = document.createElement('div');
      outer.className = CLS.quote;
      outer.innerHTML = `<div class="${CLS.quoteInner}">${el.innerHTML}</div>`;
      el.replaceWith(outer);
    });
    const out = document.createElement('div');
    out.appendChild(root);
    return out.innerHTML;
  }

  function videoBlock(c) {
    const id = youtubeId(c.video);
    const inner = id
      ? `<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1" title="Chapter ${c.n}: ${esc(c.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : `<p class="text-white/60 text-sm">Video coming soon</p>`;
    return `<div class=""><div class="w-full aspect-video bg-black flex items-center justify-center relative group overflow-hidden shadow-xl">${inner}</div></div>`;
  }

  const BTN = 'inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none px-4 py-2 h-14 rounded-full font-bold text-xs uppercase tracking-widest transition-all border-2';
  const NAV_BTN = `${BTN} flex-1 border-zinc-100 text-gray-400 hover:text-zinc-900 hover:border-zinc-900`;
  const NAV_BTN_OFF = `${BTN} flex-1 border-zinc-50 text-gray-300 cursor-not-allowed opacity-50`;

  function taskSection(c) {
    if (!c.task) return '';
    const t = task(c.task);
    const head = `<div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-[#1F3A4D]/5 flex items-center justify-center">${icon('book-open', 'w-4 h-4 text-[#1F3A4D]')}</div><h3 class="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">Associated Workbook Task</h3></div>`;
    const base = 'w-full flex items-center justify-between p-8 rounded-[2rem] transition-all border-2 text-left group outline-none focus-visible:ring-2 focus-visible:ring-[#3F7F69] focus-visible:ring-offset-2';
    let card;
    if (taskDone(t.id)) {
      card = `<a href="#/workbook/${t.id}" class="${base} bg-white border-stone-100 opacity-80 hover:border-[#1F3A4D]/20 cursor-pointer"><div class="flex items-center gap-6"><div class="flex-shrink-0">${icon('circle-check', 'w-8 h-8 text-[#3F7F69]')}</div><div><h4 class="text-xl font-bold text-stone-400">${esc(t.title)}</h4><p class="text-stone-400 text-sm font-medium">Great work! You have documented this step in your workbook.</p></div></div><div class="flex items-center gap-2"><span class="text-[10px] font-black uppercase tracking-widest text-[#3F7F69]">View Task</span>${icon('chevron-right', 'w-6 h-6 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all')}</div></a>`;
    } else if (taskOpen(t)) {
      card = `<a href="#/workbook/${t.id}" class="${base} bg-white border-[#3F7F69] shadow-sm cursor-pointer free-task-open"><div class="flex items-center gap-6"><div class="flex-shrink-0">${icon('notebook-pen', 'w-8 h-8 text-[#3F7F69]')}</div><div><h4 class="text-xl font-bold text-stone-900">${esc(t.title)}</h4><p class="text-stone-400 text-sm font-medium">Document your progress to unlock the next chapter.</p></div></div><div class="flex items-center gap-2"><span class="text-[10px] font-black uppercase tracking-widest text-[#3F7F69]">Start Task</span>${icon('chevron-right', 'w-6 h-6 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all')}</div></a>`;
    } else {
      card = `<button disabled class="${base} bg-white border-stone-100 opacity-50 cursor-not-allowed"><div class="flex items-center gap-6"><div class="flex-shrink-0">${icon('lock', 'w-8 h-8 text-stone-300')}</div><div><h4 class="text-xl font-bold text-stone-400">${esc(t.title)}</h4><p class="text-stone-400 text-sm font-medium">Complete the previous lesson to unlock this task.</p></div></div><div class="flex items-center gap-2"><span class="text-[10px] font-black uppercase tracking-widest text-stone-300">Locked</span></div></button>`;
    }
    return `<div class="space-y-6 pt-16 border-t border-stone-100">${head}${card}</div>`;
  }

  function lessonFooter(c) {
    const n = c.n;
    let main;
    if (isDone(n)) {
      main = `<button class="${BTN} w-full border-gray-50 text-gray-300 bg-gray-50/50" disabled>Lesson Finished</button>`;
    } else if (isPreview(n)) {
      main = `<button class="${BTN} w-full border-gray-50 text-gray-300 cursor-not-allowed opacity-50" disabled><span class="flex items-center gap-2">${icon('lock', 'w-3 h-3')} Complete previous lesson first</span></button>`;
    } else if (!canComplete(n)) {
      main = `<button class="${BTN} w-full border-gray-50 text-gray-300 cursor-not-allowed opacity-50" disabled><span class="flex items-center gap-2">${icon('notebook-pen', 'w-3 h-3')} Task Incomplete: Workbook entry required</span></button>`;
    } else {
      main = `<button type="button" data-action="complete" data-n="${n}" class="${BTN} w-full border-zinc-200 text-zinc-900 hover:border-zinc-900 hover:bg-transparent shadow-sm">Mark as Complete</button>`;
    }

    const prev = n > 1 ? `<a href="#/chapter/${n - 1}" class="${NAV_BTN}">${icon('chevron-left', 'mr-2 w-4 h-4')} Previous</a>` : '';
    let next;
    if (isDone(n)) {
      next = n < FREE
        ? `<a href="#/chapter/${n + 1}" class="${NAV_BTN}">Next Lesson ${icon('chevron-right', 'ml-2 w-4 h-4')}</a>`
        : `<a href="#/complete" class="${BTN} flex-1 border-[#3F7F69] text-[#3F7F69] hover:bg-[#3F7F69] hover:text-white">Finish Free Introduction ${icon('chevron-right', 'ml-2 w-4 h-4')}</a>`;
    } else if (isCurrent(n) && n < FREE) {
      next = `<a href="#/chapter/${n + 1}" class="${NAV_BTN}">Preview Next Lesson ${icon('chevron-right', 'ml-2 w-4 h-4')}</a>`;
    } else {
      next = `<button class="${NAV_BTN_OFF}" disabled>${n < FREE ? 'Preview Next Lesson' : 'Next Lesson'} ${icon('chevron-right', 'ml-2 w-4 h-4')}</button>`;
    }
    return `<div class="pt-8 border-t border-stone-200"><div class="space-y-6 pt-12 border-t border-gray-50">${main}<div class="flex flex-col sm:flex-row gap-4">${prev}${next}</div></div></div>`;
  }

  function chapterTop(c, badge, finished) {
    return `<div class="flex items-center justify-between border-b border-gray-50 pb-8"><div class="flex items-center gap-6"><a href="#/dashboard" class="group flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-xs uppercase tracking-tight">${icon('chevron-left', 'w-4 h-4 transition-transform group-hover:-translate-x-1')}Dashboard</a><div class="h-4 w-px bg-gray-100"></div></div>${finished ? `<div class="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">${icon('circle-check', 'w-4 h-4 text-green-500/50')}Lesson Finished</div>` : ''}</div>
<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-[11px] font-bold uppercase tracking-[0.4em] text-stone-400">Chapter ${pad(c.n)}</span>${badge || ''}</div><h1 class="text-5xl font-bold text-stone-900 tracking-tight leading-tight">${esc(c.title)}</h1></div>`;
  }

  const PREVIEW_BADGE = '<span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#3F7F69] bg-[#3F7F69]/5 px-3 py-1 rounded-full border border-[#3F7F69]/10">Preview Mode</span>';
  const TOOLKIT_BADGE = `<span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#3F7F69] bg-[#3F7F69]/5 px-3 py-1 rounded-full border border-[#3F7F69]/10 inline-flex items-center gap-1.5">${icon('lock', 'w-3 h-3')}Full Toolkit</span>`;

  function viewChapter(n) {
    const c = chapter(n);
    if (!c) return null;
    const shell = (inner) => `<div class="min-h-screen bg-[#FCFBFA]"><div class="max-w-4xl mx-auto px-8 py-12 space-y-12">${inner}</div></div>`;

    // Chapters 6+: no lesson content exists in the free version.
    if (!isFree(n)) {
      const remaining = TOTAL - FREE;
      return shell(`${chapterTop(c, TOOLKIT_BADGE, false)}
<div class="w-full aspect-video bg-black relative overflow-hidden shadow-xl free-locked-video"><div class="free-locked-video-inner">${icon('lock', 'w-8 h-8')}<p class="free-locked-title">This chapter is part of the full Fear of Falling Toolkit</p><p class="free-locked-sub">The free introduction covers Chapters 1–${FREE}. The full Toolkit adds ${remaining} more chapters, including guided fall practice at the wall.</p><a href="${UPGRADE}" class="${UPGRADE_BTN}">Unlock the Full Toolkit ${icon('arrow-right', 'w-4 h-4')}</a></div></div>
<div class="max-w-2xl mx-auto space-y-6"><div class="flex flex-col sm:flex-row gap-4"><a href="#/content" class="${NAV_BTN}">${icon('chevron-left', 'mr-2 w-4 h-4')} Chapter Contents</a><a href="#/chapter/${current() || FREE}" class="${NAV_BTN}">${current() ? 'Continue Learning' : `Back to Chapter ${FREE}`} ${icon('chevron-right', 'ml-2 w-4 h-4')}</a></div></div>`);
    }

    // Free chapters not reached yet.
    if (!isOpen(n)) {
      const cur = current();
      return shell(`${chapterTop(c, '', false)}
<div class="w-full aspect-video bg-black relative overflow-hidden shadow-xl free-locked-video"><div class="free-locked-video-inner">${icon('lock', 'w-8 h-8')}<p class="free-locked-title">Chapter Locked</p><p class="free-locked-sub">Chapters unlock in order. Finish Chapter ${cur} to keep going.</p><a href="#/chapter/${cur}" class="free-btn-light">Go to Chapter ${cur} ${icon('arrow-right', 'w-4 h-4')}</a></div></div>`);
    }

    return shell(`${chapterTop(c, isPreview(n) ? PREVIEW_BADGE : '', isDone(n))}
${videoBlock(c)}
<div class="max-w-2xl mx-auto space-y-16"><div class="w-full"><article class="space-y-8">${lessonHtml(c.html)}</article></div>${taskSection(c)}${lessonFooter(c)}</div>`);
  }

  /* ---------------------------------------------------------- */
  /* Workbook                                                    */
  /* ---------------------------------------------------------- */
  function viewWorkbook() {
    const card = (t) => {
      const free = isFree(t.chapter);
      if (free && taskOpen(t)) {
        const done = taskDone(t.id);
        return `<a href="#/workbook/${t.id}" class="w-full flex items-start gap-6 p-8 rounded-[2rem] transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#3F7F69] focus-visible:ring-offset-2 text-left bg-white shadow-sm hover:shadow-md hover:border-[#1F3A4D]/10 group cursor-pointer"><div class="flex-shrink-0 mt-1">${done ? icon('circle-check', 'w-6 h-6 text-[#3F7F69]') : icon('circle', 'w-6 h-6 text-brand-primary-10 group-hover:text-brand-purple')}</div><div class="flex-grow text-left space-y-1"><div class="flex items-center gap-3"><span class="text-[10px] font-black text-[#594A6B]/30 uppercase tracking-[0.3em]">Task ${t.letter}</span></div><h3 class="text-2xl font-bold tracking-tight transition-colors text-[#2E2E2E] group-hover:text-[#3F7F69]">${esc(t.title)}</h3><p class="text-sm font-medium leading-relaxed text-[#594A6B]/60">${esc(t.description)}</p></div>${icon('chevron-right', 'w-5 h-5 mt-2 transition-all text-[#3F7F69]')}</a>`;
      }
      const badge = free
        ? `<span class="text-[9px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Locked: Complete Lesson ${t.chapter - 1}</span>`
        : `<span class="free-pill">${icon('lock', 'w-3 h-3')}Full Toolkit</span>`;
      const attrs = free ? 'disabled' : `type="button" data-locked="task" data-task="${t.id}"`;
      return `<button ${attrs} class="w-full flex items-start gap-6 p-8 rounded-[2rem] transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#3F7F69] focus-visible:ring-offset-2 text-left bg-gray-50/50 opacity-60 ${free ? 'cursor-not-allowed' : 'cursor-pointer free-locked-row'}"><div class="flex-shrink-0 mt-1">${icon('lock', 'w-6 h-6 text-gray-300')}</div><div class="flex-grow text-left space-y-1"><div class="flex items-center gap-3"><span class="text-[10px] font-black text-[#594A6B]/30 uppercase tracking-[0.3em]">Task ${t.letter}</span>${badge}</div><h3 class="text-2xl font-bold tracking-tight transition-colors text-gray-400">${esc(t.title)}</h3><p class="text-sm font-medium leading-relaxed text-gray-300">${esc(t.description)}</p></div></button>`;
    };
    return `<div class="max-w-4xl mx-auto px-8 py-12 space-y-8"><div class="space-y-2"><h1 class="text-4xl font-bold tracking-tighter text-[#2E2E2E]">The Workbook</h1><p class="text-[#594A6B]/70 font-medium italic">Document your progression and build your mental toolkit.</p></div><div class="grid gap-4">${C.tasks.map(card).join('')}</div></div>`;
  }

  function workbookShell(title, sub, body, saveLabel, saveOn) {
    return `<div class="min-h-screen bg-[#FDFDFD]"><div class="max-w-4xl mx-auto px-8 py-12 space-y-12"><div class="space-y-4 md:space-y-6 text-left mb-8 md:mb-0"><a href="#/workbook" class="group flex items-center gap-2 text-[#594A6B] hover:text-[#2E2E2E] transition-colors font-bold text-sm uppercase tracking-tight">${icon('chevron-left', 'w-4 h-4 transition-transform group-hover:-translate-x-1')}Back to Workbook</a><div class="space-y-2"><h1 class="text-2xl md:text-4xl font-bold tracking-tight text-[#2E2E2E]">${title}</h1><p class="text-[#594A6B]/70 text-base md:text-lg font-medium leading-relaxed max-w-2xl">${sub}</p></div></div><div class="pt-10 space-y-10">${body}</div><div class="pt-8 text-center space-y-6"><button type="button" data-action="save-task" ${saveOn ? '' : 'disabled'} class="whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none px-4 py-2 btn-brand-primary w-full rounded-full h-20 text-xl font-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0 flex items-center justify-center gap-3">${saveLabel}</button></div></div></div>`;
  }

  const sectionHead = (title, hint, counter) => `<div class="px-2 flex justify-between items-end"><div><h2 class="text-xl font-bold text-[#2E2E2E]">${title}</h2><p class="text-sm text-[#594A6B]/60 font-medium">${hint}</p></div>${counter || ''}</div>`;
  const cardWrap = (inner, extra = '') => `<div class="text-card-foreground flex flex-col gap-6 rounded-[2rem] border-2 transition-all overflow-hidden border-transparent bg-white shadow-sm"><div class="p-8 ${extra}">${inner}</div></div>`;

  // Unsaved edits on a task page live here until "save"; they survive re-renders but not reloads.
  let draft = null;

  function viewFear() {
    const saved = state.tasks.fear || {};
    if (!draft || draft.id !== 'fear') draft = { id: 'fear', sel: {} };
    C.fearSections.forEach((s) => { if (!draft.sel[s.key]) draft.sel[s.key] = (saved[s.key] || []).slice(); });
    const any = C.fearSections.some((s) => draft.sel[s.key].length);
    const body = C.fearSections.map((s) => {
      const opts = s.options.map((o, i) => {
        const on = draft.sel[s.key].includes(o);
        return `<label class="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${on ? 'border-[#3F7F69] bg-[#3F7F69]/5 shadow-sm' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}"><button type="button" role="checkbox" aria-checked="${on}" data-state="${on ? 'checked' : 'unchecked'}" data-action="toggle" data-section="${s.key}" data-index="${i}" class="peer bg-input-background data-[state=checked]:text-white size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:bg-[#3F7F69] data-[state=checked]:border-[#3F7F69] flex items-center justify-center">${on ? icon('check', 'size-3.5') : ''}</button><span class="text-sm font-bold leading-tight ${on ? 'text-[#1F3A4D]' : 'text-[#594A6B]'}">${esc(o)}</span></label>`;
      }).join('');
      return `<div id="section-${s.key}"><div class="space-y-4">${sectionHead(s.title, s.hint)}${cardWrap(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${opts}</div>`)}</div></div>`;
    }).join('');
    return workbookShell('Getting to Know Your Fear', 'Identify the patterns and triggers that define your fear profile.', body, 'Confirm &amp; Save Fear Profile', any);
  }

  const GOAL_FIELDS = [
    { key: 'goal', max: 100, placeholder: 'e.g. Lead climb 6c comfortably at my local wall' },
    { key: 'q1', max: 50, placeholder: 'e.g. Calculated commitment', label: 'Quality 1' },
    { key: 'q2', max: 50, placeholder: 'e.g. Remaining calm under pressure', label: 'Quality 2' },
    { key: 'q3', max: 50, placeholder: 'e.g. Willing to try new routes', label: 'Quality 3' },
    { key: 'identity', max: 300, placeholder: '...faces challenges with courage and learns from every fall.' },
  ];
  const INPUT = 'flex w-full min-w-0 px-3 py-1 outline-none h-14 rounded-2xl bg-zinc-50 border-2 transition-all text-lg font-medium border-transparent focus:bg-white focus:border-[#3F7F69]';
  const counter = (key, max) => `<span class="text-[10px] font-black text-[#594A6B]/30 uppercase tracking-[0.2em]" data-count="${key}">${(draft.val[key] || '').length} / ${max}</span>`;

  function viewGoals() {
    const saved = state.tasks.goals || {};
    if (!draft || draft.id !== 'goals') draft = { id: 'goals', val: {} };
    GOAL_FIELDS.forEach((f) => { if (draft.val[f.key] === undefined) draft.val[f.key] = saved[f.key] || ''; });
    const f = Object.fromEntries(GOAL_FIELDS.map((x) => [x.key, x]));
    const input = (k) => `<input data-field="${k}" class="${INPUT}" placeholder="${esc(f[k].placeholder)}" maxlength="${f[k].max}" value="${esc(draft.val[k])}"${f[k].label ? ` aria-label="${f[k].label}"` : ' aria-label="Your SMART goal"'}>`;
    const quality = (k) => `<div class="space-y-2"><div class="flex justify-between items-center ml-1"><label class="flex items-center gap-2 select-none text-xs font-bold uppercase text-[#594A6B]/40 tracking-widest">${f[k].label}</label>${counter(k, f[k].max)}</div>${input(k)}</div>`;
    const body = `<div class="space-y-4" id="section-goal">${sectionHead('Your SMART Goal', 'What specific outcome do you want to achieve?', `<div class="flex flex-col items-end gap-1">${counter('goal', 100)}</div>`)}${cardWrap(input('goal'))}</div>
<div class="space-y-4" id="section-qualities">${sectionHead('Three Qualities to Copy', 'What traits do you admire in other climbers?')}${cardWrap(quality('q1') + quality('q2') + quality('q3'), 'space-y-6')}</div>
<div class="space-y-4" id="section-identity">${sectionHead('The Kind of Climber You Want to Be', '"I want to be the kind of climber who..."', `<div class="flex flex-col items-end gap-1">${counter('identity', 300)}</div>`)}${cardWrap(`<textarea data-field="identity" aria-label="The kind of climber you want to be" class="resize-none flex w-full outline-none rounded-2xl min-h-32 bg-zinc-50 border-2 transition-all p-6 text-lg font-medium border-transparent focus:bg-white focus:border-[#3F7F69]" placeholder="${esc(f.identity.placeholder)}" maxlength="300">${esc(draft.val.identity)}</textarea>`)}</div>`;
    return workbookShell('Setting Goals', 'Define clear, meaningful goals for your journey. What specific outcome do you want to achieve?', body, 'Finalise My Goals', !!draft.val.goal.trim());
  }

  function viewTask(id) {
    const t = task(id);
    if (!t) return null;
    if (!isFree(t.chapter)) {
      return `<div class="max-w-4xl mx-auto px-8 py-12 space-y-8"><a href="#/workbook" class="group flex items-center gap-2 text-[#594A6B] hover:text-[#2E2E2E] transition-colors font-bold text-sm uppercase tracking-tight">${icon('chevron-left', 'w-4 h-4 transition-transform group-hover:-translate-x-1')}Back to Workbook</a><div class="free-locked-panel">${icon('lock', 'w-8 h-8')}<p class="text-label text-brand-teal">Task ${t.letter} · Full Toolkit</p><h1 class="text-h1 text-brand-primary">${esc(t.title)}</h1><p class="text-body text-brand-muted">${esc(t.description)} This workbook task is part of the full Fear of Falling Toolkit.</p><a href="${UPGRADE}" class="${UPGRADE_BTN}">Unlock the Full Toolkit ${icon('arrow-right', 'w-4 h-4')}</a></div></div>`;
    }
    if (!taskOpen(t)) {
      return `<div class="max-w-4xl mx-auto px-8 py-12 space-y-8"><a href="#/workbook" class="group flex items-center gap-2 text-[#594A6B] hover:text-[#2E2E2E] transition-colors font-bold text-sm uppercase tracking-tight">${icon('chevron-left', 'w-4 h-4 transition-transform group-hover:-translate-x-1')}Back to Workbook</a><div class="free-locked-panel">${icon('lock', 'w-8 h-8')}<p class="text-label text-brand-teal">Task ${t.letter}</p><h1 class="text-h1 text-brand-primary">${esc(t.title)}</h1><p class="text-body text-brand-muted">Complete Lesson ${t.chapter - 1} to unlock this task.</p><a href="#/chapter/${current()}" class="free-btn-outline">Go to Chapter ${current()} ${icon('arrow-right', 'w-4 h-4')}</a></div></div>`;
    }
    return id === 'fear' ? viewFear() : viewGoals();
  }

  /* ---------------------------------------------------------- */
  /* End of the free introduction                                */
  /* ---------------------------------------------------------- */
  function viewComplete() {
    const fear = state.tasks.fear || {};
    const goals = state.tasks.goals || {};
    const count = (k, one, many) => { const n = (fear[k] || []).length; return `${n} ${n === 1 ? one : many}`; };
    const profile = taskDone('fear')
      ? `You mapped your fear profile: ${count('triggers', 'trigger', 'triggers')}, ${count('thoughts', 'automatic thought', 'automatic thoughts')}, ${count('bodySymptoms', 'physical response', 'physical responses')} and ${count('behaviours', 'safety behaviour', 'safety behaviours')}.`
      : 'You learned to break fear down into triggers, thoughts, body sensations and behaviour.';
    const recap = [
      ['Introduction', 'How the course works, and how to practise safely.'],
      ['What is Fear?', 'Fear as a protective system, and how avoidance keeps it going.'],
      ['Getting To Know Your Fear', profile],
      ['Setting Goals', taskDone('goals') ? `You set your goal: “${esc(goals.goal)}”.` : 'Why a clear, personal goal gives fear a direction.'],
      ['What is Exposure Therapy', 'Why fear rises and falls, and the four rules of exposure.'],
    ];
    const next = [
      ['list-ordered', 'Build your exposure ladder', 'Turn what you’ve learned into a personal, graded plan of falls, from least to most frightening.'],
      ['activity', 'Eight guided fall-practice chapters', 'Step by step at the wall: top rope with no slack, through to lead falls above the bolt and climbing at your limit.'],
      ['brain', 'Resilience skills', 'Behavioural, cognitive and mindfulness tools for the moments when fear spikes.'],
      ['trending-down', 'Track your progress', 'Log every session with your fear before, at its peak and after, and see it come down over time.'],
    ];
    return `<div class="min-h-screen bg-[#FCFBFA]"><div class="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16 space-y-12">
<div class="free-hero"><div class="free-hero-badge">${icon('circle-check', 'w-4 h-4')}Free introduction complete</div><h1 class="free-hero-title">You’ve completed the free introduction!</h1><p class="free-hero-lead">You’ve now taken the first steps towards understanding your fear of falling and developing the skills to manage it.</p>
<div class="free-hero-progress"><div class="free-seg">${C.chapters.map((c) => `<span class="${isFree(c.n) ? 'on' : ''}" title="Chapter ${c.n}"></span>`).join('')}</div><p class="text-small text-brand-muted">${FREE} of ${FREE} free chapters complete · ${FREE} of ${TOTAL} chapters in the full Toolkit</p></div></div>
<section class="space-y-5"><h2 class="text-label text-brand-purple">What you’ve covered</h2><ol class="free-recap">${recap.map(([t, d], i) => `<li><span class="free-recap-num">${icon('check', 'w-4 h-4')}</span><div><p class="free-recap-title">${i + 1}. ${t}</p><p class="free-recap-text">${d}</p></div></li>`).join('')}</ol></section>
<section class="free-next"><p class="free-next-lead">But understanding your fear is only the beginning.</p><p class="text-body text-brand-muted">This is where you’ve reached the end of the free content. The change happens at the wall: exposure works through repeated, graded experience, and the full Toolkit gives you the structure to do it safely.</p>${taskDone('goals') ? `<p class="free-goal">${icon('target', 'w-5 h-5')}<span>It’s the practical work that moves you towards your goal: <strong>${esc(goals.goal)}</strong></span></p>` : ''}
<ul class="free-features">${next.map(([ic, t, d]) => `<li>${icon(ic, 'w-5 h-5')}<div><p class="free-feature-title">${t}</p><p class="free-feature-text">${d}</p></div></li>`).join('')}</ul>
<div class="free-cta"><p class="free-cta-q">Ready to take the next step?</p><a href="${UPGRADE}" class="${UPGRADE_BTN} free-btn-lg">Unlock the Full Fear of Falling Toolkit ${icon('arrow-right', 'w-5 h-5')}</a><p class="text-small text-brand-muted">${TOTAL - FREE} more chapters, the full workbook and your practice logbook.</p></div></section>
<div class="flex flex-col sm:flex-row gap-4"><a href="#/content" class="${NAV_BTN}">${icon('book-open', 'mr-2 w-4 h-4')} Review chapters</a><a href="#/dashboard" class="${NAV_BTN}">Back to Dashboard ${icon('chevron-right', 'ml-2 w-4 h-4')}</a></div>
</div></div>`;
  }

  /* ---------------------------------------------------------- */
  /* Locked-content dialog                                       */
  /* ---------------------------------------------------------- */
  let lastFocus = null;
  function openLocked(kind, ref) {
    let title = 'Included in the full Toolkit';
    let text;
    if (kind === 'chapter') {
      const c = chapter(Number(ref));
      title = `Chapter ${c.n}: ${c.title}`;
      text = `This chapter is part of the full Fear of Falling Toolkit. The free introduction covers Chapters 1–${FREE}; the full course continues with the exposure ladder, guided fall practice and resilience skills.`;
    } else if (kind === 'task') {
      const t = task(ref);
      title = `Task ${t.letter}: ${t.title}`;
      text = `${t.description} This workbook task comes with Chapter ${t.chapter} of the full Fear of Falling Toolkit.`;
    } else if (kind === 'comparison') {
      text = 'Progress Comparison charts how your fear changes across your practice sessions. It’s part of the full Fear of Falling Toolkit.';
    } else {
      text = 'Logging practice sessions starts with the guided fall-practice chapters in Part 2 of the full Fear of Falling Toolkit.';
    }
    lastFocus = document.activeElement;
    $('#modal-root').innerHTML = `<div class="free-modal-backdrop" data-action="close-modal"><div class="free-modal" role="dialog" aria-modal="true" aria-labelledby="free-modal-title"><button type="button" class="free-modal-x" data-action="close-modal" aria-label="Close">${icon('x', 'w-5 h-5')}</button><div class="free-modal-icon">${icon('lock', 'w-6 h-6')}</div><p class="text-label text-brand-teal">Full Toolkit</p><h2 id="free-modal-title" class="free-modal-title">${esc(title)}</h2><p class="text-body text-brand-muted">${text}</p><div class="free-modal-actions"><a href="${UPGRADE}" class="${UPGRADE_BTN}">Unlock Full Course ${icon('arrow-right', 'w-4 h-4')}</a><button type="button" class="free-btn-outline" data-action="close-modal">Keep learning</button></div></div></div>`;
    lucide.createIcons();
    $('#modal-root .free-modal a').focus();
  }
  function closeModal() {
    $('#modal-root').innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'free-toast';
    el.innerHTML = `${icon('circle-check', 'w-4 h-4')}<span>${esc(msg)}</span>`;
    $('#toast-root').appendChild(el);
    lucide.createIcons();
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3000);
  }

  /* ---------------------------------------------------------- */
  /* Router                                                      */
  /* ---------------------------------------------------------- */
  let lastRoute = null;
  function route() {
    const path = (location.hash.replace(/^#/, '') || '/dashboard').replace(/\/+$/, '');
    const parts = path.split('/').filter(Boolean);
    let html = null;
    let active = parts[0];
    if (parts[0] === 'dashboard') html = viewDashboard();
    else if (parts[0] === 'content') html = viewContent();
    else if (parts[0] === 'chapter') { html = viewChapter(Number(parts[1])); active = 'content'; }
    else if (parts[0] === 'workbook' && !parts[1]) html = viewWorkbook();
    else if (parts[0] === 'workbook') html = viewTask(parts[1]);
    else if (parts[0] === 'complete') { html = allFreeDone() ? viewComplete() : null; active = 'content'; }
    if (html === null) { location.replace('#/dashboard'); return; }

    if (!path.startsWith('/workbook/')) draft = null;
    renderNav(active);
    $('#app').innerHTML = html;
    lucide.createIcons();
    if (path !== lastRoute) { window.scrollTo(0, 0); $('#app').focus({ preventScroll: true }); }
    lastRoute = path;
  }

  /* ---------------------------------------------------------- */
  /* Events                                                      */
  /* ---------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const locked = e.target.closest('[data-locked]');
    if (locked) { e.preventDefault(); openLocked(locked.dataset.locked, locked.dataset.chapter || locked.dataset.task); return; }

    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'close-modal') { if (e.target === a || a.tagName === 'BUTTON') closeModal(); return; }

    if (act === 'complete') {
      const n = Number(a.dataset.n);
      if (!canComplete(n)) return;
      state.done[n] = true;
      if (allFreeDone() && !state.finishedAt) state.finishedAt = new Date().toISOString();
      save();
      if (n === FREE) { location.hash = '#/complete'; return; }
      toast(`Chapter ${n} complete`);
      route();
    }

    if (act === 'toggle') {
      e.preventDefault();
      const s = a.dataset.section;
      const opt = C.fearSections.find((x) => x.key === s).options[Number(a.dataset.index)];
      const list = draft.sel[s];
      const i = list.indexOf(opt);
      if (i >= 0) list.splice(i, 1); else list.push(opt);
      route();
      const again = document.querySelector(`[data-action="toggle"][data-section="${s}"][data-index="${a.dataset.index}"]`);
      if (again) again.focus({ preventScroll: true });
    }

    if (act === 'save-task' && draft) {
      if (draft.id === 'fear') {
        state.tasks.fear = Object.assign({ done: true, savedAt: new Date().toISOString() }, draft.sel);
        save();
        toast('Fear profile saved');
        location.hash = '#/chapter/3';
      } else if (draft.id === 'goals') {
        const v = {};
        GOAL_FIELDS.forEach((f) => { v[f.key] = (draft.val[f.key] || '').trim(); });
        if (!v.goal) return;
        state.tasks.goals = Object.assign({ done: true, savedAt: new Date().toISOString() }, v);
        save();
        toast('Goals saved');
        location.hash = '#/chapter/4';
      }
    }
  });

  document.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.field;
    if (!k || !draft || draft.id !== 'goals') return;
    draft.val[k] = e.target.value;
    const max = GOAL_FIELDS.find((f) => f.key === k).max;
    const cnt = document.querySelector(`[data-count="${k}"]`);
    if (cnt) cnt.textContent = `${e.target.value.length} / ${max}`;
    const btn = document.querySelector('[data-action="save-task"]');
    if (btn) btn.disabled = !draft.val.goal.trim();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal();
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('[role="button"][data-locked]')) { e.preventDefault(); t.click(); }
  });

  window.addEventListener('hashchange', route);
  route();
})();
