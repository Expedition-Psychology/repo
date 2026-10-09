/* ============================================================
   Fear of Falling Essentials — interactive prototype
   Vanilla JS, hash routing, progress persisted to localStorage.
   Anything that would need accounts, a database or payments in
   the live product is listed on the #/notes page.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------- */
  /* Storage                                                     */
  /* ---------------------------------------------------------- */
  const KEY = 'ep-fof-essentials-v1';
  const blank = () => ({
    v: 1,
    m1: { triggers: [], thoughts: [], body: [], behaviours: [], extra: '', done: false },
    ladder: [],
    ladderSaved: false,
    sessions: [],
    draft: null,
    dismissed: {},
  });
  let state = load();
  let saveTimer = null;
  const ui = { editing: null, openSession: null, confirmDelete: null, justSaved: null, lastRoute: null };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage unavailable: run in memory */ }
    return blank();
  }
  function save() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }

  /* ---------------------------------------------------------- */
  /* Content (adapted from the Fear of Falling Toolkit)          */
  /* ---------------------------------------------------------- */
  const LIBRARY = [
    { key: 'tr-snug', title: 'Top rope fall, no slack', desc: 'Your belayer keeps the rope snug and you choose when to let go. The most controlled way to feel the rope catch.' },
    { key: 'tr-slack', title: 'Top rope fall, a little slack', desc: 'A small amount of slack, so you feel a little more of the drop while it stays controlled.' },
    { key: 'tr-unannounced', title: 'Top rope fall, unannounced', desc: 'Your belayer stays attentive and ready, but you no longer call the exact moment you let go. Introduces uncertainty.' },
    { key: 'lead-clipped', title: 'Lead fall, clipped above', desc: 'On lead with the rope clipped above you. An easy step into lead falling that still feels like top rope.' },
    { key: 'lead-at', title: 'Lead fall at quickdraw level', desc: 'Let go with your harness level with your last quickdraw.' },
    { key: 'lead-above', title: 'Lead fall above the quickdraw', desc: 'Climb a move or two above your last clip, then let go. A slightly longer fall.' },
    { key: 'lead-next', title: 'Lead fall from the next quickdraw', desc: 'Fall as you reach to clip the next draw: the missed-clip scenario.' },
    { key: 'limit', title: 'Climbing to failure on a limit route', desc: 'Climb until you physically cannot continue, without saying "take" or down-climbing first.' },
  ];

  const MAP = {
    triggers: {
      q: 'What situations make you most anxious?',
      hint: 'Triggers: when and where the fear shows up.',
      opts: ['Trying a limit route', 'Throwing for a hold', 'Being pumped', 'Climbing above my last clip', 'Clipping from a stretched position', 'Steep or overhanging ground', 'A new area of the wall', 'Climbing with someone new'],
    },
    thoughts: {
      q: 'What thoughts tend to show up?',
      hint: 'Fearful thoughts scan for danger and predict outcomes, often as "what if…".',
      opts: ['What if my belayer doesn’t catch me?', 'Did I tie my knot correctly?', 'What if I swing into the wall?', 'I’m going to get hurt', 'I can’t do this move', 'Everyone is watching me'],
    },
    body: {
      q: 'What do you notice in your body?',
      hint: 'Optional, but noticing it early gives you more choice.',
      opts: ['Racing heart', 'Fast, shallow breathing', 'Over-gripping and tension', 'Sweaty hands', 'Shaking legs', 'Narrowed vision'],
    },
    behaviours: {
      q: 'How does fear change your climbing?',
      hint: 'Fight looks like forcing it. Flight looks like getting out.',
      opts: ['Saying “take” early', 'Down-climbing', 'Not committing to moves', 'Avoiding hard routes', 'Avoiding lead climbing', 'Rushing moves', 'Panic clipping', 'Forcing it with over-gripping'],
    },
  };

  const SAFETY = [
    'This exercise is within my technical competence, and my belayer is competent and attentive.',
    'We’ve done a full pre-climb check: knot, harness, belay device and rope.',
    'My belayer is using an assisted-braking device (such as a GriGri), set up as the manufacturer recommends.',
    'We’ve chosen a quieter part of the wall with a clear fall zone, and let nearby climbers know.',
    'We’ve agreed how we’ll communicate, and I’ll keep my legs clear of the rope.',
    'I’m following my wall’s policies, and I’ll stop if I feel unwell, injured, overly tired or unsafe.',
  ];

  const LESSONS = [
    'Introduction', 'What is Fear?', 'Getting to Know Your Fear', 'Setting Goals', 'What is Exposure Therapy?',
    'Creating Your Exposure Ladder', 'Resilience Skills: Behavioural', 'Planning Your Exercises', 'Before You Start',
    'Falling on Top Rope (No Slack)', 'Falling on Top Rope (Some Slack)', 'Falling on Top Rope (No Warning to Belayer)',
    'Falling on Lead (Below the Bolt)', 'Re-Evaluating Your Ladder', 'Resilience Skills: Cognitive', 'Falling on Lead (At the Bolt)',
    'Falling on Lead (Above the Bolt)', 'Falling on Lead (At the Next Bolt)', 'Resilience Skills: Mindfulness',
    'Falling on Lead (Climbing at Your Limit)', 'Congratulations and Reflections',
  ];

  const UPGRADE_URL = '../../fear-of-falling.html';
  const CTA_LABEL = 'Unlock the Full Toolkit – £99';

  /* ---------------------------------------------------------- */
  /* Helpers                                                     */
  /* ---------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const icon = (n, cls = '') => `<i data-lucide="${n}"${cls ? ` class="${cls}"` : ''}></i>`;
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  function rateColor(n) {
    if (n < 25) return 'var(--ep-sage)';
    if (n < 50) return 'var(--ep-sand)';
    if (n < 75) return 'var(--ep-ember)';
    return 'var(--ep-clay)';
  }
  function ratingWord(n) {
    if (n <= 12) return 'Little or no fear';
    if (n <= 37) return 'Mildly fearful';
    if (n <= 62) return 'Moderately fearful';
    if (n <= 87) return 'Very fearful';
    return 'Extremely fearful';
  }
  const badge = (n, id) => `<span class="badge"${id ? ` id="${id}"` : ''} style="--c:${rateColor(n)}" title="${ratingWord(n)}">${n}</span>`;

  const getEx = (id) => state.ladder.find((x) => x.id === id);
  const getSession = (id) => state.sessions.find((x) => x.id === id);
  const currentStep = () => state.ladder.find((x) => !x.done) || null;
  const lastDone = () => { const d = state.ladder.filter((x) => x.done); return d[d.length - 1] || null; };
  const sessionsFor = (exId) => state.sessions.filter((s) => s.exId === exId);
  const sortedSessions = () => state.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));

  function modules() {
    return [
      { n: 1, key: 'understand', title: 'Understand My Fear', done: !!state.m1.done },
      { n: 2, key: 'hierarchy', title: 'My Exposure Hierarchy', done: state.ladderSaved && state.ladder.length > 0 },
      { n: 3, key: 'practice', title: 'Start Fall Practice', done: state.sessions.length > 0 },
      { n: 4, key: 'log', title: 'Review My Progress', done: state.sessions.some((s) => s.reflected) },
    ];
  }

  function nextAction() {
    if (!state.m1.done) return { label: 'Start Module 1: Understand My Fear', href: '#/understand', icon: 'book-open' };
    if (!state.ladderSaved || !state.ladder.length) return { label: 'Build your exposure hierarchy', href: '#/hierarchy', icon: 'list-ordered' };
    if (state.draft) return { label: 'Resume your practice session', href: '#/practice', icon: 'activity' };
    const unref = sortedSessions().find((s) => !s.reflected);
    if (unref) return { label: 'Reflect on your last session', href: '#/review/' + unref.id, icon: 'edit-3' };
    const cur = currentStep();
    if (cur) return { label: 'Start fall practice', href: '#/practice', icon: 'activity' };
    return { label: 'Review your progress', href: '#/log', icon: 'history' };
  }

  /* ---------------------------------------------------------- */
  /* Shared components                                           */
  /* ---------------------------------------------------------- */
  function slider({ id, bind, value, label, hint = '' }) {
    return `<div class="rate" id="${id}-wrap" style="--c:${rateColor(value)}">
      <div class="rate-head"><label for="${id}">${label}</label><output class="rate-val" id="${id}-out" for="${id}">${value}<small>/100</small></output></div>
      ${hint ? `<p class="small muted" style="margin:-2px 0 6px">${hint}</p>` : ''}
      <input type="range" id="${id}" min="0" max="100" step="5" value="${value}" data-bind="${bind}" data-rate="${id}" aria-describedby="${id}-word">
      <div class="rate-scale" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
      <div class="rate-word" id="${id}-word">${ratingWord(value)}</div>
    </div>`;
  }

  function nudge(key, { icon: ic, title, body, feature }) {
    if (state.dismissed[key]) return '';
    return `<aside class="nudge" aria-label="Full Toolkit">
      <div class="ni">${icon(ic)}</div>
      <div>
        <span class="eyebrow">In the Full Toolkit</span>
        <h4>${title}</h4>
        <p>${body}</p>
        <div class="btn-row">
          <button class="btn btn-plum" data-action="feature" data-key="${feature}">See how it works</button>
          <button class="btn btn-text" data-action="dismiss" data-key="${key}">Not now</button>
        </div>
      </div>
    </aside>`;
  }

  function lockedStrip(feature, title, sub, ic = 'play-circle') {
    return `<button class="locked-strip" data-action="feature" data-key="${feature}">
      <span class="ic">${icon(ic)}</span>
      <span class="tx"><b>${title}</b><span>${sub}</span></span>
      <span class="lk">${icon('lock')}</span>
    </button>`;
  }

  function featureCard(key) {
    const f = FEATURES[key];
    return `<button class="feature" data-action="feature" data-key="${key}">
      <span class="lock">${icon('lock')}</span>
      <span class="fi">${icon(f.icon)}</span>
      <b>${f.title}</b>
      <span>${f.short}</span>
      <span class="more">Preview</span>
    </button>`;
  }

  /* ---------------------------------------------------------- */
  /* Premium feature previews                                    */
  /* ---------------------------------------------------------- */
  function planPreview() {
    const days = [['Mon', ''], ['Tue', 'Warm-up: top rope, no slack<br>Work: a little slack · 20 min'], ['Wed', ''], ['Thu', 'Warm-up: a little slack<br>Work: unannounced · 20 min'], ['Fri', ''], ['Sat', 'Rest or easy mileage'], ['Sun', '']];
    return `<div class="mini-week">${days.map(([d, t]) => `<div class="${t && !t.startsWith('Rest') ? 'on' : ''}"><b>${d}</b>${t ? `<i>${t}</i>` : ''}</div>`).join('')}</div>`;
  }
  function analyticsPreview() {
    const b = [62, 58, 55, 50, 46, 44, 40, 36], p = [85, 82, 80, 74, 70, 66, 61, 58], a = [48, 44, 40, 36, 32, 30, 26, 22];
    const W = 460, H = 170, px = (i) => 30 + i * ((W - 50) / 7), py = (v) => H - 24 - v * ((H - 40) / 100);
    const line = (arr, c, dash) => `<polyline fill="none" stroke="${c}" stroke-width="2.5" ${dash ? 'stroke-dasharray="5 4"' : ''} stroke-linecap="round" stroke-linejoin="round" points="${arr.map((v, i) => px(i) + ',' + py(v)).join(' ')}"/>` + arr.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="3.2" fill="${c}"/>`).join('');
    const grid = [0, 25, 50, 75, 100].map((v) => `<line x1="30" x2="${W - 16}" y1="${py(v)}" y2="${py(v)}" stroke="#e6e6e1"/><text x="22" y="${py(v) + 4}" font-size="10" text-anchor="end" fill="#84847c">${v}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Example chart: fear before, at peak and after falling, decreasing over eight sessions">${grid}${line(p, '#b6534b')}${line(b, '#d6b86c', true)}${line(a, '#4b7a6e')}
      <text x="30" y="${H - 6}" font-size="10" fill="#84847c">Session 1</text><text x="${W - 16}" y="${H - 6}" font-size="10" fill="#84847c" text-anchor="end">Session 8</text></svg>
      <div class="small muted" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px"><span style="color:#b6534b">● Peak</span><span style="color:#b08e3a">● Before</span><span style="color:#3a6056">● After</span></div>`;
  }
  function videosPreview() {
    const pick = [2, 6, 7, 10, 15];
    return `<div class="mini-list">${pick.map((i) => `<div>${icon('play-circle')}<span>${i}. ${esc(LESSONS[i - 1])}</span><span class="r">${icon('lock')}</span></div>`).join('')}<div style="justify-content:center;color:var(--text-muted)">+ 19 more lessons and demonstrations</div></div>`;
  }
  function skillsPreview() {
    return `<div class="mini-cols">
      <div><b>Behavioural</b>Pre-climb check ritual<br>Belaying with intention<br>Climbing with someone new</div>
      <div><b>Cognitive</b>Spotting fear-driven thoughts<br>Writing a balanced response<br>Changing the voice you listen to</div>
      <div><b>Mindfulness</b>Contact points<br>Breath as an anchor<br>One move at a time</div>
    </div>`;
  }
  function communityPreview() {
    return `<div class="small muted" style="margin-bottom:8px">Illustrative example</div>
      <div class="msg"><b>Climber A</b>First unannounced fall today. Peak was 70, down to 35 by the fourth one.</div>
      <div class="msg"><b>Climber B</b>Same step for me this week. Starting on the snug rope first really helped.</div>
      <div class="msg me"><b>You</b>Anyone tried the mindfulness drill before lead falls?</div>`;
  }
  function goalsPreview() {
    return `<div class="mini-list"><div>${icon('target')}<span><b style="font-weight:600">SMART goal:</b> climb a 6c before my October trip</span></div><div>${icon('sparkles')}<span><b style="font-weight:600">Qualities:</b> persistence, calm under pressure, curiosity</span></div><div>${icon('mountain')}<span><b style="font-weight:600">The climber I want to be</b> in a year’s time</span></div></div>`;
  }
  function reflectPreview() {
    return `<div class="mini-list"><div>${icon('activity')}<span>Before 45 · Peak 78 · After 30</span></div><div>${icon('layers')}<span>Variations: falling while moving, left of the bolt</span></div><div>${icon('edit-3')}<span>Guided prompts to plan your next step</span></div></div>`;
  }

  const FEATURES = {
    plan: {
      icon: 'calendar-days', title: 'Personalised Training Plan', short: 'A weekly fall practice schedule built around the days you already climb.',
      what: 'Turns your hierarchy into a structured weekly plan that fits into your existing climbing routine, so practice happens without having to decide in the moment.',
      help: ['Set the days you climb, when in the session you practise and for how long', 'Each session suggests a warm-up step and a working step from your ladder', 'Consistency matters more than intensity, and planning removes the in-the-moment decision to skip'],
      preview: planPreview,
    },
    analytics: {
      icon: 'line-chart', title: 'Progress Analytics', short: 'See how fear before, at its peak and after practice changes over weeks.',
      what: 'Detailed tracking of your fear and confidence over time, across every exercise, so you can see the curve shifting even on days that feel hard.',
      help: ['Before, peak and after ratings for every session, charted over time', 'Spot patterns: which variations, days or partners make fear spike', 'Visible progress builds trust in the process and keeps you going'],
      preview: analyticsPreview,
    },
    videos: {
      icon: 'play-circle', title: 'Video Library', short: '24 guided lessons, including demonstrations of each fall practice exercise.',
      what: '24 step-by-step video lessons you can watch at home or at the wall, including detailed demonstrations of every exercise on the ladder.',
      help: ['See exactly how each fall is set up, communicated and practised', 'Behavioural skills on video: the pre-climb check and belaying with intention', 'Clear expectations before you try each new step'],
      preview: videosPreview,
    },
    skills: {
      icon: 'brain', title: 'Mental Skills', short: 'Cognitive, mindfulness and behavioural strategies for fear on the wall.',
      what: 'Exposure builds evidence. Mental skills help you use it when it matters: working with anxious thoughts, steadying attention and staying present mid-route.',
      help: ['Recognise fear-driven thoughts and write balanced, believable responses', 'Anchor attention with contact points, breath and one move at a time', 'Behavioural routines that reduce uncertainty before you leave the ground'],
      preview: skillsPreview,
    },
    community: {
      icon: 'users', title: 'Climbing Community', short: 'Climbers working through the same programme, sharing what helps.',
      what: 'A members’ group for climbers working through the toolkit: share experiences, encourage each other and swap ideas about the exercises.',
      help: ['Learning alongside others makes practice more motivating', 'Hear how others approached the same step', 'Ask questions about the exercises'],
      preview: communityPreview,
    },
    goals: {
      icon: 'target', title: 'Advanced Goal Setting', short: 'Connect fall practice to a goal and the climber you want to become.',
      what: 'Structured exercises to set a SMART climbing goal, identify the qualities you want to develop and define the climber you want to be, so fear has a direction.',
      help: ['A clear reason to stay with discomfort', 'A simple decision rule for hard moments: closer to, or further from, the climber I want to be?', 'Shown on your dashboard as a daily reminder'],
      preview: goalsPreview,
    },
    reflection: {
      icon: 'clipboard-list', title: 'Advanced Reflective Tools', short: 'Detailed logs and guided reflection to plan your next step.',
      what: 'Richer session logs (before, peak and after ratings, variations practised) with guided reflection and a structured ladder re-evaluation part way through.',
      help: ['Track variations so confidence generalises to real climbing', 'Guided ladder re-evaluation at the right point in the programme', 'Final reflection and a plan for keeping fear from returning'],
      preview: reflectPreview,
    },
  };

  /* ---------------------------------------------------------- */
  /* Views                                                       */
  /* ---------------------------------------------------------- */
  function viewDashboard() {
    const mods = modules();
    const doneCount = mods.filter((m) => m.done).length;
    const pct = Math.round((doneCount / 4) * 100);
    const firstOpen = mods.find((m) => !m.done);
    const na = nextAction();
    const cur = currentStep();
    const last = sortedSessions()[0];
    const idx = cur ? state.ladder.indexOf(cur) + 1 : 0;
    const icons = { understand: 'book-open', hierarchy: 'list-ordered', practice: 'activity', log: 'history' };
    const blurbs = {
      understand: state.m1.done ? 'Fear pattern mapped' : 'How fear works, and why avoidance keeps it going',
      hierarchy: state.ladder.length ? `${state.ladder.length} exercises · ${state.ladder.filter((x) => x.done).length} completed` : 'Build your ladder of graded falls',
      practice: state.draft ? 'Session in progress' : cur ? `Next: ${esc(cur.title)}` : 'Record a fall practice session',
      log: state.sessions.length ? `${state.sessions.length} session${state.sessions.length === 1 ? '' : 's'} logged` : 'Reflect and track your progress',
    };

    return `<div class="wrap">
      <div class="page-head">
        <div><h1>Welcome to Essentials</h1><p>Your starting point for structured fall practice.</p></div>
        <a class="btn btn-primary" href="${na.href}">${icon(na.icon)}${na.label}</a>
      </div>

      <div class="card">
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Course progress"><span style="width:${pct}%"></span></div>
        <div class="progress-meta"><span class="lbl">Course progress</span><span class="pct">${pct}% complete</span></div>
        <div class="steps">${mods.map((m) => `<a href="#/${m.key}" class="${m.done ? 'done' : m === firstOpen ? 'current' : ''}">
          <span class="n">${m.done ? icon('check-circle-2') : ''}Module ${m.n}</span><span class="t">${m.title}</span></a>`).join('')}</div>
      </div>

      <div class="grid-2 section" style="margin-top:20px">
        <div class="card">
          <div class="card-label">${icon('flag')}Next planned exercise${cur ? `<span class="right">Step ${idx} of ${state.ladder.length}</span>` : ''}</div>
          ${cur ? `<div style="display:flex;gap:14px;align-items:flex-start;justify-content:space-between">
              <div><h3>${esc(cur.title)}</h3><p class="small muted" style="margin:0">${esc(cur.desc || '')}</p></div>${badge(cur.rating)}</div>
              <div class="btn-row" style="margin-top:18px"><a class="btn btn-primary" href="#/practice">${icon('activity')}${state.draft ? 'Resume session' : 'Start fall practice'}</a><a class="btn btn-text" href="#/hierarchy">Edit hierarchy</a></div>`
            : state.ladder.length ? `<h3>Every step completed</h3><p class="small muted">Add a harder step, or keep using your top steps as regular practice.</p><a class="btn btn-ghost" href="#/hierarchy">Open hierarchy</a>`
            : `<h3>No exercises yet</h3><p class="small muted">Build your exposure hierarchy and your first exercise will appear here.</p><a class="btn btn-ghost" href="#/hierarchy">${icon('list-ordered')}Build hierarchy</a>`}
        </div>
        <div class="card">
          <div class="card-label">${icon('history')}Most recent session${last ? `<span class="right">${fmtShort(last.date)}</span>` : ''}</div>
          ${last ? `<h3>${esc(last.exTitle)}</h3>
            <div class="stat-row" style="margin-top:12px">
              <div class="stat"><div class="k">Before</div><div class="v">${last.before}</div></div>
              <div class="stat"><div class="k">During / after</div><div class="v">${last.peak}</div></div>
              <div class="stat"><div class="k">Falls</div><div class="v">${last.reps}</div></div>
            </div>
            <div class="btn-row" style="margin-top:16px">${last.reflected ? `<span class="tag pine">${icon('check')}Reflected</span><a class="btn btn-text" href="#/log">View log</a>` : `<a class="btn btn-ghost" href="#/review/${last.id}">${icon('edit-3')}Add reflection</a>`}</div>`
            : `<h3>Nothing logged yet</h3><p class="small muted">After your first fall practice session, your ratings and reflections will show here.</p>`}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Your course</h2>
        <div class="grid-2">
          ${mods.map((m) => `<a class="tile ${m.done ? 'done' : m === firstOpen ? 'current' : ''}" href="#/${m.key}">
            <span class="strip">${icon(m.done ? 'check' : icons[m.key])}</span>
            <span class="body"><span class="meta">Module ${m.n}${m.done ? ' · Done' : ''}</span><h3>${m.title}</h3><p>${blurbs[m.key]}</p></span>
            <span class="chev">${icon('chevron-right')}</span></a>`).join('')}
        </div>
      </div>

      <div class="section">
        <div class="page-head" style="margin-bottom:14px">
          <div><span class="eyebrow">Explore the Full Toolkit</span><h2 class="section-title" style="margin:0">More structure when you want it</h2></div>
          <a class="btn btn-text" href="#/toolkit">Compare Essentials and the Full Toolkit ${icon('arrow-right')}</a>
        </div>
        <div class="feature-grid">${['plan', 'analytics', 'videos', 'skills', 'community'].map(featureCard).join('')}</div>
      </div>
      ${footer()}
    </div>`;
  }

  function viewUnderstand() {
    const m = state.m1;
    const group = (k) => {
      const g = MAP[k];
      const custom = m[k].filter((v) => !g.opts.includes(v));
      return `<div class="card" style="margin-top:14px">
        <h3 style="font-size:1.08rem;margin:0 0 4px">${g.q}</h3>
        <p class="small muted" style="margin:0 0 12px">${g.hint}</p>
        <div class="chips">${g.opts.concat(custom).map((o) => `<button class="chip" aria-pressed="${m[k].includes(o)}" data-action="chip" data-group="${k}" data-val="${esc(o)}">${m[k].includes(o) ? icon('check') : ''}${esc(o)}</button>`).join('')}</div>
        <div class="inline-add"><input class="input" id="add-${k}" placeholder="Add your own" aria-label="Add your own: ${g.q}" data-enter="add-chip" data-group="${k}"><button class="btn btn-ghost" data-action="add-chip" data-group="${k}">${icon('plus')}Add</button></div>
      </div>`;
    };
    const list = (arr) => arr.length ? arr.map((x) => `<b>${esc(x.toLowerCase())}</b>`).join(', ') : '…';
    const hasAny = m.triggers.length || m.thoughts.length || m.behaviours.length;

    return `<div class="read lesson">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">Module 1 · About 8 minutes</span>
      <h1>Understand Your Fear</h1>
      <p>Fear of falling is one of the most common, and most misunderstood, parts of climbing. Many climbers assume it means something is wrong with them. It doesn’t. Understanding how fear works is the foundation for learning to work with it.</p>

      <h2>Fear is a protective system</h2>
      <p>Fear evolved to keep us alive. When we sense danger, the body prepares to act: the heart beats faster, breathing speeds up, attention narrows onto the threat, and the mind runs through “what if” scenarios. The feeling is uncomfortable by design, because it pushes us to get to safety.</p>
      <p>On the wall, the same system switches on. At manageable levels it’s useful: it sharpens focus and makes sure your knot is tied. The aim isn’t to remove fear, but to <strong>recalibrate</strong> it, so it becomes information rather than a stop signal.</p>

      <h2>Thoughts, body and behaviour</h2>
      <p>Fear feels like it arrives all at once, but it usually follows a pattern. A <strong>trigger</strong> (being pumped above a clip) sets off fearful <strong>thoughts</strong> (“what if my belayer isn’t paying attention?”), <strong>body sensations</strong> (over-gripping, shallow breathing) and a <strong>behaviour</strong> that gets you out (“take!”). Each one feeds the others.</p>
      <figure class="diagram">${cycleSvg()}<figcaption>A trigger sets off a loop of thoughts, body sensations and behaviour. What you can notice, you can work with.</figcaption></figure>

      <h2>How avoidance keeps fear going</h2>
      <p>Like any emotion, fear rises, peaks and falls on its own if you stay with it. Avoidance (down-climbing, shouting “take” early, not committing above the clip) brings relief quickly. But it cuts the curve off before you learn the fall was manageable, and it teaches your brain that avoiding was necessary.</p>
      <figure class="diagram">${curveSvg()}<figcaption>Staying in the situation lets the wave of fear come down by itself. Escaping early brings relief, but the lesson becomes “that was dangerous”.</figcaption></figure>
      <p>This is why fear of falling often grows through a <strong>lack of safe experience</strong>. Fear isn’t the problem; a lack of evidence is.</p>

      <h2>Why graded exposure helps</h2>
      <p>Graded exposure gives your nervous system that evidence, one manageable step at a time. Effective fall practice follows four rules:</p>
      <div class="rules">
        <div><b>Graded</b><span>Small, manageable steps, starting where fear is present but workable.</span></div>
        <div><b>Prolonged</b><span>Stay long enough for the fear to start settling, rather than escaping at the peak.</span></div>
        <div><b>Repeated</b><span>Practise across falls and sessions so the learning sticks.</span></div>
        <div><b>Without distractions</b><span>No music or constant reassurance; they can become another way of avoiding.</span></div>
      </div>
      <p>You don’t need to wait until you feel confident, and you don’t need to feel zero fear before moving on. Confidence comes from the practice.</p>

      ${lockedStrip('videos', 'Video lesson: What is Fear? (3:45)', 'Part of the 24-lesson video library in the Full Toolkit')}

      <h2 id="map">Exercise: map your fear</h2>
      <p>Think about a recent time you were scared of falling. Pick anything that fits, and add your own.</p>
      ${group('triggers')}${group('thoughts')}${group('body')}${group('behaviours')}

      <div class="card" style="margin-top:14px">
        <label class="field"><span>Anything else you noticed?</span><small>Optional. For example, how quickly the fear eased once you were lowered off.</small>
        <textarea class="input" data-bind="m1.extra" placeholder="Write as much or as little as you like">${esc(m.extra)}</textarea></label>
      </div>

      ${hasAny ? `<div class="callout"><p class="callout-title">Your fear pattern</p>
        <p>When ${list(m.triggers)}, my mind says ${m.thoughts.length ? m.thoughts.map((t) => `“${esc(t)}”`).join(' or ') : '…'}${m.body.length ? `, my body responds with ${list(m.body)}` : ''}, and I tend towards ${list(m.behaviours)}.</p>
        <p>Your triggers are useful material: they’ll help you choose and order the steps in your hierarchy.</p></div>` : ''}

      <div class="btn-row" style="margin-top:22px">
        ${m.done
          ? `<span class="tag pine">${icon('check')}Module complete</span><a class="btn btn-primary" href="#/hierarchy">Next: build your hierarchy ${icon('arrow-right')}</a>`
          : `<button class="btn btn-primary" data-action="complete-m1" ${hasAny ? '' : 'disabled'}>${icon('check')}Save and complete Module 1</button>${hasAny ? '' : '<span class="small muted">Choose at least one answer to continue.</span>'}`}
      </div>

      <div class="key-points"><h3>Key takeaways</h3><ul>
        <li>Fear is a normal, protective response.</li>
        <li>It shows up as a pattern of thoughts, body sensations and behaviour.</li>
        <li>Avoidance reduces fear short term but strengthens it long term.</li>
        <li>Graded, prolonged, repeated practice without distractions lets fear recalibrate.</li>
      </ul></div>
      ${footer()}
    </div>`;
  }

  function cycleSvg() {
    const node = (x, y, t, s, fill) => `<g><rect x="${x - 78}" y="${y - 30}" width="156" height="60" rx="16" fill="${fill}" stroke="#d4d4cd"/><text x="${x}" y="${y - 4}" text-anchor="middle" font-family="arboria, sans-serif" font-size="15" fill="#2e2e2e">${t}</text><text x="${x}" y="${y + 15}" text-anchor="middle" font-size="11.5" fill="#5f5f59">${s}</text></g>`;
    return `<svg viewBox="0 0 520 330" role="img" aria-label="Diagram: a trigger leads to a loop of thoughts, body sensations and behaviour, each feeding the others">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#4b7a6e"/></marker></defs>
      <path d="M260 66 L260 96" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)"/>
      <path d="M220 160 Q150 180 128 226" fill="none" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
      <path d="M300 160 Q370 180 392 226" fill="none" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
      <path d="M205 268 L315 268" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
      ${node(260, 36, 'Trigger', 'e.g. pumped above a clip', '#f7f7f4')}
      ${node(260, 130, 'Thoughts', '“What if…?”', '#e7e3ec')}
      ${node(118, 268, 'Body', 'tension, fast breathing', '#dde9e5')}
      ${node(402, 268, 'Behaviour', '“Take!”, down-climb', '#f4e7d6')}
    </svg>`;
  }

  function curveSvg() {
    return `<svg viewBox="0 0 520 230" role="img" aria-label="Chart: fear over time. Staying in the situation, fear rises, peaks and falls. Escaping at the peak drops fear immediately but the learning is lost.">
      <line x1="40" y1="190" x2="500" y2="190" stroke="#d4d4cd"/><line x1="40" y1="20" x2="40" y2="190" stroke="#d4d4cd"/>
      <text x="16" y="110" font-size="11" fill="#84847c" transform="rotate(-90 16 110)" text-anchor="middle">Fear</text>
      <text x="490" y="210" font-size="11" fill="#84847c" text-anchor="end">Time</text>
      <path d="M40 170 C120 165 150 40 210 40 C280 40 330 150 490 165" fill="none" stroke="#4b7a6e" stroke-width="3"/>
      <path d="M40 170 C110 166 140 70 186 46 L186 46 C190 120 194 160 205 172" fill="none" stroke="#b6534b" stroke-width="2.5" stroke-dasharray="6 5"/>
      <circle cx="186" cy="46" r="4.5" fill="#b6534b"/>
      <text x="196" y="102" font-size="12" fill="#b6534b">Escape: quick relief,</text><text x="196" y="117" font-size="12" fill="#b6534b">fear stays the same</text>
      <text x="330" y="88" font-size="12" fill="#3a6056">Stay: fear peaks, then</text><text x="330" y="103" font-size="12" fill="#3a6056">settles on its own</text>
    </svg>`;
  }

  function viewHierarchy() {
    const cur = currentStep();
    const inLadder = new Set(state.ladder.map((x) => x.key).filter(Boolean));
    const rung = (x, i) => {
      const n = sessionsFor(x.id).length;
      const isCur = x === cur;
      const editing = ui.editing === x.id;
      return `<li class="rung ${x.done ? 'is-done' : ''} ${isCur ? 'is-current' : ''}">
        <span class="num">${x.done ? icon('check') : i + 1}</span>
        <div style="min-width:0">
          <div class="tags">${isCur ? `<span class="tag pine">${icon('flag')}Current step</span>` : ''}${x.custom ? '<span class="tag">Your own</span>' : ''}${n ? `<span class="tag">${n} session${n === 1 ? '' : 's'}</span>` : ''}</div>
          ${editing ? `<div class="rung-edit">
              <input class="input" value="${esc(x.title)}" data-bind="ladder:${x.id}:title" aria-label="Exercise name">
              <textarea class="input" style="min-height:64px" data-bind="ladder:${x.id}:desc" aria-label="Description" placeholder="Short description (optional)">${esc(x.desc || '')}</textarea>
            </div>` : `<h3>${esc(x.title)}</h3>${x.desc ? `<p class="desc">${esc(x.desc)}</p>` : ''}`}
          <div class="rung-rate">
            <input type="range" min="0" max="100" step="5" value="${x.rating}" data-bind="ladder:${x.id}:rating" data-badge="b-${x.id}" aria-label="Expected fear for ${esc(x.title)}, 0 to 100">
            ${badge(x.rating, 'b-' + x.id)}
          </div>
          <div class="rung-foot">
            <label class="done-toggle"><input type="checkbox" ${x.done ? 'checked' : ''} data-action="toggle-done" data-id="${x.id}">Completed</label>
            <button class="btn btn-text" data-action="edit" data-id="${x.id}">${icon(editing ? 'check' : 'edit-3')}${editing ? 'Done' : 'Edit'}</button>
            <button class="btn btn-text" data-action="remove" data-id="${x.id}">${icon('trash-2')}Remove</button>
          </div>
        </div>
        <div class="side">
          <button class="icon-btn" data-action="move" data-dir="-1" data-id="${x.id}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('chevron-up')}</button>
          <button class="icon-btn" data-action="move" data-dir="1" data-id="${x.id}" ${i === state.ladder.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('chevron-down')}</button>
        </div>
      </li>`;
    };
    const outOfOrder = state.ladder.some((x, i) => i > 0 && x.rating < state.ladder[i - 1].rating);

    return `<div class="wrap">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="page-head">
        <div><span class="eyebrow">Module 2</span><h1>My Exposure Hierarchy</h1>
        <p>Your ladder of falls, from least to most fear-provoking. Work up it one step at a time.</p></div>
      </div>
      <div class="layout-side">
        <div>
          <details class="disclose" ${state.ladder.length ? '' : 'open'}>
            <summary>${icon('info')}How to choose a starting point${icon('chevron-down', 'chev')}</summary>
            <div class="dbody lesson">
              <p>Rate each exercise by how much fear you <em>expect</em> it to bring up. There’s no correct number, only what feels true for you.</p>
              <div class="scale-legend">${[[0, 'Zero fear'], [25, 'Mild'], [50, 'Moderate'], [75, 'Very'], [100, 'Won’t attempt']].map(([v, t]) => `<div style="--c:${rateColor(v)}"><b>${v}</b>${t}</div>`).join('')}</div>
              <p style="margin-top:14px"><strong>Start where fear is present but manageable</strong>: an exercise you could stay with until the fear starts to settle. For many climbers that’s somewhere around 20–40, but go with what feels workable.</p>
              <ul>
                <li>Starting too big is the most common mistake. If you escape at the peak, it can strengthen the fear.</li>
                <li>If everything feels high, add an easier step of your own below it (for example, a top rope fall from just a few metres up).</li>
                <li>Easy-looking steps still matter: they build trust in your belayer and the system.</li>
                <li>Fear changes day to day. On a hard day, dropping down a step is part of the process.</li>
              </ul>
            </div>
          </details>

          <div class="section" style="margin-top:24px">
            <div class="page-head" style="margin-bottom:12px">
              <h2 class="section-title" style="margin:0">Your hierarchy</h2>
              ${state.ladder.length > 1 ? `<button class="btn btn-ghost" data-action="sort" style="min-height:40px;padding:8px 14px;font-size:14px">${icon('arrow-up-down')}Sort by rating</button>` : ''}
            </div>
            ${state.ladder.length
              ? `<ol class="ladder">${state.ladder.map(rung).join('')}</ol>
                 ${outOfOrder ? `<p class="small muted" style="margin-top:10px">${icon('info', 'inline')} Some steps are rated higher than the one after them. That’s fine if it’s deliberate; otherwise use <em>Sort by rating</em>.</p>` : ''}`
              : `<div class="ladder-empty">${icon('list-ordered')}<p style="margin:8px 0 0">Add exercises from the list to start building your ladder.</p></div>`}
            <div class="btn-row" style="margin-top:18px">
              <button class="btn btn-primary" data-action="save-ladder" ${state.ladder.length ? '' : 'disabled'}>${icon('check')}${state.ladderSaved ? 'Save changes' : 'Save my hierarchy'}</button>
              ${state.ladderSaved && cur ? `<a class="btn btn-ghost" href="#/practice">${icon('activity')}Practise: ${esc(cur.title)}</a>` : ''}
            </div>
          </div>

          ${state.ladderSaved ? nudge('after-hierarchy', { icon: 'calendar-days', feature: 'plan', title: 'Your exposure hierarchy is ready', body: 'Want help turning it into a structured training plan? The Full Toolkit helps you organise practice around your existing climbing routine.' }) : ''}
        </div>

        <aside class="sticky-side">
          <div class="card">
            <div class="card-label">${icon('plus')}Add exercises</div>
            <div>${LIBRARY.map((l) => `<div class="lib-item"><div class="tx"><b>${l.title}</b><span>${l.desc}</span></div>
              ${inLadder.has(l.key) ? `<span class="tag pine">${icon('check')}Added</span>` : `<button class="btn btn-ghost" data-action="add-lib" data-key="${l.key}">${icon('plus')}Add</button>`}</div>`).join('')}</div>
            <div style="border-top:1px solid var(--border-subtle);margin-top:6px;padding-top:16px">
              <label class="field"><span>Add your own</span><small>For example, a fall while reaching for a hold, or on an overhang.</small>
              <input class="input" id="custom-title" placeholder="Exercise name" data-enter="add-custom"></label>
              <button class="btn btn-ghost btn-block" style="margin-top:10px" data-action="add-custom">${icon('plus')}Add to hierarchy</button>
            </div>
          </div>
        </aside>
      </div>
      ${footer()}
    </div>`;
  }

  function viewPractice() {
    if (!state.ladder.length) {
      return `<div class="read">
        <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
        <span class="eyebrow">Module 3</span><h1 style="font-size:2rem">Start Fall Practice</h1>
        <div class="card" style="margin-top:20px"><h3>First, build your hierarchy</h3><p class="muted">Fall practice works through the exercises on your hierarchy, so you’ll need at least one step first.</p>
        <a class="btn btn-primary" href="#/hierarchy">${icon('list-ordered')}Build my hierarchy</a></div>${footer()}</div>`;
    }
    if (!state.draft) return viewPracticeIntro();
    const d = state.draft;
    const steps = ['Choose', 'Safety check', 'Before', 'Practise'];
    const ex = getEx(d.exId);
    let body = '';
    let canNext = true;

    if (d.step === 0) {
      const warm = lastDone();
      body = `<h2 style="font-size:1.45rem">Which exercise are you working on?</h2>
        ${warm ? `<p class="muted small">${icon('info', 'inline')} Tip: warm up with the last step you completed (${esc(warm.title)}) before your working step.</p>` : ''}
        <div class="choose" role="radiogroup" aria-label="Exercise">${state.ladder.map((x, i) => `<label class="${d.exId === x.id ? 'sel' : ''}">
          <input type="radio" name="ex" value="${x.id}" ${d.exId === x.id ? 'checked' : ''} data-action="pick-ex" data-id="${x.id}">
          <span><span class="t">${i + 1}. ${esc(x.title)}</span><span class="s">${x === currentStep() ? '<span class="tag pine">Current step</span>' : ''}${x.done ? '<span class="tag">Completed</span>' : ''}${sessionsFor(x.id).length ? `<span>${sessionsFor(x.id).length} previous session${sessionsFor(x.id).length === 1 ? '' : 's'}</span>` : ''}</span></span>
          ${badge(x.rating)}</label>`).join('')}</div>
        ${ex ? lockedStrip('videos', `Want a step-by-step video demonstration?`, `See “${esc(ex.title)}” demonstrated in the Full Toolkit’s video library.`) : ''}`;
      canNext = !!ex;
    } else if (d.step === 1) {
      body = `<h2 style="font-size:1.45rem">Safety check</h2>
        <p class="muted">Essentials supports the psychological side of falling. It doesn’t teach climbing, belaying or falling technique, so only practise if you already have the skills, equipment and supervision. Tick each item to continue.</p>
        ${SAFETY.map((s, i) => `<label class="check ${d.checks[i] ? 'on' : ''}"><input type="checkbox" ${d.checks[i] ? 'checked' : ''} data-action="check" data-i="${i}"><span>${s}</span></label>`).join('')}
        <div class="callout safety"><p class="callout-title">${icon('shield-check')}If in doubt, don’t</p><p>Don’t practise falls if you’re unsure about any part of your setup, communication or technique. Ask a qualified instructor. <a href="#/safety">Full safety guidance</a></p></div>`;
      canNext = SAFETY.every((_, i) => d.checks[i]);
    } else if (d.step === 2) {
      body = `<h2 style="font-size:1.45rem">${esc(ex ? ex.title : '')}</h2>
        <div class="card" style="margin-top:12px">${slider({ id: 'before', bind: 'draft.before', value: d.before, label: 'How fearful do you feel right now, before your first fall?' })}</div>
        <p class="small muted" style="margin-top:12px">The number doesn’t need to be precise. What matters is noticing how it changes.</p>`;
    } else {
      body = `<h2 style="font-size:1.45rem">${esc(ex ? ex.title : '')}</h2>
        <details class="disclose" style="margin:12px 0 16px">
          <summary>${icon('list-checks')}How to practise${icon('chevron-down', 'chev')}</summary>
          <div class="dbody lesson"><ul>
            <li><strong>Warm up</strong> with a step you’ve already completed.</li>
            <li><strong>Stay with it.</strong> Let the fear rise and start to settle before the next fall, rather than escaping at the peak.</li>
            <li><strong>Repeat.</strong> Several falls in a session, across several sessions.</li>
            <li><strong>No distractions:</strong> skip the music, jokes and constant reassurance.</li>
            <li>If fear becomes overwhelming, drop to an easier step. That’s part of the process.</li>
            <li>Stop if you feel unwell, injured, overly tired or unsafe.</li>
          </ul></div>
        </details>
        <div class="card">
          <div class="wizard-label" style="text-align:center">Falls completed</div>
          <div class="counter">
            <button data-action="reps" data-d="-1" aria-label="One fewer fall">${icon('minus')}</button>
            <div class="val" aria-live="polite">${d.reps}</div>
            <button class="plus" data-action="reps" data-d="1" aria-label="Add a fall">${icon('plus')}</button>
          </div>
        </div>
        <div class="card" style="margin-top:14px">${slider({ id: 'peak', bind: 'draft.peak', value: d.peak, label: 'How fearful did you feel during or straight after your falls?', hint: `Before you started: ${d.before}` })}</div>
        <div class="card" style="margin-top:14px"><label class="field"><span>Quick note</span><small>Optional. You’ll reflect properly in a moment.</small>
          <textarea class="input" style="min-height:70px" data-bind="draft.note" placeholder="e.g. Fourth fall felt noticeably calmer">${esc(d.note)}</textarea></label></div>`;
      canNext = d.reps > 0;
    }

    return `<div class="read">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <a class="back-link" style="margin:0" href="#/">${icon('chevron-left')}Dashboard</a>
        <button class="btn btn-text" data-action="cancel-draft">${icon('x')}Discard session</button>
      </div>
      <span class="eyebrow">Module 3 · Step ${d.step + 1} of 4: ${steps[d.step]}</span>
      <div class="wizard-steps" aria-hidden="true">${steps.map((_, i) => `<span class="${i <= d.step ? 'on' : ''}"></span>`).join('')}</div>
      ${body}
      <div class="wizard-foot sticky">
        ${d.step > 0 ? `<button class="btn btn-ghost" data-action="wiz" data-d="-1">${icon('chevron-left')}Back</button>` : '<span></span>'}
        ${d.step < 3
          ? `<button class="btn btn-primary" data-action="wiz" data-d="1" ${canNext ? '' : 'disabled'}>Continue${icon('chevron-right')}</button>`
          : `<button class="btn btn-primary" data-action="save-session" ${canNext ? '' : 'disabled'}>${icon('check')}Save session</button>`}
      </div>
      ${d.step === 3 && !canNext ? '<p class="small muted" style="text-align:right">Add at least one fall to save.</p>' : ''}
    </div>`;
  }

  function viewPracticeIntro() {
    const cur = currentStep();
    return `<div class="read">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">Module 3</span>
      <h1 style="font-size:clamp(1.7rem,4.5vw,2.2rem)">Start Fall Practice</h1>
      <p class="muted">Record each session as you go: choose your exercise, check your setup, rate your fear before you start, then log your falls and how you felt.</p>
      <div class="card" style="margin-top:20px">
        <div class="card-label">${icon('flag')}${cur ? 'Your current step' : 'All steps complete'}</div>
        ${cur ? `<div style="display:flex;justify-content:space-between;gap:12px"><div><h3>${esc(cur.title)}</h3><p class="small muted" style="margin:0">${esc(cur.desc || '')}</p></div>${badge(cur.rating)}</div>` : '<p class="muted">You can still log practice on any step, which is a good way to keep confidence topped up.</p>'}
        <button class="btn btn-primary btn-block" style="margin-top:18px" data-action="start-practice">${icon('activity')}Start a session</button>
      </div>
      <div class="lesson">
        <h2>Practising progressively</h2>
        <ul>
          <li>Start each session with the last exercise you completed. It settles nerves and builds early confidence.</li>
          <li>Choose exercises that bring up fear you can stay with. Moving too quickly can limit the learning.</li>
          <li>Vary things gradually: route style, height, slightly left or right of the bolt, falling while moving.</li>
          <li>Treat fall practice as a regular part of your climbing, rather than a one-off.</li>
        </ul>
        <div class="callout safety"><p class="callout-title">${icon('shield-check')}Your safety comes first</p>
          <p>Only practise exercises within your technical competence, with appropriate equipment, a competent and attentive belayer (ideally using an assisted-braking device), and in line with your wall’s policies. <a href="#/safety">Read the full safety guidance</a>.</p></div>
      </div>
      ${footer()}
    </div>`;
  }

  function verdict(s) {
    const r = s.reflection;
    const n = sessionsFor(s.exId).length;
    const ex = getEx(s.exId);
    const idx = ex ? state.ladder.indexOf(ex) : -1;
    const next = idx > -1 ? state.ladder.slice(idx + 1).find((x) => !x.done) : null;
    if (r.safe === 'no' || r.safe === 'unsure') return { cls: 'warn', icon: 'shield-alert', title: 'Pause and sort the setup first', text: 'Something didn’t feel right with the setup or communication. Talk it through with your belayer, and if you’re unsure about any part of the system, get guidance from a qualified instructor before practising this again.', rec: 'adjust' };
    if (!r.safe || !r.settled || !r.confidence) return null;
    if (r.settled === 'no') return { cls: 'hold', icon: 'rotate-ccw', title: 'Repeat it, or make it a little easier', text: 'Staying with the fear until it starts to settle is where the learning happens. Next time, give yourself longer between falls, or try an easier variation (lower on the wall, less slack) and build back up.', rec: 'adjust' };
    if (r.confidence < 3) return { cls: 'hold', icon: 'repeat', title: 'Repeat this exercise next session', text: 'You’ve done the hard part. Repeating it builds the evidence your brain needs, until you feel you could do it again without much hesitation.', rec: 'repeat' };
    if (n < 2) return { cls: 'hold', icon: 'repeat', title: 'Repeat it once or twice more', text: 'This went well. Confidence sticks through repetition, so repeat this step in your next session to consolidate it before you move up.', rec: 'repeat' };
    return { cls: '', icon: 'trending-up', title: 'You’re ready to progress', text: `You practised safely, stayed with the fear and feel confident repeating it. You don’t need to feel zero fear to move on. Use this step as your warm-up next time${next ? `, then try <strong>${esc(next.title)}</strong>` : ''}.`, rec: 'progress' };
  }

  function viewReview(id) {
    const s = getSession(id);
    if (!s) return `<div class="read"><a class="back-link" href="#/log">${icon('chevron-left')}Practice log</a><div class="card"><h3>Session not found</h3><p class="muted">It may have been deleted.</p></div></div>`;
    const r = s.reflection;
    const ex = getEx(s.exId);
    const v = verdict(s);
    const conf = [[1, 'Not yet'], [2, 'A little'], [3, 'Fairly'], [4, 'Very']];
    const seg = (field, opts) => `<div class="seg" role="group">${opts.map(([val, label]) => `<button aria-pressed="${r[field] === val}" data-action="ref-set" data-id="${s.id}" data-field="${field}" data-val="${val}">${label}</button>`).join('')}</div>`;

    return `<div class="read">
      <a class="back-link" href="#/log">${icon('chevron-left')}Practice log</a>
      ${ui.justSaved === s.id ? `<div class="card tight" style="border-color:var(--ep-pine-tint-2);background:color-mix(in srgb,var(--ep-pine-tint) 45%,#fff);margin-bottom:20px;display:flex;gap:12px;align-items:center">${icon('check-circle-2')}<span><strong>Session saved.</strong> Take two minutes to reflect while it’s fresh.</span></div>` : ''}
      <span class="eyebrow">Module 4 · Review</span>
      <h1 style="font-size:clamp(1.6rem,4.5vw,2.1rem);margin-bottom:6px">${esc(s.exTitle)}</h1>
      <p class="muted">${fmtDate(s.date)}</p>
      <div class="card tight"><div class="stat-row">
        <div class="stat"><div class="k">Before</div><div class="v">${s.before}<small>/100</small></div></div>
        <div class="stat"><div class="k">During / after</div><div class="v">${s.peak}<small>/100</small></div></div>
        <div class="stat"><div class="k">Falls</div><div class="v">${s.reps}</div></div>
      </div>${s.note ? `<p class="small" style="margin:12px 0 0">${esc(s.note)}</p>` : ''}</div>

      <div class="lesson"><h2>Reflect</h2></div>
      <div class="stack">
        <div class="card"><label class="field"><span>What did you expect would happen?</span><small>Before the session, what did fear predict?</small><textarea class="input" data-bind="session:${s.id}:expected" placeholder="e.g. I thought I’d swing into the wall, or freeze and not let go">${esc(r.expected)}</textarea></label></div>
        <div class="card"><label class="field"><span>What actually happened?</span><textarea class="input" data-bind="session:${s.id}:happened" placeholder="e.g. The catch was soft. My heart raced on the first fall, then less each time">${esc(r.happened)}</textarea></label></div>
        <div class="card"><label class="field"><span>What did you learn?</span><textarea class="input" data-bind="session:${s.id}:learned" placeholder="e.g. My belayer is paying attention, and the fear passes if I stay with it">${esc(r.learned)}</textarea></label></div>
        <div class="card"><div class="field"><span>How confident do you feel about repeating this exercise?</span></div>${seg('confidence', conf)}</div>
        <div class="card">${slider({ id: 'rerate', bind: `session:${s.id}:rerate`, value: r.rerate, label: 'How fearful does this exercise feel to imagine now?', hint: ex ? `Currently rated ${ex.rating} on your hierarchy. Saving updates it.` : '' })}</div>
      </div>

      <div class="lesson"><h2>What next?</h2>
        <p>Decide based on safety, learning, confidence and consistency. You don’t need to hit a particular fear score to move on.</p></div>
      <div class="card">
        <div class="decide">
          <div class="decide-q"><p>Did the setup and communication feel safe throughout?</p>${seg('safe', [['yes', 'Yes'], ['unsure', 'Unsure'], ['no', 'No']])}</div>
          <div class="decide-q"><p>Did you stay with it long enough to notice the fear start to settle?</p>${seg('settled', [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']])}</div>
          <div class="decide-q"><p>Sessions on this exercise so far</p><span class="tag">${sessionsFor(s.exId).length}</span></div>
        </div>
        ${v ? `<div class="verdict ${v.cls}"><b>${icon(v.icon)}${v.title}</b><p>${v.text}</p></div>` : '<p class="small muted" style="margin:10px 0 0">Answer the questions above (and the confidence question) for a suggestion.</p>'}
        <div class="field" style="margin-top:18px"><span>Your decision</span></div>
        <div class="choice-row">
          ${[['repeat', 'repeat', 'Repeat', 'Same exercise next session'], ['adjust', 'sliders-horizontal', 'Adjust', 'Make it a little easier or vary it'], ['progress', 'trending-up', 'Progress', 'Mark complete and move up']].map(([k, ic, t, d]) => `<button aria-pressed="${r.decision === k}" data-action="ref-set" data-id="${s.id}" data-field="decision" data-val="${k}"><b>${icon(ic)}${t}${v && v.rec === k ? ' <span class="tag pine" style="margin-left:auto">Suggested</span>' : ''}</b><span>${d}</span></button>`).join('')}
        </div>
      </div>

      <div class="btn-row" style="margin-top:22px">
        <button class="btn btn-primary" data-action="save-reflection" data-id="${s.id}">${icon('check')}${s.reflected ? 'Update reflection' : 'Save reflection'}</button>
        <a class="btn btn-text" href="#/log">Skip for now</a>
      </div>

      ${s.reflected ? nudge('after-session', { icon: 'line-chart', feature: 'analytics', title: 'Great work completing your practice', body: 'The Full Toolkit helps you analyse your progress over time, identify patterns in what makes fear spike, and plan your next session.' }) : ''}
      ${footer()}
    </div>`;
  }

  function viewLog() {
    const list = sortedSessions();
    const total = list.reduce((a, s) => a + s.reps, 0);
    const done = state.ladder.filter((x) => x.done).length;
    const bar = (label, v) => `<div class="bar"><span>${label}</span><span class="tr"><span style="width:${v}%;--c:${rateColor(v)}"></span></span><b>${v}</b></div>`;
    const sess = (s) => {
      const open = ui.openSession === s.id;
      const r = s.reflection;
      const dec = { repeat: 'Repeat', adjust: 'Adjust', progress: 'Progressed' }[r.decision];
      return `<div class="card session">
        <div class="session-head">
          <div><span class="date">${fmtShort(s.date)}</span><h3>${esc(s.exTitle)}</h3></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${s.reflected ? `<span class="tag pine">${icon('check')}Reflected</span>` : '<span class="tag">No reflection</span>'}${dec ? `<span class="tag plum">${dec}</span>` : ''}</div>
        </div>
        <div class="bars">${bar('Before', s.before)}${bar('During', s.peak)}</div>
        <div class="session-foot">
          <span class="muted">${s.reps} fall${s.reps === 1 ? '' : 's'}</span>
          ${s.reflected ? `<button class="btn btn-text" data-action="toggle-session" data-id="${s.id}">${icon(open ? 'chevron-up' : 'chevron-down')}${open ? 'Hide' : 'Show'} reflection</button>` : ''}
          <a class="btn btn-text" href="#/review/${s.id}">${icon('edit-3')}${s.reflected ? 'Edit' : 'Reflect'}</a>
          ${ui.confirmDelete === s.id
            ? `<span class="small">Delete this session?</span><button class="btn btn-text" style="color:var(--ep-clay)" data-action="delete-session" data-id="${s.id}">Delete</button><button class="btn btn-text" data-action="cancel-delete">Cancel</button>`
            : `<button class="btn btn-text" data-action="ask-delete" data-id="${s.id}">${icon('trash-2')}Delete</button>`}
        </div>
        ${open ? `<dl class="reflection-view">
          ${r.expected ? `<div><dt>Expected</dt><dd>${esc(r.expected)}</dd></div>` : ''}
          ${r.happened ? `<div><dt>What happened</dt><dd>${esc(r.happened)}</dd></div>` : ''}
          ${r.learned ? `<div><dt>Learned</dt><dd>${esc(r.learned)}</dd></div>` : ''}
          ${r.confidence ? `<div><dt>Confidence to repeat</dt><dd>${['', 'Not yet', 'A little', 'Fairly', 'Very'][r.confidence]}</dd></div>` : ''}
        </dl>` : ''}
      </div>`;
    };
    const exRows = state.ladder.map((x) => {
      const first = x.history && x.history.length ? x.history[0].rating : x.rating;
      return `<div class="ex-row"><div><div class="t">${esc(x.title)}</div><div class="s">${sessionsFor(x.id).length} session${sessionsFor(x.id).length === 1 ? '' : 's'}${x.done ? ' · completed' : ''}</div></div>
        <div class="chg">${first !== x.rating ? `${badge(first)}${icon('arrow-right')}` : ''}${badge(x.rating)}</div></div>`;
    }).join('');

    return `<div class="wrap">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="page-head">
        <div><span class="eyebrow">Module 4</span><h1>My Practice Log</h1><p>Your sessions, reflections and how your ratings have changed.</p></div>
        <a class="btn btn-primary" href="#/practice">${icon('plus')}Log a session</a>
      </div>
      <div class="card tight"><div class="stat-row">
        <div class="stat"><div class="k">Sessions</div><div class="v">${list.length}</div></div>
        <div class="stat"><div class="k">Falls</div><div class="v">${total}</div></div>
        <div class="stat"><div class="k">Steps completed</div><div class="v">${done}<small> / ${state.ladder.length}</small></div></div>
      </div></div>

      <div class="layout-side section" style="margin-top:24px">
        <div>
          <h2 class="section-title">Practice history</h2>
          ${list.length ? list.map(sess).join('') : `<div class="ladder-empty">${icon('history')}<p style="margin:8px 0 12px">No sessions yet. Your practice history will build up here.</p><a class="btn btn-primary" href="#/practice">Start fall practice</a></div>`}
          ${list.length >= 3 ? nudge('after-repeated', { icon: 'brain', feature: 'skills', title: 'Building confidence takes more than repetition', body: 'Discover the psychological strategies that help you apply what you’ve learned to your climbing: working with anxious thoughts, steadying your attention and staying present on the wall.' }) : ''}
        </div>
        <aside class="stack">
          <div class="card">
            <div class="card-label">${icon('list-ordered')}Hierarchy ratings</div>
            ${state.ladder.length ? `<p class="small muted" style="margin-top:-6px">First rating ${icon('arrow-right', 'inline')} now. Re-rate after each session.</p>${exRows}` : '<p class="small muted">Build your hierarchy to see ratings here.</p>'}
          </div>
          <div class="card">
            <div class="card-label">${icon('line-chart')}Progress analytics<span class="right">${icon('lock')}</span></div>
            <div class="preview-frame"><div class="pv">${analyticsPreview()}</div></div>
            <p class="small muted" style="margin:12px 0 10px">Full Toolkit members see before, peak and after ratings charted across every session.</p>
            <button class="btn btn-ghost btn-block" data-action="feature" data-key="analytics">Preview</button>
          </div>
        </aside>
      </div>
      ${footer()}
    </div>`;
  }

  function viewToolkit() {
    const Y = (t) => `<span class="yes">${icon('check')}${t}</span>`;
    const N = (t = 'Not included') => `<span class="no">${icon('minus')}${t}</span>`;
    const rows = [
      ['Understanding your fear', Y('Short introduction and fear-mapping exercise'), Y('21 in-depth chapters across foundations and practice')],
      ['Exposure hierarchy', Y('Build, rate, reorder and update'), Y('Plus a guided re-evaluation part way through')],
      ['Fall practice logging', Y('Before and during ratings, falls completed'), Y('Before, peak and after ratings, variations practised')],
      ['Reflection', Y('Four core questions after each session'), Y('Guided reflection, planning and a final review')],
      ['Progress tracking', Y('Basic practice history'), Y('Detailed visualisations over time')],
      ['Video lessons', N(), Y('24 lessons, including exercise demonstrations')],
      ['Goal setting', N(), Y('SMART goals and the climber you want to be')],
      ['Training plan', N(), Y('Personalised weekly schedule around your climbing')],
      ['Mental skills', N(), Y('Behavioural, cognitive and mindfulness strategies')],
      ['Community', N(), Y('Members’ group of climbers on the same programme')],
      ['Safety guidance', Y('Included'), Y('Included')],
    ];
    return `<div class="wrap">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="cta-band">
        <img class="wm" src="../../assets/img/logo-symbol-purple.png" alt="">
        <span class="eyebrow">Explore the Full Toolkit</span>
        <h2>Essentials gets you started. The Fear of Falling Toolkit helps you keep going.</h2>
        <p>The complete, self-guided programme from Expedition Psychology: video lessons, structured training plans, detailed progress tracking and the psychological strategies that help confidence carry over into your climbing.</p>
        <div class="btn-row" style="margin-top:18px"><a class="btn btn-plum" style="background:#fff;color:var(--ep-ink)" href="${UPGRADE_URL}" target="_blank" rel="noopener">${CTA_LABEL}${icon('arrow-up-right')}</a><a class="btn btn-ghost" href="#compare">Compare plans</a></div>
      </div>

      <div class="section">
        <h2 class="section-title">What you’d unlock</h2>
        <div class="feature-grid">${['videos', 'plan', 'analytics', 'skills', 'goals', 'reflection', 'community'].map(featureCard).join('')}</div>
      </div>

      <div class="section" id="compare">
        <h2 class="section-title">Essentials and the Full Toolkit</h2>
        <table class="compare">
          <thead><tr><th scope="col">Feature</th><th scope="col">Essentials<small>Your current plan</small></th><th scope="col" class="hl">Full Toolkit<small>£99</small></th></tr></thead>
          <tbody>${rows.map(([f, a, b]) => `<tr><td>${f}</td><td>${a}</td><td class="hl">${b}</td></tr>`).join('')}</tbody>
        </table>
        <div class="btn-row" style="margin-top:18px"><a class="btn btn-plum" href="${UPGRADE_URL}" target="_blank" rel="noopener">${CTA_LABEL}${icon('arrow-up-right')}</a></div>
      </div>

      <div class="section grid-2">
        <div class="card">
          <span class="eyebrow">Want 1:1 support?</span>
          <h3>Fear of Falling Coaching</h3>
          <p class="muted">The complete toolkit plus five weekly 1:1 sessions with a Clinical Psychologist, including video analysis of your falls, personalised written feedback and email support between sessions.</p>
          <a class="btn btn-ghost" href="../../services-individuals.html" target="_blank" rel="noopener">Ask about coaching${icon('arrow-up-right')}</a>
        </div>
        <div class="card">
          <span class="eyebrow pine">Staying on Essentials?</span>
          <h3>That’s a good place to start</h3>
          <p class="muted">Everything you need to begin structured fall practice stays available: your hierarchy, practice log, reflections and safety guidance.</p>
          <a class="btn btn-ghost" href="#/">Back to my dashboard</a>
        </div>
      </div>
      ${footer()}
    </div>`;
  }

  function viewSafety() {
    return `<div class="read lesson">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">Always available</span>
      <h1>Safety and Responsibility</h1>
      <p>This course supports the psychological side of climbing, particularly confidence and fear of falling. It does not teach you how to climb, and it is not a substitute for in-person, professional climbing instruction.</p>
      <p>All content is in the context of indoor climbing and assumes that you and your belayer already know how to climb and belay safely, including clipping correctly, managing the rope and identifying and managing risks.</p>
      <h2>Only practise falls</h2>
      <ul>
        <li>In line with the policies and safety guidance of your climbing wall</li>
        <li>With appropriate equipment that is correctly fitted and in good condition (repeated falls increase wear, so check it each session)</li>
        <li>With a competent, attentive belayer using the technique recommended by the manufacturer of the belay device. An assisted-braking device such as a GriGri adds an important extra layer of safety</li>
        <li>On a suitable route in an appropriate, quieter area of the wall, after letting nearby climbers know what you’re doing</li>
        <li>With good rope awareness: keep legs and arms clear of the rope to avoid flipping</li>
      </ul>
      <div class="callout safety"><p class="callout-title">${icon('shield-check')}If in doubt, don’t</p>
        <p>Do not practise falling exercises if you are unsure about any aspect of your setup, communication or technique. Seek guidance from a qualified instructor.</p></div>
      <h2>Looking after yourself</h2>
      <p>You are responsible for your own safety and decisions. Stop any exercise if you feel unwell, injured, overly fatigued or unsafe. If fear becomes overwhelming, return to an easier step.</p>
      <p>If you have a history of significant trauma, panic or other mental health difficulties that may be triggered by exposure work, consider working through this programme with support from a qualified professional.</p>
      ${footer()}
    </div>`;
  }

  function viewNotes() {
    return `<div class="read lesson">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">For the team</span>
      <h1>Prototype Notes</h1>
      <p>A working local prototype of the Essentials tier. The core features work end to end in the browser. Nothing here is connected to the live site, payments or member accounts.</p>
      <h2>What works now</h2>
      <ul>
        <li>All four modules, the dashboard, safety page and Full Toolkit page</li>
        <li>Editable hierarchy: add from the list or your own, rate 0–100, reorder, sort, mark complete, edit and remove</li>
        <li>Practice sessions with a safety check, before and during ratings, a fall counter and notes. An unfinished session survives a page reload</li>
        <li>Reflection questions, re-rating that updates the hierarchy, decision guidance and a practice history</li>
        <li>Locked feature previews, contextual upgrade prompts (dismissible, never shown mid-exercise) and a plan comparison</li>
        <li>Progress saved to this browser’s local storage</li>
      </ul>
      <h2>Needs backend work for the live product</h2>
      <ul>
        <li><strong>Accounts and authentication.</strong> Essentials users need a login, ideally the same member area as the Toolkit.</li>
        <li><strong>A database.</strong> Local storage is per browser: progress is lost if it’s cleared and doesn’t sync between phone and laptop.</li>
        <li><strong>Payments and entitlements.</strong> Essentials purchase, the £99 upgrade checkout (and whether Essentials buyers get credit), and server-side unlocking of features. The CTA currently links to the local sales page.</li>
        <li><strong>Carrying data over on upgrade.</strong> The hierarchy and log map closely to the Toolkit’s exposure ladder and logbook.</li>
        <li><strong>Video hosting and access control</strong> for the lesson library.</li>
        <li><strong>Community access.</strong> The WhatsApp invite should only be shown to paying Toolkit members.</li>
        <li><strong>Conversion tracking</strong> for prompt views, clicks and dismissals, behind the existing cookie consent.</li>
      </ul>
      <h2>Design decisions to check</h2>
      <ul>
        <li><strong>Branding.</strong> The brief specified Montserrat, Lato and a #f5d7a6 background, but the live site and the Toolkit member area use Arboria, Nunito, a paper background and pine and plum accents. The prototype follows the live platform so Essentials feels like the same product. The three overrides at the top of <code>styles.css</code> switch it to the brief’s values.</li>
        <li><strong>Essentials price</strong> isn’t shown anywhere yet.</li>
        <li><strong>Ratings.</strong> Essentials logs before and during ratings; the Toolkit’s before, peak and after is kept as an upgrade benefit.</li>
        <li>The community preview uses clearly labelled illustrative messages, not real quotes.</li>
      </ul>
      <h2>Demo controls</h2>
      <div class="btn-row"><button class="btn btn-ghost" data-action="load-sample">${icon('download')}Load example data</button><button class="btn btn-ghost" data-action="reset-all">${icon('rotate-ccw')}Reset everything</button></div>
      ${footer()}
    </div>`;
  }

  function footer() {
    return `<footer class="app-foot"><span>© Expedition Psychology · Fear of Falling Essentials</span><a href="#/safety">Safety guidance</a><a href="#/toolkit">Explore the Full Toolkit</a><a href="#/notes">Prototype notes</a></footer>`;
  }

  /* ---------------------------------------------------------- */
  /* Modal & toast                                               */
  /* ---------------------------------------------------------- */
  let lastFocus = null;
  function openFeature(key) {
    const f = FEATURES[key];
    if (!f) return;
    lastFocus = document.activeElement;
    $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
        <div class="modal-head"><span class="fi">${icon(f.icon)}</span><div><span class="eyebrow">Full Toolkit</span><h2 id="mt">${f.title}</h2></div>
          <button class="icon-btn x" data-action="close-modal" aria-label="Close">${icon('x')}</button></div>
        <div class="modal-body">
          <p>${f.what}</p>
          <ul>${f.help.map((h) => `<li>${icon('check')}<span>${h}</span></li>`).join('')}</ul>
          <div class="preview-frame"><span class="tag plum pv-tag">${icon('lock')}Preview</span><div class="pv">${f.preview()}</div></div>
        </div>
        <div class="modal-foot">
          <a class="btn btn-plum" href="${UPGRADE_URL}" target="_blank" rel="noopener">${CTA_LABEL}</a>
          <a class="btn btn-ghost" href="#/toolkit" data-action="close-modal">Compare plans</a>
        </div>
      </div></div>`;
    document.body.classList.add('modal-open');
    paintIcons();
    const btn = $('#modal-root .x');
    if (btn) btn.focus();
  }
  function closeModal() {
    $('#modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  let toastTimer;
  function toast(msg) {
    $('#toast-root').innerHTML = `<div class="toast">${icon('check-circle-2')}<span>${msg}</span></div>`;
    paintIcons();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast-root').innerHTML = ''; }, 2600);
  }

  /* ---------------------------------------------------------- */
  /* Router                                                      */
  /* ---------------------------------------------------------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: parts[0] || '', arg: parts[1] };
  }
  function render() {
    const r = route();
    const views = { '': viewDashboard, understand: viewUnderstand, hierarchy: viewHierarchy, practice: viewPractice, log: viewLog, toolkit: viewToolkit, safety: viewSafety, notes: viewNotes };
    let html;
    if (r.name === 'review') html = viewReview(r.arg);
    else html = (views[r.name] || viewDashboard)();
    $('#app').innerHTML = html;
    const active = r.name === 'review' ? 'log' : r.name;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === active));
    paintIcons();
    const key = location.hash;
    if (ui.lastRoute !== key) { ui.lastRoute = key; window.scrollTo(0, 0); }
  }
  function paintIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.9 } }); }

  /* ---------------------------------------------------------- */
  /* Actions                                                     */
  /* ---------------------------------------------------------- */
  function addToLadder(item) {
    state.ladder.push(Object.assign({ id: uid(), rating: 50, done: false, history: [] }, item));
  }
  function addChip(group) {
    const inp = $('#add-' + group);
    const v = inp && inp.value.trim();
    if (!v) return;
    if (!state.m1[group].includes(v)) state.m1[group].push(v);
    save(); render();
    const again = $('#add-' + group); if (again) again.focus();
  }
  function addCustom() {
    const inp = $('#custom-title');
    const v = inp && inp.value.trim();
    if (!v) { if (inp) inp.focus(); return; }
    addToLadder({ title: v, desc: '', custom: true });
    save(); render(); toast('Added to your hierarchy');
  }

  const actions = {
    'load-sample'() { state = sampleData(); save(); ui.justSaved = null; render(); toast('Example data loaded'); },
    'reset-all'() {
      if (!window.confirm('Reset all Essentials progress in this browser?')) return;
      state = blank(); save(); location.hash = '#/'; render(); toast('Progress reset');
    },
    feature(el) { openFeature(el.dataset.key); },
    'close-modal'() { closeModal(); },
    dismiss(el) { state.dismissed[el.dataset.key] = true; save(); render(); },
    chip(el) {
      const g = el.dataset.group, v = el.dataset.val, arr = state.m1[g];
      const i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1); else arr.push(v);
      save(); render();
    },
    'add-chip'(el) { addChip(el.dataset.group); },
    'complete-m1'() { state.m1.done = true; save(); render(); toast('Module 1 complete'); },
    'add-lib'(el) {
      const l = LIBRARY.find((x) => x.key === el.dataset.key);
      if (!l) return;
      addToLadder({ key: l.key, title: l.title, desc: l.desc, custom: false });
      save(); render(); toast('Added to your hierarchy');
    },
    'add-custom'() { addCustom(); },
    move(el) {
      const i = state.ladder.findIndex((x) => x.id === el.dataset.id), j = i + Number(el.dataset.dir);
      if (i < 0 || j < 0 || j >= state.ladder.length) return;
      const [x] = state.ladder.splice(i, 1); state.ladder.splice(j, 0, x);
      save(); render();
    },
    sort() { state.ladder.sort((a, b) => a.rating - b.rating); save(); render(); toast('Sorted from least to most fear'); },
    'toggle-done'(el) { const x = getEx(el.dataset.id); if (x) { x.done = !x.done; save(); render(); } },
    edit(el) { ui.editing = ui.editing === el.dataset.id ? null : el.dataset.id; save(); render(); },
    remove(el) {
      const x = getEx(el.dataset.id);
      if (!x) return;
      if (sessionsFor(x.id).length && !window.confirm('This exercise has logged sessions. Remove it from your hierarchy? Your log will keep the sessions.')) return;
      state.ladder = state.ladder.filter((y) => y.id !== x.id);
      save(); render();
    },
    'save-ladder'() {
      const now = new Date().toISOString();
      state.ladder.forEach((x) => { if (!x.history || !x.history.length) x.history = [{ date: now, rating: x.rating }]; });
      state.ladderSaved = true; ui.editing = null; save(); render(); toast('Hierarchy saved');
    },
    'start-practice'() {
      const cur = currentStep();
      state.draft = { step: 0, exId: (cur || state.ladder[0]).id, checks: [], before: 40, peak: 60, reps: 0, note: '' };
      save(); render();
    },
    'pick-ex'(el) { state.draft.exId = el.dataset.id; save(); render(); },
    check(el) { const i = Number(el.dataset.i); state.draft.checks[i] = !state.draft.checks[i]; save(); render(); },
    wiz(el) { state.draft.step = Math.max(0, Math.min(3, state.draft.step + Number(el.dataset.d))); save(); render(); window.scrollTo(0, 0); },
    reps(el) { state.draft.reps = Math.max(0, state.draft.reps + Number(el.dataset.d)); save(); render(); },
    'cancel-draft'() {
      if (!window.confirm('Discard this practice session?')) return;
      state.draft = null; save(); render();
    },
    'save-session'() {
      const d = state.draft, ex = getEx(d.exId);
      const s = {
        id: uid(), exId: d.exId, exTitle: ex ? ex.title : 'Exercise', date: new Date().toISOString(),
        before: d.before, peak: d.peak, reps: d.reps, note: d.note, reflected: false,
        reflection: { expected: '', happened: '', learned: '', confidence: 0, rerate: ex ? ex.rating : 50, safe: '', settled: '', decision: '' },
      };
      state.sessions.push(s); state.draft = null; ui.justSaved = s.id; save();
      location.hash = '#/review/' + s.id;
    },
    'ref-set'(el) {
      const s = getSession(el.dataset.id); if (!s) return;
      const f = el.dataset.field;
      const val = f === 'confidence' ? Number(el.dataset.val) : el.dataset.val;
      s.reflection[f] = s.reflection[f] === val ? (f === 'confidence' ? 0 : '') : val;
      save(); render();
    },
    'save-reflection'(el) {
      const s = getSession(el.dataset.id); if (!s) return;
      const ex = getEx(s.exId);
      if (ex) {
        if (ex.rating !== s.reflection.rerate) {
          ex.history = ex.history || [];
          ex.history.push({ date: new Date().toISOString(), rating: s.reflection.rerate });
          ex.rating = s.reflection.rerate;
        }
        if (s.reflection.decision === 'progress') ex.done = true;
      }
      s.reflected = true; ui.justSaved = null; save(); render();
      toast(s.reflection.decision === 'progress' ? 'Saved. Step marked complete' : 'Reflection saved');
    },
    'toggle-session'(el) { ui.openSession = ui.openSession === el.dataset.id ? null : el.dataset.id; render(); },
    'ask-delete'(el) { ui.confirmDelete = el.dataset.id; render(); },
    'cancel-delete'() { ui.confirmDelete = null; render(); },
    'delete-session'(el) { state.sessions = state.sessions.filter((s) => s.id !== el.dataset.id); ui.confirmDelete = null; save(); render(); toast('Session deleted'); },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    if (el.dataset.action === 'close-modal') {
      // Clicks inside the dialog bubble up to the backdrop; only close on the backdrop itself.
      if (el.classList.contains('modal-backdrop') && e.target !== el) return;
      if (el.tagName === 'A') { closeModal(); return; }
    }
    if (el.tagName !== 'INPUT') e.preventDefault();
    fn(el, e);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal();
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) {
      e.preventDefault();
      if (e.target.dataset.enter === 'add-chip') addChip(e.target.dataset.group);
      if (e.target.dataset.enter === 'add-custom') addCustom();
    }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    const bind = el.dataset && el.dataset.bind;
    if (!bind) return;
    const val = el.type === 'range' ? Number(el.value) : el.value;
    setBind(bind, val);
    if (el.dataset.rate) {
      const id = el.dataset.rate;
      $('#' + id + '-wrap').style.setProperty('--c', rateColor(val));
      $('#' + id + '-out').innerHTML = `${val}<small>/100</small>`;
      $('#' + id + '-word').textContent = ratingWord(val);
    }
    if (el.dataset.badge) {
      const b = document.getElementById(el.dataset.badge);
      if (b) { b.textContent = val; b.style.setProperty('--c', rateColor(val)); b.title = ratingWord(val); }
    }
    saveSoon();
  });

  function setBind(bind, val) {
    if (bind.startsWith('ladder:')) {
      const [, id, f] = bind.split(':'); const x = getEx(id); if (x) x[f] = val; return;
    }
    if (bind.startsWith('session:')) {
      const [, id, f] = bind.split(':'); const s = getSession(id); if (s) s.reflection[f] = val; return;
    }
    const [root, f] = bind.split('.');
    if (root === 'draft' && state.draft) state.draft[f] = val;
    if (root === 'm1') state.m1[f] = val;
  }

  window.addEventListener('hashchange', () => { ui.confirmDelete = null; ui.editing = null; render(); });
  window.addEventListener('pagehide', save);

  /* ---------------------------------------------------------- */
  /* Example data                                                */
  /* ---------------------------------------------------------- */
  function sampleData() {
    const s = blank();
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(19, 0, 0, 0); return d.toISOString(); };
    s.m1 = { triggers: ['Being pumped', 'Climbing above my last clip', 'Climbing with someone new'], thoughts: ['What if my belayer doesn’t catch me?', 'What if I swing into the wall?'], body: ['Over-gripping and tension', 'Fast, shallow breathing'], behaviours: ['Saying “take” early', 'Down-climbing'], extra: '', done: true };
    const pick = (key, rating, first, done) => {
      const l = LIBRARY.find((x) => x.key === key);
      return { id: key, key, title: l.title, desc: l.desc, custom: false, rating, done, history: [{ date: day(20), rating: first }].concat(first !== rating ? [{ date: day(3), rating }] : []) };
    };
    s.ladder = [pick('tr-snug', 10, 25, true), pick('tr-slack', 30, 40, false), pick('tr-unannounced', 50, 55, false),
      { id: 'own1', title: 'Top rope fall on the overhang', desc: 'Same as with a little slack, but on the steep wall.', custom: true, rating: 55, done: false, history: [{ date: day(20), rating: 60 }, { date: day(3), rating: 55 }] },
      pick('lead-clipped', 65, 65, false), pick('lead-at', 75, 75, false), pick('lead-above', 85, 85, false)];
    s.ladderSaved = true;
    const sess = (id, exId, ago, before, peak, reps, ref) => ({ id, exId, exTitle: s.ladder.find((x) => x.id === exId).title, date: day(ago), before, peak, reps, note: '', reflected: !!ref, reflection: Object.assign({ expected: '', happened: '', learned: '', confidence: 0, rerate: 50, safe: '', settled: '', decision: '' }, ref || {}) });
    s.sessions = [
      sess('s1', 'tr-snug', 17, 30, 55, 5, { expected: 'That I’d freeze and not be able to let go.', happened: 'First one took ages. By the fifth I let go without counting down.', learned: 'The rope catches every time. My belayer was paying attention.', confidence: 3, rerate: 15, safe: 'yes', settled: 'yes', decision: 'repeat' }),
      sess('s2', 'tr-snug', 13, 20, 40, 6, { expected: 'Easier than last time, but still nervous.', happened: 'Pretty relaxed after the second fall.', learned: 'Starting with this step settles me down.', confidence: 4, rerate: 10, safe: 'yes', settled: 'yes', decision: 'progress' }),
      sess('s3', 'tr-slack', 6, 45, 75, 4, { expected: 'That the extra drop would feel like I’d hit the floor.', happened: 'Stomach dropped on the first one, then it was fine. Stopped after four as I got tired.', learned: 'The drop is short. The fear is mostly the anticipation.', confidence: 2, rerate: 30, safe: 'yes', settled: 'partly', decision: 'repeat' }),
      sess('s4', 'tr-slack', 3, 38, 62, 6, null),
    ];
    s.sessions[3].reflection.rerate = 30;
    return s;
  }

  render();
})();
