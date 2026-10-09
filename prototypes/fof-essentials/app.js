/* ============================================================
   Fear of Falling Essentials — interactive prototype
   Vanilla JS, hash routing, progress persisted to localStorage.
   Anything that would need accounts, a database or payments in
   the live product is listed on the #/notes page.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------- */
  /* Pricing — the single source for every upgrade message       */
  /* ---------------------------------------------------------- */
  // essentialsCredit: what the customer paid for Essentials, credited towards
  // the Toolkit. Unknown until the Essentials price is confirmed; in the live
  // product it should come from the customer's verified purchase, not this file.
  const PRICING = { toolkit: 99, essentialsCredit: null, currency: '£' };
  const UPGRADE_URL = '../../fear-of-falling.html'; // Placeholder: no checkout or entitlement check yet.
  const money = (n) => PRICING.currency + (Number.isInteger(n) ? n : n.toFixed(2));
  function upgradeLabel() {
    const c = PRICING.essentialsCredit;
    return typeof c === 'number' ? `Upgrade for ${money(Math.max(0, PRICING.toolkit - c))}` : 'Upgrade — pay only the difference';
  }
  const PRICE_NOTE = `Upgrade to the full Fear of Falling Toolkit and pay only the difference. Your Essentials purchase is credited towards the ${money(PRICING.toolkit)} price.`;

  /* ---------------------------------------------------------- */
  /* Storage                                                     */
  /* ---------------------------------------------------------- */
  const KEY = 'ep-fof-essentials-v1';
  const blank = () => ({
    v: 2,
    ack: { disclaimer: false, safety: false },
    read: {},
    m1: { triggers: [], thoughts: [], body: [], behaviours: [], extra: '', done: false }, // the fear map (Module 2)
    ladder: [],
    ladderSaved: false,
    sessions: [],
    draft: null,
    reviews: [],
    reviewDraft: {},
    dismissed: {},
  });
  let state = load();
  let saveTimer = null;
  const ui = { editing: null, openSession: null, confirmDelete: null, justSaved: null, lastRoute: null };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(Object.assign(blank(), JSON.parse(raw), { v: JSON.parse(raw).v || 1 }));
    } catch (e) { /* storage unavailable: run in memory */ }
    return blank();
  }

  // v1 → v2: four modules became an introduction plus eight modules.
  function migrate(s) {
    s.ack = s.ack || { disclaimer: false, safety: false };
    s.read = s.read || {};
    s.reviews = s.reviews || [];
    s.reviewDraft = s.reviewDraft || {};
    if (s.v < 2) {
      // The old Module 1 covered "what is fear" and the fear map; the map lives on in Module 2.
      if (s.m1 && s.m1.done) s.read.m1 = true;
      s.ladder.forEach((x) => {
        // The first history entry was written when the user first saved the ladder: a genuine baseline.
        if (x.original === undefined && x.history && x.history.length) { x.original = x.history[0].rating; x.originalDate = x.history[0].date; }
      });
      s.sessions.forEach((x) => { if (x.after === undefined) x.after = null; });
      if (s.draft) { if (s.draft.after === undefined) s.draft.after = null; s.draft.step = Math.min(s.draft.step, 3); }
      s.v = 2;
    }
    return s;
  }
  function save() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }

  /* ---------------------------------------------------------- */
  /* Course structure                                            */
  /* ---------------------------------------------------------- */
  const CH = [
    { key: 'intro', route: 'intro', label: 'Introduction', title: 'Welcome to Fear of Falling Essentials', part: 1 },
    { key: 'm1', route: 'fear', n: 1, title: 'What Is Fear?', part: 1 },
    { key: 'm2', route: 'know', n: 2, title: 'Getting to Know Your Fear', part: 1 },
    { key: 'm3', route: 'good-practice', n: 3, title: 'What Makes Good Fall Practice?', part: 1 },
    { key: 'm4', route: 'ladder', n: 4, title: 'Creating Your Exposure Ladder', part: 1 },
    { key: 'm5', route: 'variety', n: 5, title: 'The Importance of Variety', part: 1 },
    { key: 'm6', route: 'practice', n: 6, title: 'Fall Practice', part: 2 },
    { key: 'm7', route: 'progress', n: 7, title: 'Review Your Progress', part: 2 },
    { key: 'm8', route: 'finish', n: 8, title: 'Congratulations and Next Steps', part: 2 },
  ];
  const PART = { 1: 'Foundations', 2: 'Practical Application' };
  const chLabel = (c) => (c.n ? `Module ${c.n}` : c.label);
  const chByKey = (k) => CH.find((c) => c.key === k);
  const ALIASES = { understand: 'fear', hierarchy: 'ladder', review: 'session' };
  // Routes that need the introduction acknowledgements first. Safety, notes and the Toolkit page never do.
  const GATED = new Set(['fear', 'know', 'good-practice', 'ladder', 'variety', 'practice', 'progress', 'finish', 'session', 'log']);

  const acked = () => !!(state.ack.disclaimer && state.ack.safety);
  const ladderReady = () => state.ladderSaved && state.ladder.length > 0;
  const ladderAllDone = () => ladderReady() && state.ladder.every((x) => x.done);
  function chDone(key) {
    switch (key) {
      case 'intro': return acked();
      case 'm2': return !!state.m1.done;
      case 'm4': return ladderReady();
      case 'm6': return ladderAllDone();
      case 'm7': return state.reviews.length > 0;
      default: return !!state.read[key];
    }
  }
  const nextOpen = () => CH.find((c) => !chDone(c.key)) || null;
  // Chapters unlock in order: completed chapters stay open, plus the first one not yet completed.
  function accessible(key) {
    const open = nextOpen();
    return key === 'intro' || !open || chDone(key) || open.key === key;
  }

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
      q: 'Triggers: what situations make you most anxious?',
      hint: 'When and where the fear appears.',
      opts: ['Trying a limit route', 'Throwing for a hold', 'Being pumped', 'Climbing above my last clip', 'Clipping from a stretched position', 'Steep or overhanging ground', 'A new area of the wall', 'Climbing with someone new'],
    },
    thoughts: {
      q: 'Thoughts: what tends to go through your mind?',
      hint: 'What your mind predicts or warns you about, often as “what if…”.',
      opts: ['What if my belayer doesn’t catch me?', 'Did I tie my knot correctly?', 'What if I swing into the wall?', 'I’m going to get hurt', 'I can’t do this move', 'Everyone is watching me'],
    },
    body: {
      q: 'Body sensations: what do you notice?',
      hint: 'How your body responds.',
      opts: ['Racing heart', 'Fast, shallow breathing', 'Over-gripping and tension', 'Sweaty hands', 'Shaking legs', 'Narrowed vision'],
    },
    behaviours: {
      q: 'Behaviour: how does fear change your climbing?',
      hint: 'What you do to reduce fear. Fight looks like forcing it; flight looks like getting out.',
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

  const INTRO_VIDEO_ID = 'c_dasez4PQ4';

  /* ---------------------------------------------------------- */
  /* Helpers                                                     */
  /* ---------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const icon = (n, cls = '') => `<i data-lucide="${n}"${cls ? ` class="${cls}"` : ''}></i>`;
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtShort = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

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
  const hasNum = (v) => typeof v === 'number' && !isNaN(v);

  function deltaHtml(orig, now) {
    if (!hasNum(orig)) return '<span class="delta none">No baseline</span>';
    const d = now - orig;
    if (d < 0) return `<span class="delta down">${icon('arrow-down')}${-d} lower</span>`;
    if (d > 0) return `<span class="delta up">${icon('arrow-up')}${d} higher</span>`;
    return '<span class="delta same">No change</span>';
  }

  const getEx = (id) => state.ladder.find((x) => x.id === id);
  const getSession = (id) => state.sessions.find((x) => x.id === id);
  const currentStep = () => state.ladder.find((x) => !x.done) || null;
  // Exercises unlock in ladder order: completed steps and the current step are open.
  function exLocked(x) {
    const cur = currentStep();
    return !x.done && !!cur && state.ladder.indexOf(x) > state.ladder.indexOf(cur);
  }
  const lastDone = () => { const d = state.ladder.filter((x) => x.done); return d[d.length - 1] || null; };
  const sessionsFor = (exId) => state.sessions.filter((s) => s.exId === exId);
  const sortedSessions = () => state.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));

  function nextAction() {
    if (!acked()) return { label: 'Start the introduction', href: '#/intro', icon: 'play-circle' };
    const c = nextOpen();
    if (!c) return { label: 'Open my practice log', href: '#/log', icon: 'history' };
    if (c.key === 'm6') return state.draft
      ? { label: 'Resume your practice session', href: '#/practice', icon: 'activity' }
      : { label: 'Continue: Module 6 · Fall Practice', href: '#/practice', icon: 'activity' };
    return { label: `Continue: ${chLabel(c)} · ${c.title}`, href: '#/' + c.route, icon: 'arrow-right' };
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
        <span class="eyebrow">In the full Toolkit</span>
        <h4>${title}</h4>
        <p>${body}</p>
        <div class="btn-row">
          <button class="btn btn-plum" data-action="feature" data-key="${feature}">See how it works</button>
          <button class="btn btn-text" data-action="dismiss" data-key="${key}">Not now</button>
        </div>
        <p class="price-note">Essentials customers pay only the difference to upgrade.</p>
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

  function upgradeButtons(extra = '') {
    return `<div class="btn-row"><a class="btn btn-plum" href="${UPGRADE_URL}" target="_blank" rel="noopener">${upgradeLabel()}${icon('arrow-up-right')}</a>${extra}</div>
      <p class="price-note">${PRICE_NOTE}</p>`;
  }

  function chapterRows() {
    const open = nextOpen();
    const row = (c) => {
      const done = chDone(c.key);
      const locked = !accessible(c.key);
      const status = done ? 'Complete' : c === open ? (c.key === 'm6' && state.ladder.length ? `${state.ladder.filter((x) => x.done).length} of ${state.ladder.length} exercises complete` : 'Up next') : 'Locked';
      const inner = `<span class="dot">${done ? icon('check') : locked ? icon('lock') : c.n || icon('play')}</span>
        <span class="tx"><span class="t">${c.n ? c.n + '. ' : ''}${c.title}</span><span class="s">${status}</span></span>`;
      return locked
        ? `<div class="ch-row locked" aria-disabled="true">${inner}</div>`
        : `<a class="ch-row ${done ? 'done' : c === open ? 'current' : ''}" href="#/${c.route}">${inner}<span class="go">${icon('chevron-right')}</span></a>`;
    };
    return `<div class="ch-group"><span class="eyebrow">Part 1 · Foundations</span><div class="ch-list">${CH.filter((c) => c.part === 1).map(row).join('')}</div></div>
      <div class="ch-group"><span class="eyebrow">Part 2 · Practical Application</span><div class="ch-list">${CH.filter((c) => c.part === 2).map(row).join('')}</div></div>`;
  }

  function chapterHead(key, extra = '') {
    const c = chByKey(key);
    return `<a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">${chLabel(c)} · ${PART[c.part]}${extra}</span>
      <h1>${c.title}</h1>`;
  }

  function chapterFoot(key, primary) {
    const i = CH.findIndex((c) => c.key === key);
    const prev = CH[i - 1], next = CH[i + 1];
    return `<div class="chapter-foot">
      ${primary ? `<div class="btn-row">${primary}</div>` : ''}
      <nav class="pn" aria-label="Chapters">
        ${prev ? `<a class="btn btn-ghost" href="#/${prev.route}">${icon('chevron-left')}Previous</a>` : ''}
        ${next ? (accessible(next.key)
          ? `<a class="btn btn-ghost next" href="#/${next.route}">Next${icon('chevron-right')}</a>`
          : `<span class="btn btn-ghost next is-locked" aria-disabled="true" title="Complete this chapter to unlock the next one">${icon('lock')}Next</span>`) : ''}
      </nav>
    </div>`;
  }

  function readFoot(key) {
    const i = CH.findIndex((c) => c.key === key);
    const next = CH[i + 1];
    return chapterFoot(key, state.read[key]
      ? `<span class="tag pine">${icon('check')}Chapter complete</span>${next ? `<a class="btn btn-primary" href="#/${next.route}">Next: ${next.title}${icon('arrow-right')}</a>` : ''}`
      : `<button class="btn btn-primary" data-action="mark-read" data-key="${key}">${icon('check')}Mark complete and continue</button>`);
  }

  /* ---------------------------------------------------------- */
  /* Full Toolkit feature previews                               */
  /* ---------------------------------------------------------- */
  // Mirrors the Toolkit dashboard's "Your Training Schedule" card.
  function plannerPreview() {
    const days = [['M', 'AM'], ['T', ''], ['W', ''], ['T', 'PM'], ['F', ''], ['S', ''], ['S', '']];
    return `<div class="pv-illus">Illustrative example</div>
      <div class="sched">
        <div class="card-label" style="margin-bottom:12px">${icon('clipboard-list')}Your training schedule</div>
        <div class="sched-days">${days.map(([d, t]) => `<div class="${t ? 'on' : ''}"><i>${d}</i><small>${t}</small></div>`).join('')}</div>
        <div class="sched-meta"><div><span>Practice timing</span><b>Start of session</b></div><div><span>Daily duration</span><b>30 minutes</b></div></div>
      </div>`;
  }

  // Mirrors the Toolkit's Progress Comparison page.
  function analyticsPreview() {
    const init = [20, 35, 50, 60, 70, 85], cur = [10, 20, 35, 45, 60, 75];
    const W = 460, H = 170, px = (i) => 34 + i * ((W - 50) / 5), py = (v) => H - 26 - v * ((H - 44) / 100);
    const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i)} ${py(v)}`).join(' ');
    const pts = (arr, c) => arr.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="3.4" fill="${c}"/>`).join('');
    const grid = [0, 25, 50, 75, 100].map((v) => `<line x1="34" x2="${W - 16}" y1="${py(v)}" y2="${py(v)}" stroke="#e6e6e1" stroke-dasharray="3 3"/><text x="26" y="${py(v) + 4}" font-size="10" text-anchor="end" fill="#84847c">${v}</text>`).join('');
    const xl = init.map((_, i) => `<text x="${px(i)}" y="${H - 8}" font-size="10" text-anchor="middle" fill="#84847c">Ex ${i + 1}</text>`).join('');
    const names = [['Top rope fall, no slack', 20, 10], ['Top rope fall, a little slack', 35, 20], ['Top rope fall, unannounced', 50, 35]];
    return `<div class="pv-illus">Illustrative data · layout matches the Toolkit’s Progress Comparison page</div>
      <div class="pv-stats">
        <div class="pv-stat"><span class="ic" style="background:var(--ep-pine-tint);color:var(--ep-pine-700)">${icon('trending-down')}</span><b>13%</b><span>Avg. fear reduction</span></div>
        <div class="pv-stat"><span class="ic" style="background:color-mix(in srgb,var(--ep-sand) 25%,#fff);color:#a37a1c">${icon('zap')}</span><b>6</b><span>Exercises improved</span></div>
        <div class="pv-stat"><span class="ic" style="background:var(--ep-plum-tint);color:var(--ep-plum)">${icon('award')}</span><b>15%</b><span>Best improvement</span></div>
      </div>
      <div class="pv-card"><h5>${icon('trending-down')}Fear Level Comparison</h5>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustrative chart comparing initial and current fear for six exercises">${grid}${xl}
          <path d="${path(init)}" fill="none" stroke="#d4d4cd" stroke-width="2.5"/>${pts(init, '#d4d4cd')}
          <path d="${path(cur)}" fill="none" stroke="#3a6056" stroke-width="2.5"/>${pts(cur, '#3a6056')}</svg>
        <div class="small" style="display:flex;gap:14px;justify-content:center"><span style="color:#aeaea6">● Initial Fear</span><span style="color:#3a6056">● Current Fear</span></div>
      </div>
      <div class="pv-two">
        <div class="pv-card"><h5>Ladder Evolution</h5><div class="pv-rows">${names.map(([n, a, b]) => `<div><span>${n}<small>${a} → ${b}</small></span><span class="chg">-${a - b}%</span></div>`).join('')}</div></div>
        <div class="pv-card"><h5>Training History</h5><div class="pv-rows">${names.slice().reverse().map(([n], i) => `<div><span>${n}</span><small>${['07/10', '01/10', '24/09'][i]}</small></div>`).join('')}</div></div>
      </div>`;
  }

  function videosPreview() {
    const pick = [2, 7, 10, 15, 19];
    return `<div class="mini-list">${pick.map((i) => `<div>${icon('play-circle')}<span>${i}. ${esc(LESSONS[i - 1])}</span><span class="r">${icon('lock')}</span></div>`).join('')}<div style="justify-content:center;color:var(--text-muted)">and more lessons and exercise demonstrations</div></div>`;
  }
  function skillsPreview() {
    return `<div class="mini-cols">
      <div><b>Behavioural</b>Pre-climb check ritual<br>Belaying with intention<br>Climbing with someone new</div>
      <div><b>Cognitive</b>Spotting fear-driven thoughts<br>Writing a balanced response<br>Changing the voice you listen to</div>
      <div><b>Mindfulness</b>Contact points<br>Breath as an anchor<br>One move at a time</div>
    </div>`;
  }
  function communityPreview() {
    return `<div class="wa">
      <div class="wa-head"><span class="av">${icon('users')}</span><span><b>Fear of Falling Toolkit Community</b><span>WhatsApp group · illustrative example</span></span></div>
      <div class="msg"><b>Climber A</b>First unannounced fall today. Peak was 70, down to 35 by the fourth one.</div>
      <div class="msg"><b>Climber B</b>Same step for me this week. Warming up on the snug rope first really helped.</div>
      <div class="msg me"><b>You</b>Anyone tried the mindfulness drill before lead falls?</div>
      <div class="wa-foot">The invitation link is shared with Toolkit members only.</div>
    </div>`;
  }
  function goalsPreview() {
    return `<div class="pv-illus">Illustrative example</div>
      <div class="goal-pv"><span>Your goal</span><b>Climb a 6c before my October trip</b>
      <span>Your identity</span><i>“I want to be the kind of climber who stays calm, commits to moves and enjoys the process.”</i></div>`;
  }
  function reflectPreview() {
    return `<div class="mini-list"><div>${icon('layers')}<span>Variations practised, logged with each session</span></div><div>${icon('list-ordered')}<span>A guided chapter for re-evaluating your ladder part way through</span></div><div>${icon('edit-3')}<span>A final reflection to plan how you’ll keep practising</span></div></div>`;
  }

  const FEATURES = {
    plan: {
      icon: 'calendar-days', title: 'Weekly Practice Planner', short: 'Plan when you’ll practise around the climbing and training you already do.',
      what: 'Plan when you’ll practise and fit your exercises around the climbing and training you already do. You choose the plan; the planner keeps it visible on your dashboard.',
      help: ['Mark the days you’ll practise, and morning or evening', 'Decide when in your session you’ll practise and for how long', 'Attaching practice to sessions you already have makes it easier to stay consistent'],
      preview: plannerPreview,
    },
    analytics: {
      icon: 'line-chart', title: 'Progress Analytics', short: 'A Progress Comparison page charting how fear has changed across your whole ladder.',
      what: 'Essentials lets you compare original and current ratings exercise by exercise. The Toolkit’s Progress Comparison page brings it together in one view.',
      help: ['A Fear Level Comparison chart of initial and current fear for every exercise on your ladder', 'Summary figures: average fear reduction, exercises improved and best improvement', 'Ladder Evolution and Training History side by side'],
      preview: analyticsPreview,
    },
    videos: {
      icon: 'play-circle', title: 'Video Library', short: '24 guided video lessons, including demonstrations of the fall practice exercises.',
      what: '24 step-by-step video lessons you can watch at home or at the wall, including demonstrations of the fall practice exercises.',
      help: ['See how each fall is set up, communicated and practised', 'Behavioural skills on video, such as the pre-climb check and belaying with intention', 'Know what to expect before you try each new step'],
      preview: videosPreview,
    },
    skills: {
      icon: 'brain', title: 'Psychological Strategies', short: 'Behavioural, cognitive and mindfulness skills for managing fear on the wall.',
      what: 'Exposure builds evidence. These strategies help you use it when it matters: working with anxious thoughts, steadying your attention and staying present mid-route.',
      help: ['Recognise fear-driven thoughts and write balanced, believable responses', 'Anchor attention with contact points, breath and one move at a time', 'Behavioural routines that reduce uncertainty before you leave the ground'],
      preview: skillsPreview,
    },
    community: {
      icon: 'message-circle', title: 'Climbers’ WhatsApp Community', short: 'A WhatsApp group of climbers working through the Toolkit.',
      what: 'Join a WhatsApp group of climbers working through the Toolkit to share experiences, ask questions and support one another.',
      help: ['Learning alongside others can make practice more motivating', 'Hear how others approached the same step', 'Ask questions about the exercises'],
      preview: communityPreview,
    },
    goals: {
      icon: 'target', title: 'Goal Setting', short: 'Connect fall practice to a climbing goal and the climber you want to become.',
      what: 'Structured exercises to set a SMART climbing goal, identify the qualities you want to develop and define the climber you want to be, so fear has a direction.',
      help: ['A clear reason to stay with discomfort', 'A simple question for hard moments: is this taking me closer to the climber I want to be?', 'Your goal and identity shown on your dashboard'],
      preview: goalsPreview,
    },
    reflection: {
      icon: 'clipboard-list', title: 'Advanced Reflective Tools', short: 'Log the variations you practise, plus guided re-evaluation and a final reflection.',
      what: 'Beyond the before, peak and after ratings you already record in Essentials, the Toolkit logs the variations you practise and guides you through re-evaluating your ladder and reflecting at the end.',
      help: ['Track variations so confidence carries over to real climbing', 'A dedicated chapter for re-evaluating your ladder at the right point', 'A final reflection on what helped and how you’ll keep practising'],
      preview: reflectPreview,
    },
  };

  /* ---------------------------------------------------------- */
  /* Diagrams                                                    */
  /* ---------------------------------------------------------- */
  function cycleSvg() {
    const node = (x, y, t, s, fill) => `<g><rect x="${x - 78}" y="${y - 30}" width="156" height="60" rx="16" fill="${fill}" stroke="#d4d4cd"/><text x="${x}" y="${y - 4}" text-anchor="middle" font-family="arboria, sans-serif" font-size="15" fill="#2e2e2e">${t}</text><text x="${x}" y="${y + 15}" text-anchor="middle" font-size="11.5" fill="#5f5f59">${s}</text></g>`;
    return `<svg viewBox="0 0 520 330" role="img" aria-label="Diagram: a trigger leads to a loop of thoughts, body sensations and behaviour, each feeding the others">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#4b7a6e"/></marker></defs>
      ${node(260, 36, 'Trigger', 'e.g. pumped above a clip', '#f7f7f4')}
      ${node(260, 130, 'Thoughts', '“What if…?”', '#e7e3ec')}
      ${node(118, 268, 'Body', 'tension, fast breathing', '#dde9e5')}
      ${node(402, 268, 'Behaviour', '“Take!”, down-climb', '#f4e7d6')}
      <!-- Arrows sit on top of the boxes and stop short of their edges, so no arrowhead is hidden. -->
      <path d="M260 71 L260 94" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)"/>
      <path d="M212 168 Q160 188 134 230" fill="none" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
      <path d="M308 168 Q360 188 386 230" fill="none" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
      <path d="M204 268 L316 268" stroke="#4b7a6e" stroke-width="2" marker-end="url(#ah)" marker-start="url(#ah)"/>
    </svg>`;
  }

  // The red line now starts at the escape point and only shows the drop, so it no longer overlaps the green curve.
  function curveSvg() {
    return `<svg viewBox="0 0 520 230" role="img" aria-label="Chart: fear over time. The green curve shows fear rising, peaking and then settling on its own when you stay in the situation. A red dashed line drops sharply from near the peak, showing the quick relief of escaping.">
      <line x1="40" y1="190" x2="500" y2="190" stroke="#d4d4cd"/><line x1="40" y1="20" x2="40" y2="190" stroke="#d4d4cd"/>
      <text x="16" y="110" font-size="11" fill="#84847c" transform="rotate(-90 16 110)" text-anchor="middle">Fear</text>
      <text x="490" y="210" font-size="11" fill="#84847c" text-anchor="end">Time</text>
      <path d="M40 170 C120 165 150 40 210 40 C280 40 330 150 490 165" fill="none" stroke="#4b7a6e" stroke-width="3"/>
      <path d="M186 46 C190 120 194 160 205 172" fill="none" stroke="#b6534b" stroke-width="2.5" stroke-dasharray="6 5"/>
      <circle cx="186" cy="46" r="4.5" fill="#b6534b"/>
      <text x="196" y="102" font-size="12" fill="#b6534b">Escape: quick relief,</text><text x="196" y="117" font-size="12" fill="#b6534b">fear stays the same</text>
      <text x="330" y="88" font-size="12" fill="#3a6056">Stay: fear peaks, then</text><text x="330" y="103" font-size="12" fill="#3a6056">settles on its own</text>
    </svg>`;
  }

  /* ---------------------------------------------------------- */
  /* Dashboard & chapters page                                   */
  /* ---------------------------------------------------------- */
  function viewDashboard() {
    const doneCount = CH.filter((c) => chDone(c.key)).length;
    const pct = Math.round((doneCount / CH.length) * 100);
    const na = nextAction();
    const cur = currentStep();
    const last = sortedSessions()[0];
    const idx = cur ? state.ladder.indexOf(cur) + 1 : 0;
    const after = last && hasNum(last.after) ? last.after : null;

    return `<div class="wrap">
      <div class="page-head">
        <div><h1>Fear of Falling Essentials</h1><p>Your starting point for structured fall practice.</p></div>
        <a class="btn btn-primary" href="${na.href}">${icon(na.icon)}${na.label}</a>
      </div>

      ${ui.justSaved ? nudge('after-session', { icon: 'line-chart', feature: 'analytics', title: 'Great work completing your practice', body: 'The full Toolkit helps you analyse your progress, identify patterns and plan your next session, with a Progress Comparison page that charts your whole ladder in one view.' }) : ''}

      <div class="card">
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Course progress"><span style="width:${pct}%"></span></div>
        <div class="progress-meta"><span class="lbl">Course progress</span><span class="pct">${pct}% complete</span></div>
        <p class="small muted" style="margin:6px 0 0">${doneCount} of ${CH.length} chapters complete</p>
      </div>

      <div class="grid-2 section" style="margin-top:20px">
        <div class="card">
          <div class="card-label">${icon('flag')}Next planned exercise${cur ? `<span class="right">Step ${idx} of ${state.ladder.length}</span>` : ''}</div>
          ${cur ? `<div style="display:flex;gap:14px;align-items:flex-start;justify-content:space-between">
              <div><h3>${esc(cur.title)}</h3><p class="small muted" style="margin:0">${esc(cur.desc || '')}</p></div>${badge(cur.rating)}</div>
              <div class="btn-row" style="margin-top:18px">${accessible('m6')
                ? `<a class="btn btn-primary" href="#/practice">${icon('activity')}${state.draft ? 'Resume session' : 'Start fall practice'}</a><a class="btn btn-text" href="#/ladder">Edit ladder</a>`
                : `<span class="tag">${icon('lock')}Fall practice unlocks after Module 5</span>`}</div>`
            : state.ladder.length ? `<h3>Every step completed</h3><p class="small muted">Keep using your top steps as regular practice, or add a new step.</p><a class="btn btn-ghost" href="#/ladder">Open exposure ladder</a>`
            : `<h3>No exercises yet</h3><p class="small muted">You’ll build your exposure ladder in Module 4, and your first exercise will appear here.</p>`}
        </div>
        <div class="card">
          <div class="card-label">${icon('history')}Most recent session${last ? `<span class="right">${fmtShort(last.date)}</span>` : ''}</div>
          ${last ? `<h3>${esc(last.exTitle)}</h3>
            <div class="stat-row" style="margin-top:12px">
              <div class="stat"><div class="k">Before</div><div class="v">${last.before}</div></div>
              <div class="stat"><div class="k">Peak</div><div class="v">${last.peak}</div></div>
              <div class="stat"><div class="k">After</div><div class="v">${after === null ? '<small>Not recorded</small>' : after}</div></div>
              <div class="stat"><div class="k">Falls</div><div class="v">${last.reps}</div></div>
            </div>
            <div class="btn-row" style="margin-top:16px">${last.reflected ? `<span class="tag pine">${icon('check')}Reflected</span>` : `<a class="btn btn-ghost" href="#/session/${last.id}">${icon('edit-3')}Add reflection</a>`}<a class="btn btn-text" href="#/log">View practice log</a></div>`
            : `<h3>Nothing logged yet</h3><p class="small muted">After your first fall practice session, your ratings will show here.</p>`}
        </div>
      </div>

      <div class="section">
        <div class="page-head" style="margin-bottom:14px"><h2 class="section-title" style="margin:0">Course contents</h2>
          <a class="btn btn-text" href="#/log">${icon('history')}My practice log</a></div>
        ${chapterRows()}
      </div>

      <div class="section">
        <div class="page-head" style="margin-bottom:14px">
          <div><span class="eyebrow">Explore the Full Toolkit</span><h2 class="section-title" style="margin:0">More guidance and structure when you want it</h2></div>
          <a class="btn btn-text" href="#/toolkit">Compare Essentials and the Toolkit ${icon('arrow-right')}</a>
        </div>
        <div class="feature-grid">${['videos', 'plan', 'analytics', 'skills', 'community'].map(featureCard).join('')}</div>
        <p class="price-note" style="margin-top:14px">${PRICE_NOTE}</p>
      </div>
      ${footer()}
    </div>`;
  }

  function viewChapters() {
    return `<div class="read">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">Course overview</span>
      <h1 style="font-size:clamp(1.7rem,4.5vw,2.2rem)">Chapters</h1>
      <p class="muted">Work through the Foundations at home, at your own pace. Then take the Practical Application chapters to the wall.</p>
      <div style="margin-top:22px">${chapterRows()}</div>
      <a class="tile" href="#/log" style="margin-top:22px"><span class="strip">${icon('history')}</span><span class="body"><span class="meta">Available any time</span><h3>My Practice Log</h3><p>Your sessions, ratings and reflections.</p></span><span class="chev">${icon('chevron-right')}</span></a>
      ${footer()}
    </div>`;
  }

  function viewGate(ch) {
    if (ch && acked()) {
      const open = nextOpen();
      return `<div class="read">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="card gate">
        <div class="gi">${icon('lock')}</div>
        <h2 style="font-size:1.35rem">${chLabel(ch)} is locked</h2>
        <p class="muted">Chapters unlock in order. Complete ${chLabel(open)}: ${open.title} to keep going.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#/${open.route}">Go to ${chLabel(open)}</a><a class="btn btn-ghost" href="#/chapters">All chapters</a></div>
      </div>
    </div>`;
    }
    return `<div class="read">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="card gate">
        <div class="gi">${icon('shield-check')}</div>
        <h2 style="font-size:1.35rem">Start with the introduction</h2>
        <p class="muted">Before you continue, please read the introduction and confirm you’ve understood the disclaimer and the safety and responsibility guidance.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#/intro">Go to the introduction</a><a class="btn btn-ghost" href="#/safety">Safety guidance</a></div>
      </div>
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Introduction                                                */
  /* ---------------------------------------------------------- */
  function viewIntro() {
    const a = state.ack;
    const video = INTRO_VIDEO_ID
      ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?rel=0" title="The Fear Of Falling Toolkit - Introduction" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
      : `<div class="video video-placeholder">[INTRODUCTION VIDEO URL]: placeholder, video not yet supplied</div>`;
    return `<div class="read lesson">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">Introduction</span>
      <h1>Welcome to Fear of Falling Essentials</h1>
      ${video}
      <p class="small muted" style="margin-top:-4px">${icon('info', 'inline')} This welcome video was recorded for the full Fear of Falling Toolkit, so it mentions a few things that aren’t part of Essentials, such as the video lessons and the WhatsApp community. The approach it introduces is the same one you’ll use here.</p>

      <p>Thank you for choosing to take part in this course. We’re really pleased to have you here and excited to support you in building confidence and freedom in your climbing.</p>

      <h2>Aims of the course</h2>
      <p>This course has two main aims:</p>
      <ul><li>To reduce your fear of falling.</li><li>To improve your confidence when climbing at your limit.</li></ul>
      <p>By the end of the programme, you should feel more able to take on new routes and challenges, without fear holding you back.</p>

      <h2 id="disclaimer">Disclaimer</h2>
      <p><strong>This course does not teach you how to climb.</strong></p>
      <p>All content in this course relates to indoor climbing and assumes that you and your belayer already know how to lead climb safely, including belaying safely, clipping correctly, managing your rope effectively, and identifying and managing risks.</p>

      <h2 id="safety">Safety and responsibility</h2>
      <p>This programme is designed to support the psychological side of climbing, particularly confidence and fear of falling. It is not a substitute for in-person, professional climbing instruction.</p>
      <p>All practical exercises should only be carried out:</p>
      <ul>
        <li>In line with the policies and safety guidance of your climbing wall.</li>
        <li>With appropriate equipment that is correctly fitted and in good condition.</li>
        <li>With a competent and attentive belayer using the technique recommended by the manufacturer of the belay device.</li>
        <li>On a suitable route in an appropriate area of the wall.</li>
      </ul>
      <div class="callout safety"><p class="callout-title">${icon('shield-check')}If in doubt, don’t</p>
        <p>Do not practise falling exercises if you are unsure about any aspect of your setup, communication or technique. When in doubt, seek guidance from a qualified instructor.</p></div>
      <p>You are responsible for your own safety and decisions. Stop any exercise if you feel unwell, injured, overly fatigued or unsafe. If fear becomes overwhelming, return to an easier step.</p>
      <p>If you have a history of significant trauma, panic or other mental health difficulties that may be triggered by exposure work, consider completing this programme with support from a qualified professional.</p>

      <h2>Course structure</h2>
      <h3>Part 1: Foundations</h3>
      <p>You’ll begin with the theoretical chapters, designed to help you understand fear and prepare for the practical work. We recommend completing these chapters at home, at your own pace, with time to reflect.</p>
      <h3>Part 2: Practical Application</h3>
      <p>You’ll then move into the practical phase, applying what you have learned through structured fall practice at your climbing wall.</p>

      <h2>A final note before you begin</h2>
      <p>Progress is rarely linear. Some days will feel easier than others, and that’s completely normal.</p>
      <p>What matters is consistency, patience and a willingness to stay engaged with the process.</p>
      <p>This course isn’t about being fearless or forcing fear away. It’s about learning, practising and gradually building trust in yourself.</p>

      <div class="card" style="margin-top:28px">
        <div class="card-label">${icon('shield-check')}Before you continue</div>
        <label class="check ${a.disclaimer ? 'on' : ''}"><input type="checkbox" ${a.disclaimer ? 'checked' : ''} data-action="ack" data-key="disclaimer"><span>I have read and understood the Disclaimer.</span></label>
        <label class="check ${a.safety ? 'on' : ''}"><input type="checkbox" ${a.safety ? 'checked' : ''} data-action="ack" data-key="safety"><span>I have read and understood the Safety and Responsibility guidance.</span></label>
      </div>
      ${chapterFoot('intro', acked()
        ? `<a class="btn btn-primary" href="#/fear">Continue to Module 1${icon('arrow-right')}</a>`
        : `<button class="btn btn-primary" disabled>Continue to Module 1${icon('arrow-right')}</button><span class="small muted">Tick both boxes to continue.</span>`)}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 1: What Is Fear?                                     */
  /* ---------------------------------------------------------- */
  function viewFear() {
    return `<div class="read lesson">
      ${chapterHead('m1')}
      <h2>Fear is a protective system</h2>
      <p>Fear is a natural survival system that has existed throughout human history. It evolved to keep us alive when facing danger. When early humans encountered a threat, such as a predator, the body and mind rapidly activated the <strong>fight-or-flight response</strong>.</p>
      <p>The heart beats faster to pump blood to the muscles, breathing speeds up to increase oxygen, focus narrows onto the threat, and sweating helps regulate body temperature.</p>
      <p>At the same time, the mind quickly runs through possible future scenarios: <em>Should I run? Hide? Fight?</em> This rapid mental simulation helps us become aware of risks and decide how best to stay safe.</p>
      <p>The feeling of fear itself is uncomfortable, which pushes us to act, whether that means escaping, defending ourselves or finding safety.</p>
      <p>In this way, fear functions as a powerful system designed to protect and preserve our lives.</p>

      <h2>What does fear look like in climbing?</h2>
      <p>The same system operates when we climb, affecting our thoughts, body sensations and behaviour.</p>
      <figure class="diagram">${cycleSvg()}<figcaption>A trigger sets off a loop of thoughts, body sensations and behaviour, each feeding the others.</figcaption></figure>
      <h3>Triggers</h3>
      <p>Fear can be triggered by situations that precede a possible fall or perceived danger. Examples include trying a limit route, throwing for a hold, being pumped, climbing in a new area of the wall, or climbing with someone new.</p>
      <h3>Thoughts</h3>
      <p>Fearful thoughts scan for danger and predict outcomes, often using “what if” scenarios:</p>
      <ul><li><em>“Did I tie my knot correctly?”</em></li><li><em>“Is my belayer paying attention?”</em></li><li><em>“What if I fall and swing into the wall?”</em></li></ul>
      <p>Thoughts can support safety, but when repetitive, they can pull our attention away from efficient movement and enjoyment of the climb.</p>
      <h3>Body</h3>
      <p>Our body changes in response to perceived danger. We may notice an increased heart rate, faster and shallower breathing, muscle tension, sweating and narrowed vision.</p>
      <p>Tension increases over-gripping and fatigue, shallow breathing limits recovery, sweating reduces friction, and narrowed vision reduces awareness of the route.</p>
      <h3>Behaviour</h3>
      <p>Fear also changes how we behave.</p>
      <ul>
        <li><strong>Fight:</strong> a fight response may involve forced effort, rushing, shaking or panic clipping.</li>
        <li><strong>Flight:</strong> a flight response may involve avoiding hard routes, down-climbing, refusing to commit or asking to take.</li>
      </ul>
      <p>While fight can look like bravery, the goal is to learn to climb well with fear, not overpower it.</p>

      <h2>Why do we feel fear of falling in climbing?</h2>
      <p>Fear of falling often develops through a <strong>lack of safe exposure</strong>.</p>
      <p>If you rarely experience controlled falls (feeling the rope catch, trusting the belayer and learning what is and isn’t safe), your brain has little evidence that falling can be manageable.</p>
      <p>In that situation, avoidance becomes the default strategy. You down-climb, shout “take” early or avoid committing above your last clip.</p>
      <p>Avoidance reduces anxiety in the short term, but it teaches your brain that avoidance is <strong>necessary</strong>.</p>
      <p>Over time, the fear becomes more established.</p>

      <div class="key-points"><h3>Key takeaways</h3><ul>
        <li>Fear is a normal, protective response.</li>
        <li>In climbing, it shows up in your thoughts, body and behaviour.</li>
        <li>Fear of falling often develops through a lack of safe exposure.</li>
        <li>Avoidance reduces fear in the short term but strengthens it over time.</li>
      </ul></div>
      ${readFoot('m1')}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 2: Getting to Know Your Fear                         */
  /* ---------------------------------------------------------- */
  function viewKnow() {
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
    const hasAny = m.triggers.length || m.thoughts.length || m.body.length || m.behaviours.length;

    return `<div class="read lesson">
      ${chapterHead('m2')}
      <h2>Fear shows up in patterns</h2>
      <p>Although fear can feel sudden, it usually follows a pattern. In climbing, fear shows up across four linked areas:</p>
      <div class="pattern">
        <div class="head"><span>Area</span><span>What it means</span><span>Example</span></div>
        <div><b>Triggers</b><span>When and where the fear appears.</span><span class="ex">Being pumped.</span></div>
        <div><b>Thoughts</b><span>What your mind predicts or warns you about.</span><span class="ex">“What if my belayer doesn’t catch me?”</span></div>
        <div><b>Body sensations</b><span>How your body responds.</span><span class="ex">Over-gripping, narrowed focus or sweating.</span></div>
        <div><b>Behaviour</b><span>What you do to reduce fear.</span><span class="ex">Asking to take.</span></div>
      </div>
      <p>Learning to notice these patterns doesn’t remove fear, but it makes fear more understandable and workable.</p>
      <p><strong>What you can notice, you can work with.</strong></p>

      <h2 id="map">Practical exercise: mapping your fear</h2>
      <p>Think of a time when you were scared of falling. Break that experience down into the four areas above: triggers, thoughts, body sensations and behaviour. Pick anything that fits, and add your own.</p>
      ${group('triggers')}${group('thoughts')}${group('body')}${group('behaviours')}

      <div class="card" style="margin-top:14px">
        <label class="field"><span>Anything else you noticed?</span><small>Optional. For example, how quickly the fear eased once you were lowered off.</small>
        <textarea class="input" data-bind="m1.extra" placeholder="Write as much or as little as you like">${esc(m.extra)}</textarea></label>
      </div>

      ${hasAny ? `<div class="callout"><p class="callout-title">Your fear pattern</p>
        <p>When ${list(m.triggers)}, my mind says ${m.thoughts.length ? m.thoughts.map((t) => `“${esc(t)}”`).join(' or ') : '…'}${m.body.length ? `, my body responds with ${list(m.body)}` : ''}, and I tend towards ${list(m.behaviours)}.</p>
        <p>Your triggers are useful material: they’ll help you choose and order the steps on your exposure ladder.</p></div>` : ''}

      <div class="key-points"><h3>Key takeaways</h3><ul>
        <li>Fear follows patterns, even when it feels overwhelming.</li>
        <li>Mapping fear makes it clearer and more predictable.</li>
        <li>Understanding fear comes before changing it.</li>
      </ul></div>
      ${chapterFoot('m2', m.done
        ? `<span class="tag pine">${icon('check')}Fear map saved</span><button class="btn btn-ghost" data-action="save-map">${icon('check')}Save changes</button><a class="btn btn-primary" href="#/good-practice">Next: Module 3${icon('arrow-right')}</a>`
        : `<button class="btn btn-primary" data-action="save-map" ${hasAny ? '' : 'disabled'}>${icon('check')}Save my fear map and continue</button>${hasAny ? '' : '<span class="small muted">Choose at least one answer to continue.</span>'}`)}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 3: What Makes Good Fall Practice?                    */
  /* ---------------------------------------------------------- */
  function viewGoodPractice() {
    return `<div class="read lesson">
      ${chapterHead('m3')}
      <p>Fear of falling doesn’t reduce by waiting to feel confident. It changes through experience.</p>
      <p>Exposure therapy allows your nervous system to learn through experience that situations which feel dangerous can, in fact, be safe and manageable. This chapter explains the core idea underpinning the rest of the course.</p>

      <h2>Fear as a bell-shaped curve</h2>
      <p>It can be helpful to think about fear as a bell-shaped curve. Like all emotions, fear rises, peaks and eventually falls.</p>
      <figure class="diagram">${curveSvg()}<figcaption>Staying in the situation lets the wave of fear come down by itself (green). Escaping brings a quick drop in fear (red), but you miss the chance to learn the fall was manageable.</figcaption></figure>
      <p>When we feel fear, it is uncomfortable, so we often try to reduce it by avoiding the situation, for example by asking our belayer to take or deciding not to commit to a move.</p>
      <p>While avoidance reduces fear in the moment, it prevents us from experiencing what happens when we remain in the situation long enough for fear to settle. Instead, we reinforce the belief that the situation is dangerous and that avoidance is the only way to feel better.</p>
      <p>The goal of this course is to help you remain in situations that feel scary long enough for that wave of fear to come down on its own.</p>
      <div class="callout safety"><p class="callout-title">${icon('shield-check')}Scary is not the same as unsafe</p>
        <p>Staying with fear only ever applies to a setup that is safe. If something about the system, your belayer or the communication doesn’t feel right, or you feel unwell, injured or overly fatigued, stop. That is good judgement, not avoidance. <a href="#/safety">Safety guidance</a></p></div>

      <h2>The four rules of exposure</h2>
      <div class="rules">
        <div><b>Graded</b><span>Break practice into small, manageable steps so you do not become overwhelmed by your first exercise.</span></div>
        <div><b>Prolonged</b><span>Stay with the exercise long enough for fear to reduce. Ending practice while still very frightened can leave that feeling as your main memory of the experience. Allowing fear to settle gives you the opportunity to finish with a different impression: “That wasn’t so bad.”</span></div>
        <div><b>Repeated</b><span>Repeat the exercises so that the learning becomes established over time.</span></div>
        <div><b>Without distractions</b><span>Relying on distractions, such as music, specifically to reduce fear can become another form of avoidance that prevents full learning.</span></div>
      </div>

      <div class="key-points"><h3>Key takeaways</h3><ul>
        <li>Fear rises and falls like a wave.</li>
        <li>Avoidance shortens fear in the moment but strengthens it over time.</li>
        <li>Safe exposure lets fear rise, peak and settle on its own.</li>
        <li>Graded, prolonged, repeated practice without distractions makes exposure work.</li>
      </ul></div>
      ${readFoot('m3')}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 4: Creating Your Exposure Ladder                     */
  /* ---------------------------------------------------------- */
  function viewLadder() {
    const cur = currentStep();
    const inLadder = new Set(state.ladder.map((x) => x.key).filter(Boolean));
    const rung = (x, i) => {
      const n = sessionsFor(x.id).length;
      const isCur = x === cur;
      const editing = ui.editing === x.id;
      return `<li class="rung ${x.done ? 'is-done' : ''} ${isCur ? 'is-current' : ''}">
        <span class="num">${x.done ? icon('check') : i + 1}</span>
        <div style="min-width:0">
          <div class="tags">${isCur ? `<span class="tag pine">${icon('flag')}Current step</span>` : ''}${exLocked(x) ? `<span class="tag">${icon('lock')}Locked</span>` : ''}${x.custom ? '<span class="tag">Your own</span>' : ''}${hasNum(x.original) ? `<span class="tag" title="Saved ${x.originalDate ? fmtDate(x.originalDate) : ''}">Original rating ${x.original}</span>` : ''}${n ? `<span class="tag">${plural(n, 'session')}</span>` : ''}</div>
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
    const unsaved = state.ladder.some((x) => x.original === undefined);

    return `<div class="wrap">
      <div class="read lesson" style="margin:0 auto">
        ${chapterHead('m4')}
        <p>An exposure ladder serves two purposes during this course. It helps us maintain motivation by seeing progress over time, and it breaks fall practice into small steps so we do not become overwhelmed.</p>
        <h2>What is an exposure ladder?</h2>
        <p>An exposure ladder is a series of different types of fall, ordered from those that create only mild fear to those that feel very challenging.</p>
        <p>Instead of confronting fear all at once, you approach it step by step, starting where fear is present but manageable and gradually working upwards.</p>
        <p>This allows your nervous system to learn safely and consistently.</p>
        <h2>Supporting motivation</h2>
        <p>The exposure ladder provides a clear direction by showing where you are now and where you are working towards. As you move through the steps, you can see yourself getting closer to your goals.</p>
        <p>It also allows you to look back and recognise how far you have already come. Each completed step provides evidence of progress, reinforcing confidence and motivation.</p>
        <p>Seeing these changes over time can build trust in the process and encourage you to keep engaging with the steps ahead.</p>
        <h2>Avoiding overwhelm</h2>
        <p>A common mistake is to start with falls that are too big too soon. When fear feels too intense, it can be difficult to stay in the situation long enough for it to settle.</p>
        <p>People may then stop early, leaving them with a negative memory that reinforces fear rather than reducing it.</p>
        <p>Breaking practice into smaller, manageable steps helps prevent this. Each step should feel challenging but achievable.</p>
        <p>Throughout the course, you will revisit and adjust your exposure ladder so you can see how your progress develops.</p>
        <h2 id="build">Practical exercise: build your exposure ladder</h2>
        <p>Rank the climbing situations from 0 to 100, based on how much fear you expect each one to bring up. There’s no correct number, only what feels true for you.</p>
        <div class="scale-legend">${[[0, 'Zero fear'], [25, 'Mildly fearful'], [50, 'Moderately'], [75, 'Very fearful'], [100, 'Won’t attempt']].map(([v, t]) => `<div style="--c:${rateColor(v)}"><b>${v}</b>${t}</div>`).join('')}</div>
        <details class="disclose" style="margin-top:16px">
          <summary>${icon('info')}Choosing a starting point${icon('chevron-down', 'chev')}</summary>
          <div class="dbody"><ul>
            <li>Start where fear is present but manageable: an exercise you could stay with until the fear starts to settle. For many climbers that’s somewhere around 20–40, but go with what feels workable.</li>
            <li>If everything feels high, add an easier step of your own below it, such as a top rope fall from just a few metres up.</li>
            <li>Easy-looking steps still matter: they build trust in your belayer and the system.</li>
            <li>Fear changes day to day. On a hard day, dropping down a step is part of the process.</li>
          </ul></div>
        </details>
      </div>

      <div class="layout-side section" style="margin-top:28px">
        <div>
          <div class="page-head" style="margin-bottom:12px">
            <h2 class="section-title" style="margin:0">My exposure ladder</h2>
            ${state.ladder.length > 1 ? `<button class="btn btn-ghost" data-action="sort" style="min-height:40px;padding:8px 14px;font-size:14px">${icon('arrow-up-down')}Sort by rating</button>` : ''}
          </div>
          ${state.ladder.length
            ? `<ol class="ladder">${state.ladder.map(rung).join('')}</ol>
               ${outOfOrder ? `<p class="small muted" style="margin-top:10px">${icon('info', 'inline')} Some steps are rated higher than the one after them. That’s fine if it’s deliberate; otherwise use <em>Sort by rating</em>.</p>` : ''}`
            : `<div class="ladder-empty">${icon('list-ordered')}<p style="margin:8px 0 0">Add exercises from the list to start building your ladder.</p></div>`}
          <div class="btn-row" style="margin-top:18px">
            <button class="btn btn-primary" data-action="save-ladder" ${state.ladder.length ? '' : 'disabled'}>${icon('check')}${state.ladderSaved ? 'Save changes' : 'Save my exposure ladder'}</button>
            ${state.ladderSaved ? `<a class="btn btn-ghost" href="#/variety">Next: Module 5${icon('arrow-right')}</a>` : ''}
          </div>
          ${unsaved && state.ladder.length ? `<p class="small muted" style="margin-top:10px">Your first saved rating for each exercise becomes its original rating, which you’ll compare against in Module 7.</p>` : ''}
          ${state.ladderSaved ? nudge('after-hierarchy', { icon: 'calendar-days', feature: 'plan', title: 'Your exposure ladder is ready', body: 'Want help planning when you’ll practise? The full Toolkit’s Weekly Practice Planner helps you fit fall practice around the climbing and training you already do.' }) : ''}
        </div>
        <aside class="sticky-side">
          <div class="card">
            <div class="card-label">${icon('plus')}Add exercises</div>
            <div>${LIBRARY.map((l) => `<div class="lib-item"><div class="tx"><b>${l.title}</b><span>${l.desc}</span></div>
              ${inLadder.has(l.key) ? `<span class="tag pine">${icon('check')}Added</span>` : `<button class="btn btn-ghost" data-action="add-lib" data-key="${l.key}">${icon('plus')}Add</button>`}</div>`).join('')}</div>
            <div style="border-top:1px solid var(--border-subtle);margin-top:6px;padding-top:16px">
              <label class="field"><span>Add your own</span><small>For example, a fall while reaching for a hold, or on an overhang.</small>
              <input class="input" id="custom-title" placeholder="Exercise name" data-enter="add-custom"></label>
              <button class="btn btn-ghost btn-block" style="margin-top:10px" data-action="add-custom">${icon('plus')}Add to ladder</button>
            </div>
          </div>
        </aside>
      </div>
      <div class="read lesson" style="margin:0 auto">
        <div class="key-points"><h3>Key takeaways</h3><ul>
          <li>An exposure ladder breaks fall practice down from easier to harder steps.</li>
          <li>Seeing progress on the ladder supports motivation and confidence.</li>
          <li>Small, manageable steps help you avoid overwhelm.</li>
        </ul></div>
        ${chapterFoot('m4', '')}
      </div>
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 5: The Importance of Variety                         */
  /* ---------------------------------------------------------- */
  function viewVariety() {
    return `<div class="read lesson">
      ${chapterHead('m5')}
      <p>Once you’ve started working up your ladder, it’s natural to settle into the same routine: the same route, the same spot on the wall, the same kind of fall. That repetition is useful at first. Over time, though, it can limit how far your confidence travels.</p>

      <h2>Why variety matters</h2>
      <p>Exposure is context-specific. What your nervous system learns is closely tied to the situation in which you learned it. If you only ever practise one type of fall, in one position, on one section of wall, you build strong evidence that <em>that particular fall</em> is manageable.</p>
      <p>But fear doesn’t usually show up in a neat, planned fall during normal climbing. It shows up when you’re pumped on a steep route, reaching for a hold you’re not sure you’ll stick, or high above your last clip on unfamiliar ground. If your practice never resembles those moments, the confidence you’ve built may not carry over to them, and practice can also start to feel repetitive.</p>
      <div class="callout"><p class="callout-title">The central idea</p>
        <p>Practise across relevant situations so that the experience you gain reflects the contexts in which you want to climb with greater confidence.</p></div>

      <h2>What you can vary</h2>
      <h3>Walls and routes</h3>
      <p>Practise on different suitable walls and routes: slabs, vertical walls, overhangs and arêtes, and a range of grades. Each one feels different to fall on, so each gives your brain new evidence.</p>
      <h3>Body positions</h3>
      <p>Vary where you are when you fall: slightly left or right of the bolt rather than directly below it, facing the wall at different angles, and at different heights on the wall.</p>
      <h3>How the fall begins</h3>
      <p>It’s appropriate to begin with static, deliberate falls where you choose the moment you let go. As your confidence grows, gradually include falls that look more like real climbing:</p>
      <ul>
        <li>Falling while moving, rather than from a still position.</li>
        <li>Falling while reaching or throwing for a hold.</li>
      </ul>

      <h2>Adding variety gradually</h2>
      <p>Variety follows the same graded approach as the rest of the course. It is about broadening your experience, not making falls bigger or riskier.</p>
      <ul>
        <li><strong>Change one thing at a time.</strong> Introduce a new variation on a step that already feels manageable, rather than combining a new step with a new variation.</li>
        <li><strong>Expect a little more fear.</strong> A new variation can bring fear back up, even on a step you’ve completed. That’s normal, and it’s exactly why variety is useful.</li>
        <li><strong>Drop back if you need to.</strong> If a variation feels like too much, return to a version you’re comfortable with and build back up.</li>
        <li><strong>Stay within your competence.</strong> Only choose walls, routes and positions that are suitable for falling, within your technical ability and in line with your wall’s guidance. Check the fall zone and keep your legs clear of the rope.</li>
      </ul>
      <p>For example, once a top rope fall with a little slack feels manageable on a vertical wall, you might try the same fall slightly to one side of the line, then on a gently overhanging route, then while moving between holds.</p>
      <p class="small muted">${icon('info', 'inline')} Essentials doesn’t track variations separately. If it helps, mention what you varied in your session notes.</p>

      <div class="key-points"><h3>Key takeaways</h3><ul>
        <li>Confidence built in one context doesn’t automatically transfer to others.</li>
        <li>Vary walls and routes, body positions and how the fall begins.</li>
        <li>Add variety gradually, within your competence and the safety guidance.</li>
      </ul></div>
      ${readFoot('m5')}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 6: Fall Practice                                     */
  /* ---------------------------------------------------------- */
  const STEPS = ['Choose', 'Safety check', 'Before', 'Peak', 'Falls and after', 'Reflect'];

  function verdictFor(r, exId, n) {
    const ex = getEx(exId);
    const idx = ex ? state.ladder.indexOf(ex) : -1;
    const next = idx > -1 ? state.ladder.slice(idx + 1).find((x) => !x.done) : null;
    if (r.safe === 'no' || r.safe === 'unsure') return { cls: 'warn', icon: 'shield-alert', title: 'Pause and sort the setup first', text: 'Something didn’t feel right with the setup or communication. Talk it through with your belayer, and if you’re unsure about any part of the system, get guidance from a qualified instructor before practising this again.', rec: 'adjust' };
    if (!r.safe || !r.settled || !r.confidence) return null;
    if (r.settled === 'no') return { cls: 'hold', icon: 'rotate-ccw', title: 'Repeat it, or make it a little easier', text: 'Staying with the fear until it starts to settle is where the learning happens. Next time, give yourself longer between falls, or try an easier variation (lower on the wall, less slack) and build back up.', rec: 'adjust' };
    if (r.confidence < 3) return { cls: 'hold', icon: 'repeat', title: 'Repeat this exercise next session', text: 'You’ve done the hard part. Repeating it builds the evidence your brain needs, until you feel you could do it again without much hesitation.', rec: 'repeat' };
    if (n < 2) return { cls: 'hold', icon: 'repeat', title: 'Repeat it once or twice more', text: 'This went well. Confidence sticks through repetition, so repeat this step in your next session to consolidate it before you move up.', rec: 'repeat' };
    return { cls: '', icon: 'trending-up', title: 'You’re ready to progress', text: `You practised safely, stayed with the fear and feel confident repeating it. You don’t need to feel zero fear to move on. Use this step as your warm-up next time${next ? `, then try <strong>${esc(next.title)}</strong>` : ''}.`, rec: 'progress' };
  }

  // Shared by the practice wizard (draft) and the session page (saved session).
  // The three questions are optional. They open by default only for someone's first session,
  // or when there are answers to show; otherwise they sit in a drop-down.
  function reflectionForm(r, { bindPrefix, setAction, setId, exId, n, first }) {
    const conf = [[1, 'Not yet'], [2, 'A little'], [3, 'Fairly'], [4, 'Very']];
    const seg = (field, opts) => `<div class="seg" role="group">${opts.map(([val, label]) => `<button aria-pressed="${r[field] === val}" data-action="${setAction}" data-id="${setId || ''}" data-field="${field}" data-val="${val}">${label}</button>`).join('')}</div>`;
    const v = verdictFor(r, exId, n);
    const answered = !!(r.expected || r.happened || r.learned);
    return `<details class="disclose reflect" ${first || answered ? 'open' : ''}>
        <summary>${icon('edit-3')}Reflection questions<span class="tag" style="margin-left:4px">Optional</span>${icon('chevron-down', 'chev')}</summary>
        <div class="dbody"><div class="stack">
          ${first ? '<p class="small muted" style="margin:0">These are optional, but they\u2019re especially useful after your first session. After this, you\u2019ll find them here in a drop-down.</p>' : ''}
          <label class="field"><span>What did you expect would happen?</span><textarea class="input" data-bind="${bindPrefix}expected" placeholder="e.g. I thought I\u2019d swing into the wall, or freeze and not let go">${esc(r.expected)}</textarea></label>
          <label class="field"><span>What actually happened?</span><textarea class="input" data-bind="${bindPrefix}happened" placeholder="e.g. The catch was soft. My heart raced on the first fall, then less each time">${esc(r.happened)}</textarea></label>
          <label class="field"><span>What did you learn?</span><textarea class="input" data-bind="${bindPrefix}learned" placeholder="e.g. My belayer is paying attention, and the fear passes if I stay with it">${esc(r.learned)}</textarea></label>
        </div></div>
      </details>
      <div class="lesson"><h2>What next?</h2>
        <p>Decide based on safety, learning, confidence and consistency. You don’t need to hit a particular fear score to move on.</p></div>
      <div class="card">
        <div class="decide">
          <div class="decide-q"><p>Did the setup and communication feel safe throughout?</p>${seg('safe', [['yes', 'Yes'], ['unsure', 'Unsure'], ['no', 'No']])}</div>
          <div class="decide-q"><p>Did you stay with it long enough to notice the fear start to settle?</p>${seg('settled', [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']])}</div>
          <div class="decide-q"><p>How confident do you feel about repeating this exercise?</p>${seg('confidence', conf)}</div>
          <div class="decide-q"><p>Sessions on this exercise, including this one</p><span class="tag">${n}</span></div>
        </div>
        ${v ? `<div class="verdict ${v.cls}"><b>${icon(v.icon)}${v.title}</b><p>${v.text}</p></div>` : '<p class="small muted" style="margin:10px 0 0">Answer the questions above for a suggestion.</p>'}
        <div class="field" style="margin-top:18px"><span>Your decision</span></div>
        <div class="choice-row">
          ${[['repeat', 'repeat', 'Repeat', 'Same exercise next session'], ['adjust', 'sliders-horizontal', 'Adjust', 'Make it a little easier or vary it'], ['progress', 'check-circle-2', 'Mark complete', 'Move up to the next step']].map(([k, ic, t, d]) => `<button aria-pressed="${r.decision === k}" data-action="${setAction}" data-id="${setId || ''}" data-field="decision" data-val="${k}"><b>${icon(ic)}${t}${v && v.rec === k ? ' <span class="tag pine" style="margin-left:auto">Suggested</span>' : ''}</b><span>${d}</span></button>`).join('')}
        </div>
      </div>`;
  }

  function viewPractice() {
    if (!state.ladder.length) {
      return `<div class="read lesson">${chapterHead('m6')}
        <div class="card" style="margin-top:20px"><h3>First, build your exposure ladder</h3><p class="muted">Fall practice works through the exercises on your ladder, so you’ll need at least one step first.</p>
        <a class="btn btn-primary" href="#/ladder">${icon('list-ordered')}Go to Module 4</a></div>${chapterFoot('m6', '')}</div>`;
    }
    if (!state.draft) return viewPracticeIntro();
    const d = state.draft;
    const ex = getEx(d.exId);
    let body = '';
    let canNext = true;

    if (d.step === 0) {
      const warm = lastDone();
      body = `<h2 style="font-size:1.45rem">Which exercise are you working on?</h2>
        ${warm ? `<p class="muted small">${icon('info', 'inline')} Tip: warm up with the last step you completed (${esc(warm.title)}) before your working step.</p>` : ''}
        <div class="choose" role="radiogroup" aria-label="Exercise">${state.ladder.map((x, i) => { const lk = exLocked(x); return `<label class="${d.exId === x.id ? 'sel' : ''}${lk ? ' locked' : ''}">
          <input type="radio" name="ex" value="${x.id}" ${d.exId === x.id ? 'checked' : ''} ${lk ? 'disabled data-locked="1"' : ''} data-action="pick-ex" data-id="${x.id}">
          <span><span class="t">${i + 1}. ${esc(x.title)}</span><span class="s">${lk ? `<span class="tag">${icon('lock')}Locked</span>` : ''}${x === currentStep() ? '<span class="tag pine">Current step</span>' : ''}${x.done ? '<span class="tag">Completed</span>' : ''}${sessionsFor(x.id).length ? `<span>${plural(sessionsFor(x.id).length, 'previous session')}</span>` : ''}</span></span>
          ${badge(x.rating)}</label>`; }).join('')}</div>
        <p class="small muted" style="margin-top:10px">${icon('lock', 'inline')} Later steps unlock as you mark each exercise complete.</p>
        ${ex ? lockedStrip('videos', 'Want a step-by-step video demonstration?', 'Access the full library of guided exercises in the Fear of Falling Toolkit.') : ''}`;
      canNext = !!ex && !exLocked(ex);
    } else if (d.step === 1) {
      body = `<h2 style="font-size:1.45rem">Safety check</h2>
        <p class="muted">Essentials supports the psychological side of falling. It doesn’t teach climbing, belaying or falling technique, so only practise if you already have the skills, equipment and supervision. Tick each item to continue.</p>
        ${SAFETY.map((s, i) => `<label class="check ${d.checks[i] ? 'on' : ''}"><input type="checkbox" ${d.checks[i] ? 'checked' : ''} data-action="check" data-i="${i}"><span>${s}</span></label>`).join('')}
        <div class="callout safety"><p class="callout-title">${icon('shield-check')}If in doubt, don’t</p><p>Don’t practise falls if you’re unsure about any part of your setup, communication or technique. Ask a qualified instructor. <a href="#/safety">Full safety guidance</a></p></div>`;
      canNext = SAFETY.every((_, i) => d.checks[i]);
    } else if (d.step === 2) {
      body = `<h2 style="font-size:1.45rem">${esc(ex ? ex.title : '')}</h2>
        <div class="card" style="margin-top:12px">${slider({ id: 'before', bind: 'draft.before', value: d.before, label: 'Before: how fearful do you feel right now, before you begin?' })}</div>
        <p class="small muted" style="margin-top:12px">The number doesn’t need to be precise. What matters is noticing how it changes.</p>`;
    } else if (d.step === 3) {
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
        <div class="safe-point">${icon('alert-triangle')}<span>Complete your practice first. Record your answers at a safe point, once you’re back on the ground, not while climbing or belaying.</span></div>
        <div class="card">${slider({ id: 'peak', bind: 'draft.peak', value: d.peak, label: 'At its peak, how intense was your fear during this exercise?', hint: 'Think about the most fearful moment, rather than how you feel now.' })}</div>`;
    } else if (d.step === 4) {
      body = `<h2 style="font-size:1.45rem">${esc(ex ? ex.title : '')}</h2>
        <div class="card">
          <div class="wizard-label" style="text-align:center">Falls completed</div>
          <div class="counter">
            <button data-action="reps" data-d="-1" aria-label="One fewer fall">${icon('minus')}</button>
            <div class="val" aria-live="polite">${d.reps}</div>
            <button class="plus" data-action="reps" data-d="1" aria-label="Add a fall">${icon('plus')}</button>
          </div>
        </div>
        <div class="card" style="margin-top:14px">${slider({ id: 'after', bind: 'draft.after', value: d.after, label: 'How fearful do you feel now, after completing this exercise?', hint: `Before: ${d.before} · Peak: ${d.peak}` })}</div>
        <div class="card" style="margin-top:14px"><label class="field"><span>Quick note</span><small>Optional. For example, anything you varied, or how the last fall felt.</small>
          <textarea class="input" style="min-height:70px" data-bind="draft.note" placeholder="e.g. Fourth fall felt noticeably calmer">${esc(d.note)}</textarea></label></div>`;
      canNext = d.reps > 0;
    } else {
      body = `<h2 style="font-size:1.45rem">Reflect on ${esc(ex ? ex.title : 'this exercise')}</h2>
        <div class="card tight" style="margin-bottom:20px"><div class="stat-row">
          <div class="stat"><div class="k">Before</div><div class="v">${d.before}</div></div>
          <div class="stat"><div class="k">Peak</div><div class="v">${d.peak}</div></div>
          <div class="stat"><div class="k">After</div><div class="v">${d.after}</div></div>
          <div class="stat"><div class="k">Falls</div><div class="v">${d.reps}</div></div>
        </div></div>
        ${reflectionForm(d, { bindPrefix: 'draft.', setAction: 'draft-set', exId: d.exId, n: sessionsFor(d.exId).length + 1, first: state.sessions.length === 0 })}`;
      canNext = !!d.decision;
    }

    return `<div class="read">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <a class="back-link" style="margin:0" href="#/">${icon('chevron-left')}Dashboard</a>
        <button class="btn btn-text" data-action="cancel-draft">${icon('x')}Discard session</button>
      </div>
      <span class="eyebrow">Module 6 · Step ${d.step + 1} of ${STEPS.length}: ${STEPS[d.step]}</span>
      <div class="wizard-steps" aria-hidden="true">${STEPS.map((_, i) => `<span class="${i <= d.step ? 'on' : ''}"></span>`).join('')}</div>
      ${body}
      <div class="wizard-foot sticky">
        ${d.step > 0 ? `<button class="btn btn-ghost" data-action="wiz" data-d="-1">${icon('chevron-left')}Back</button>` : '<span></span>'}
        ${d.step < STEPS.length - 1
          ? `<button class="btn btn-primary" data-action="wiz" data-d="1" ${canNext ? '' : 'disabled'}>Continue${icon('chevron-right')}</button>`
          : `<button class="btn btn-primary" data-action="save-session" ${canNext ? '' : 'disabled'}>${icon('check')}Save and finish</button>`}
      </div>
      ${d.step === 4 && !canNext ? '<p class="small muted" style="text-align:right">Add at least one fall to continue.</p>' : ''}
      ${d.step === 5 && !canNext ? '<p class="small muted" style="text-align:right">Choose repeat, adjust or mark complete to save.</p>' : ''}
    </div>`;
  }

  function viewPracticeIntro() {
    const cur = currentStep();
    return `<div class="read lesson">
      ${chapterHead('m6')}
      <p>This is where you take your exposure ladder to the wall. Each time you practise, record the session as you go: choose your exercise, check your setup, then rate your fear, count your falls and reflect.</p>

      <h2>Three fear ratings</h2>
      <p>For every session you’ll record three ratings from 0 to 100:</p>
      <div class="three">
        <div><b>Before</b><span>How fearful you feel before beginning the exercise.</span></div>
        <div><b>Peak</b><span>The highest level of fear you experienced during the exercise.</span></div>
        <div><b>After</b><span>How fearful you feel after completing the exercise.</span></div>
      </div>
      <p>Together they help you reflect on the experience, notice changes over time and decide whether to repeat, adjust or progress an exercise.</p>
      <p>Don’t expect every number to drop every session. Fear varies from day to day, and a higher score on a hard day doesn’t undo your progress. Often the most useful things to notice are that your fear rose, peaked and settled, or that you stayed with it.</p>
      <div class="safe-point">${icon('alert-triangle')}<span>Record your ratings at a safe point, once you’re back on the ground, not while you’re climbing or belaying.</span></div>

      <div class="card" style="margin-top:20px">
        <div class="card-label">${icon('flag')}${cur ? 'Your current step' : 'All steps complete'}</div>
        ${cur ? `<div style="display:flex;justify-content:space-between;gap:12px"><div><h3>${esc(cur.title)}</h3><p class="small muted" style="margin:0">${esc(cur.desc || '')}</p></div>${badge(cur.rating)}</div>` : '<p class="muted">You can still log practice on any step, which is a good way to keep confidence topped up.</p>'}
        <button class="btn btn-primary btn-block" style="margin-top:18px" data-action="start-practice">${icon('activity')}Start a session</button>
        ${state.ladder.length ? `<p class="small muted" style="margin:12px 0 0">${state.ladder.filter((x) => x.done).length} of ${state.ladder.length} exercises complete. This module is complete when every exercise on your ladder is marked complete.</p>` : ''}
      </div>

      <h2>Practising progressively</h2>
      <ul>
        <li>Start each session with the last exercise you completed. It settles nerves and builds early confidence.</li>
        <li>Choose exercises that bring up fear you can stay with. Moving too quickly can limit the learning.</li>
        <li>Add variety gradually, as described in Module 5.</li>
        <li>Treat fall practice as a regular part of your climbing, rather than a one-off.</li>
      </ul>
      <div class="callout safety"><p class="callout-title">${icon('shield-check')}Your safety comes first</p>
        <p>Only practise exercises within your technical competence, with appropriate equipment, a competent and attentive belayer (ideally using an assisted-braking device), and in line with your wall’s policies. <a href="#/safety">Read the full safety guidance</a>.</p></div>
      ${chapterFoot('m6', '')}
    </div>`;
  }

  // Saved session: view or edit its reflection (e.g. older sessions logged without one).
  function viewSession(id) {
    const s = getSession(id);
    if (!s) return `<div class="read"><a class="back-link" href="#/log">${icon('chevron-left')}Practice log</a><div class="card"><h3>Session not found</h3><p class="muted">It may have been deleted.</p></div></div>`;
    const ex = getEx(s.exId);
    const n = state.sessions.filter((x) => x.exId === s.exId && x.date <= s.date).length;
    return `<div class="read">
      <a class="back-link" href="#/log">${icon('chevron-left')}Practice log</a>
      <span class="eyebrow">Practice session</span>
      <h1 style="font-size:clamp(1.6rem,4.5vw,2.1rem);margin-bottom:6px">${esc(s.exTitle)}</h1>
      <p class="muted">${fmtDate(s.date)}</p>
      <div class="card tight"><div class="stat-row">
        <div class="stat"><div class="k">Before</div><div class="v">${s.before}</div></div>
        <div class="stat"><div class="k">Peak</div><div class="v">${s.peak}</div></div>
        <div class="stat"><div class="k">After</div><div class="v">${hasNum(s.after) ? s.after : '<small>Not recorded</small>'}</div></div>
        <div class="stat"><div class="k">Falls</div><div class="v">${s.reps}</div></div>
      </div>${s.note ? `<p class="small" style="margin:12px 0 0">${esc(s.note)}</p>` : ''}</div>
      <div class="lesson"><h2>Reflect</h2></div>
      ${reflectionForm(s.reflection, { bindPrefix: `session:${s.id}:`, setAction: 'ref-set', setId: s.id, exId: s.exId, n })}
      <div class="btn-row" style="margin-top:22px">
        <button class="btn btn-primary" data-action="save-reflection" data-id="${s.id}">${icon('check')}${s.reflected ? 'Update reflection' : 'Save reflection'}</button>
        <a class="btn btn-text" href="#/log">Back to log</a>
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 7: Review Your Progress                              */
  /* ---------------------------------------------------------- */
  function reviewValue(x) { const v = state.reviewDraft[x.id]; return hasNum(v) ? v : x.rating; }

  function viewProgress() {
    const last = state.reviews[state.reviews.length - 1];
    let summary = '';
    if (last) {
      const c = { lower: 0, same: 0, higher: 0, none: 0 };
      last.items.forEach((it) => { if (!hasNum(it.original)) c.none++; else if (it.rating < it.original) c.lower++; else if (it.rating > it.original) c.higher++; else c.same++; });
      const parts = [c.lower && `${c.lower} lower`, c.same && `${c.same} unchanged`, c.higher && `${c.higher} higher`, c.none && `${c.none} without an original rating`].filter(Boolean);
      summary = `<div class="card tight" style="margin:18px 0"><div class="card-label" style="margin-bottom:6px">${icon('check-circle-2')}Last reviewed ${fmtDate(last.date)}</div>
        <p style="margin:0;font-size:15.5px;font-style:normal">Compared with your original ratings: ${parts.join(', ')}.</p>
        ${c.higher ? '<p class="muted" style="margin:6px 0 0;font-size:14px">A higher rating isn’t a failure. Fear can rise after a hard session or time away. It’s useful information for choosing your next step.</p>' : ''}</div>`;
    }
    const rows = state.ladder.map((x) => {
      const v = reviewValue(x);
      return `<div class="review-row">
        <div class="t">${esc(x.title)}${x.done ? ' <span class="tag pine" style="margin-left:4px">Completed</span>' : ''}</div>
        <div><span class="lbl">Original</span>${hasNum(x.original) ? badge(x.original) : `<span class="na">Unavailable${x.original === undefined ? '<br>(ladder not saved)' : ''}</span>`}</div>
        <div class="now"><input type="range" min="0" max="100" step="5" value="${v}" data-bind="rv:${x.id}" data-badge="rvb-${x.id}" data-delta="rvd-${x.id}" data-orig="${hasNum(x.original) ? x.original : ''}" aria-label="Current fear for ${esc(x.title)}, 0 to 100">${badge(v, 'rvb-' + x.id)}</div>
        <div id="rvd-${x.id}">${deltaHtml(x.original, v)}</div>
      </div>`;
    }).join('');

    return `<div class="read lesson">
      ${chapterHead('m7')}
      <p>Fear changes through experience. Because you’ve been practising, situations that once felt overwhelming may now feel more manageable, and some may not have changed yet. This chapter is about noticing where you are now.</p>
      <div class="callout"><p class="callout-title">Reflect</p>
        <p>Look back at the ratings you gave when you first created your exposure ladder. How fearful does each exercise feel now? Update your scores to see what has changed.</p></div>
      ${summary}
      ${state.ladder.length ? `<div class="card" style="margin-top:18px">
          <div class="review-row head"><span>Exercise</span><span>Original</span><span>Now</span><span>Change</span></div>
          ${rows}
        </div>
        <p class="small muted" style="margin-top:10px">Saving updates each exercise’s current rating. Your original ratings are kept unchanged.</p>`
        : `<div class="ladder-empty">${icon('list-ordered')}<p style="margin:8px 0 12px">Build your exposure ladder in Module 4 first.</p><a class="btn btn-ghost" href="#/ladder">Go to Module 4</a></div>`}
      <p class="small"><a href="#/log">${icon('history', 'inline')} Open your practice log</a> to look back at individual sessions.</p>
      ${chapterFoot('m7', state.ladder.length
        ? `<button class="btn btn-primary" data-action="save-review">${icon('check')}${last ? 'Save a new review' : 'Save my review'}</button>${last ? `<a class="btn btn-ghost" href="#/finish">Continue to Module 8${icon('arrow-right')}</a>` : ''}`
        : '')}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Module 8: Congratulations and Next Steps                    */
  /* ---------------------------------------------------------- */
  function viewFinish() {
    const done = state.ladder.filter((x) => x.done).length;
    const falls = state.sessions.reduce((a, s) => a + s.reps, 0);
    return `<div class="read lesson">
      ${chapterHead('m8')}
      <p>Well done. Take a moment to recognise what you’ve done. You’ve set aside time to understand your fear, face it directly and reflect on what you learned. That’s no small thing.</p>
      <div class="card tight"><div class="stat-row">
        <div class="stat"><div class="k">Sessions</div><div class="v">${state.sessions.length}</div></div>
        <div class="stat"><div class="k">Falls</div><div class="v">${falls}</div></div>
        <div class="stat"><div class="k">Steps completed</div><div class="v">${done}<small> / ${state.ladder.length}</small></div></div>
      </div></div>

      <h2>What you’ve worked through</h2>
      <ul>
        <li>How fear works, and how it shows up in your thoughts, body and behaviour</li>
        <li>Your own fear pattern</li>
        <li>The principles of good, safe fall practice</li>
        <li>Building, practising and reviewing your own exposure ladder</li>
      </ul>

      <h2>Keep going</h2>
      <p>This course isn’t an endpoint; it’s a foundation. Fear is a normal and natural response, and it may return, especially after time away from climbing or in a new environment. That doesn’t mean the work hasn’t helped.</p>
      <p>When it does, return to the principles you’ve learned: graded steps, staying long enough for fear to settle, repetition, and practice without distractions. Keep using your ladder and practice log. Essentials stays available to you, whether or not you upgrade.</p>
      ${state.read.m8
        ? `<p><span class="tag pine">${icon('check')}Course complete</span></p>`
        : `<div class="btn-row"><button class="btn btn-primary" data-action="mark-read" data-key="m8">${icon('check')}Mark the course complete</button></div>`}

      <h2>Want more guidance and structure?</h2>
      <p>The full Fear of Falling Toolkit builds on everything here, with:</p>
      <div class="feature-grid" style="margin:16px 0">${['videos', 'goals', 'plan', 'analytics', 'skills', 'community'].map(featureCard).join('')}</div>
      <div class="card">${upgradeButtons(`<a class="btn btn-ghost" href="#/">Back to my dashboard</a>`)}</div>
      ${chapterFoot('m8', '')}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Practice log                                                */
  /* ---------------------------------------------------------- */
  function viewLog() {
    const list = sortedSessions();
    const total = list.reduce((a, s) => a + s.reps, 0);
    const done = state.ladder.filter((x) => x.done).length;
    const bar = (label, v) => hasNum(v)
      ? `<div class="bar"><span>${label}</span><span class="tr"><span style="width:${v}%;--c:${rateColor(v)}"></span></span><b>${v}</b></div>`
      : `<div class="bar"><span>${label}</span><span class="small" style="font-style:italic">Not recorded</span><b></b></div>`;
    const sess = (s) => {
      const open = ui.openSession === s.id;
      const r = s.reflection;
      const dec = { repeat: 'Repeat', adjust: 'Adjust', progress: 'Marked complete' }[r.decision];
      return `<div class="card session">
        <div class="session-head">
          <div><span class="date">${fmtShort(s.date)}</span><h3>${esc(s.exTitle)}</h3></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${s.reflected ? `<span class="tag pine">${icon('check')}Reflected</span>` : '<span class="tag">No reflection</span>'}${dec ? `<span class="tag plum">${dec}</span>` : ''}</div>
        </div>
        <div class="bars">${bar('Before', s.before)}${bar('Peak', s.peak)}${bar('After', s.after)}</div>
        <div class="session-foot">
          <span class="muted">${plural(s.reps, 'fall')}</span>
          ${s.reflected ? `<button class="btn btn-text" data-action="toggle-session" data-id="${s.id}">${icon(open ? 'chevron-up' : 'chevron-down')}${open ? 'Hide' : 'Show'} reflection</button>` : ''}
          <a class="btn btn-text" href="#/session/${s.id}">${icon('edit-3')}${s.reflected ? 'Edit' : 'Reflect'}</a>
          ${ui.confirmDelete === s.id
            ? `<span class="small">Delete this session?</span><button class="btn btn-text" style="color:var(--ep-clay)" data-action="delete-session" data-id="${s.id}">Delete</button><button class="btn btn-text" data-action="cancel-delete">Cancel</button>`
            : `<button class="btn btn-text" data-action="ask-delete" data-id="${s.id}">${icon('trash-2')}Delete</button>`}
        </div>
        ${s.note ? `<p class="small" style="margin:10px 0 0">${esc(s.note)}</p>` : ''}
        ${open ? `<dl class="reflection-view">
          ${r.expected ? `<div><dt>Expected</dt><dd>${esc(r.expected)}</dd></div>` : ''}
          ${r.happened ? `<div><dt>What happened</dt><dd>${esc(r.happened)}</dd></div>` : ''}
          ${r.learned ? `<div><dt>Learned</dt><dd>${esc(r.learned)}</dd></div>` : ''}
          ${r.confidence ? `<div><dt>Confidence to repeat</dt><dd>${['', 'Not yet', 'A little', 'Fairly', 'Very'][r.confidence]}</dd></div>` : ''}
        </dl>` : ''}
      </div>`;
    };
    const exRows = state.ladder.map((x) => `<div class="ex-row"><div><div class="t">${esc(x.title)}</div><div class="s">${plural(sessionsFor(x.id).length, 'session')}${x.done ? ' · completed' : ''}</div></div>
        <div class="chg">${hasNum(x.original) && x.original !== x.rating ? `${badge(x.original)}${icon('arrow-right')}` : ''}${badge(x.rating)}</div></div>`).join('');

    return `<div class="wrap">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="page-head">
        <div><span class="eyebrow">Available any time</span><h1>My Practice Log</h1><p>Your sessions, ratings and reflections.</p></div>
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
          ${list.length >= 3 ? nudge('after-repeated', { icon: 'brain', feature: 'skills', title: 'Building confidence takes more than repetition', body: 'Discover the psychological strategies that can help you apply what you’ve learned to your climbing: working with anxious thoughts, steadying your attention and staying present on the wall.' }) : ''}
        </div>
        <aside class="stack">
          <div class="card">
            <div class="card-label">${icon('list-ordered')}Ladder ratings</div>
            ${state.ladder.length ? `<p class="small muted" style="margin-top:-6px">Original ${icon('arrow-right', 'inline')} current. <a href="#/progress">Review in Module 7</a>.</p>${exRows}` : '<p class="small muted">Build your ladder to see ratings here.</p>'}
          </div>
          <div class="card">
            <div class="card-label">${icon('line-chart')}Progress analytics<span class="right">${icon('lock')}</span></div>
            <div class="preview-frame"><div class="pv">${analyticsPreview()}</div></div>
            <p class="small muted" style="margin:12px 0 10px">The full Toolkit’s Progress Comparison page charts your whole ladder in one view.</p>
            <button class="btn btn-ghost btn-block" data-action="feature" data-key="analytics">Preview</button>
          </div>
        </aside>
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------------------------------------------------- */
  /* Full Toolkit, safety, notes                                 */
  /* ---------------------------------------------------------- */
  function viewToolkit() {
    const Y = (t) => `<span class="yes">${icon('check')}${t}</span>`;
    const N = (t = 'Not included') => `<span class="no">${icon('minus')}${t}</span>`;
    const rows = [
      ['Understanding your fear', Y('Introduction and five Foundations chapters'), Y('21 in-depth chapters across foundations and practice')],
      ['Exposure ladder', Y('Build, rate, reorder, complete and review'), Y('Plus a guided re-evaluation chapter part way through')],
      ['Fall practice logging', Y('Before, peak and after ratings, falls completed'), Y('Before, peak and after ratings, plus variations practised')],
      ['Reflection', Y('Questions and a repeat, adjust or progress decision after each session'), Y('Plus a guided final reflection')],
      ['Progress review', Y('Original versus current rating for each exercise'), Y('Progress Comparison page: fear-level chart, summary figures, ladder evolution and training history')],
      ['Video lessons', N(), Y('24 lessons, including exercise demonstrations')],
      ['Goal setting', N(), Y('A SMART climbing goal and the climber you want to be')],
      ['Weekly Practice Planner', N(), Y('Plan practice days, timing and duration around your climbing')],
      ['Psychological strategies', N(), Y('Behavioural, cognitive and mindfulness skills')],
      ['Climbers’ WhatsApp Community', N(), Y('A WhatsApp group of climbers working through the Toolkit')],
      ['Safety guidance', Y('Included'), Y('Included')],
    ];
    return `<div class="wrap">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <div class="cta-band">
        <img class="wm" src="../../assets/img/logo-symbol-purple.png" alt="">
        <span class="eyebrow">Explore the Full Toolkit</span>
        <h2>Essentials gets you started. The Fear of Falling Toolkit gives you more guidance and structure.</h2>
        <p>The complete, self-guided programme from Expedition Psychology: video lessons, goal setting, a weekly practice planner, detailed progress tracking, psychological strategies and a community of climbers on the same path.</p>
        <div class="btn-row" style="margin-top:18px"><a class="btn btn-plum" style="background:#fff;color:var(--ep-ink)" href="${UPGRADE_URL}" target="_blank" rel="noopener">${upgradeLabel()}${icon('arrow-up-right')}</a><a class="btn btn-ghost" href="#compare">Compare</a></div>
        <p class="price-note">${PRICE_NOTE}</p>
      </div>

      <div class="section">
        <h2 class="section-title">What you’d unlock</h2>
        <div class="feature-grid">${['videos', 'goals', 'plan', 'analytics', 'skills', 'reflection', 'community'].map(featureCard).join('')}</div>
      </div>

      <div class="section" id="compare">
        <h2 class="section-title">Essentials and the full Toolkit</h2>
        <table class="compare">
          <thead><tr><th scope="col">Feature</th><th scope="col">Essentials<small>Your current course</small></th><th scope="col" class="hl">Full Toolkit<small>${money(PRICING.toolkit)} standard price · Essentials customers pay only the difference</small></th></tr></thead>
          <tbody>${rows.map(([f, a, b]) => `<tr><td>${f}</td><td>${a}</td><td class="hl">${b}</td></tr>`).join('')}</tbody>
        </table>
        <div style="margin-top:18px">${upgradeButtons()}</div>
      </div>

      <div class="section grid-2">
        <div class="card">
          <span class="eyebrow">Want 1:1 support?</span>
          <h3>Fear of Falling Coaching</h3>
          <p class="muted">The complete Toolkit plus five weekly 1:1 sessions with a Clinical Psychologist, including video analysis of your falls, personalised written feedback and email support between sessions.</p>
          <a class="btn btn-ghost" href="../../services-individuals.html" target="_blank" rel="noopener">Ask about coaching${icon('arrow-up-right')}</a>
        </div>
        <div class="card">
          <span class="eyebrow pine">Staying on Essentials?</span>
          <h3>That’s a good place to start</h3>
          <p class="muted">Everything you need to begin structured fall practice stays available: your ladder, practice log, reflections and safety guidance.</p>
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
      <h2>Disclaimer</h2>
      <p><strong>This course does not teach you how to climb.</strong> All content relates to indoor climbing and assumes that you and your belayer already know how to lead climb safely, including belaying safely, clipping correctly, managing your rope effectively, and identifying and managing risks.</p>
      <h2>Safety and responsibility</h2>
      <p>This programme is designed to support the psychological side of climbing, particularly confidence and fear of falling. It is not a substitute for in-person, professional climbing instruction.</p>
      <p>All practical exercises should only be carried out:</p>
      <ul>
        <li>In line with the policies and safety guidance of your climbing wall.</li>
        <li>With appropriate equipment that is correctly fitted and in good condition. Repeated falls increase wear, so check it each session.</li>
        <li>With a competent and attentive belayer using the technique recommended by the manufacturer of the belay device. An assisted-braking device such as a GriGri adds an important extra layer of safety.</li>
        <li>On a suitable route in an appropriate, quieter area of the wall, after letting nearby climbers know what you’re doing.</li>
        <li>With good rope awareness: keep legs and arms clear of the rope to avoid flipping.</li>
      </ul>
      <div class="callout safety"><p class="callout-title">${icon('shield-check')}If in doubt, don’t</p>
        <p>Do not practise falling exercises if you are unsure about any aspect of your setup, communication or technique. When in doubt, seek guidance from a qualified instructor.</p></div>
      <p>You are responsible for your own safety and decisions. Stop any exercise if you feel unwell, injured, overly fatigued or unsafe. If fear becomes overwhelming, return to an easier step.</p>
      <p>If you have a history of significant trauma, panic or other mental health difficulties that may be triggered by exposure work, consider completing this programme with support from a qualified professional.</p>
      ${footer()}
    </div>`;
  }

  function viewNotes() {
    return `<div class="read lesson">
      <a class="back-link" href="#/">${icon('chevron-left')}Dashboard</a>
      <span class="eyebrow">For the team</span>
      <h1>Prototype Notes</h1>
      <p>A working local prototype of the Essentials tier. The core features work end to end in the browser. Nothing here is connected to the live site, payments or member accounts.</p>
      <h2>Course structure</h2>
      <ul>
        <li><strong>Introduction</strong> with the welcome video and two required acknowledgements (disclaimer and safety). Every chapter, the practice flow and the log stay locked until both are ticked, including when opened by direct link. The safety page is always open.</li>
        <li><strong>Chapters unlock in order.</strong> Completed chapters stay open, plus the first one not yet completed; later chapters are locked in the list, the Next button and by direct link. In Module 6, exercises unlock in ladder order: completed steps and the current step only.</li>
        <li><strong>Foundations:</strong> 1 What Is Fear? · 2 Getting to Know Your Fear (fear map) · 3 What Makes Good Fall Practice? · 4 Creating Your Exposure Ladder (builder) · 5 The Importance of Variety</li>
        <li><strong>Practical Application:</strong> 6 Fall Practice · 7 Review Your Progress · 8 Congratulations and Next Steps</li>
        <li>Module 6 is complete only when the saved ladder has at least one exercise and every exercise is marked complete. Saving a session never completes an exercise by itself; that needs the explicit “Mark complete” decision.</li>
      </ul>
      <h2>Practice log and review</h2>
      <ul>
        <li>Sessions record <strong>Before</strong>, <strong>Peak</strong> and <strong>After</strong> fear (0–100), falls completed, a note and a reflection with a repeat, adjust or complete decision. Sessions logged before this update show After as “Not recorded”.</li>
        <li>The three reflection questions are optional. They open by default for someone’s first session and sit in a drop-down after that. Sessions don’t change ladder ratings; re-rating happens in Module 7 (or by editing the ladder).</li>
        <li>Each exercise keeps an <strong>original rating</strong>, captured the first time the ladder is saved with it, and never overwritten. Earlier saved data recovers it from rating history; if none exists it shows as unavailable.</li>
        <li>Module 7 compares original and current ratings, saves a dated record of each review and reports decreases, no change and increases as they are.</li>
      </ul>
      <h2>Upgrade pricing</h2>
      <ul>
        <li>All upgrade messages read from one setting (<code>PRICING</code> at the top of <code>app.js</code>). The upgrade amount is ${money(PRICING.toolkit)} minus the customer’s Essentials credit.</li>
        <li>The Essentials price isn’t confirmed, so the credit is unset and buttons read “${upgradeLabel()}”. Setting <code>essentialsCredit</code> switches them to “Upgrade for £X”.</li>
        <li><strong>Not implemented:</strong> checkout, verifying the customer’s actual purchase and applying the credit. Buttons currently link to the local sales page. The calculation is display only, not a working entitlement.</li>
      </ul>
      <h2>Needs backend work for the live product</h2>
      <ul>
        <li><strong>Accounts and authentication</strong>, ideally the same member area as the Toolkit.</li>
        <li><strong>A database.</strong> Local storage is per browser: progress is lost if it’s cleared and doesn’t sync between phone and laptop. Acknowledgements should also be stored server-side with a timestamp.</li>
        <li><strong>Payments and entitlements</strong>, including the Essentials credit described above.</li>
        <li><strong>Carrying data over on upgrade.</strong> The ladder (with original ratings) and log map closely to the Toolkit’s exposure ladder and logbook.</li>
        <li><strong>Video access control</strong> for the lesson library.</li>
        <li><strong>WhatsApp community access.</strong> The invitation link must only be shown to Toolkit members; the preview never includes it.</li>
        <li><strong>Conversion tracking</strong> for prompt views, clicks and dismissals, behind the existing cookie consent.</li>
      </ul>
      <h2>Assets and references</h2>
      <ul>
        <li><strong>Introduction video:</strong> embedded from YouTube (c_dasez4PQ4) via youtube-nocookie.com, with a note that it was recorded for the full Toolkit. Check whether the embed should wait for cookie consent.</li>
        <li><strong>Progress Analytics preview:</strong> modelled on the Toolkit’s Progress Comparison page (summary figures, Fear Level Comparison chart, Ladder Evolution, Training History), with illustrative data.</li>
        <li><strong>Weekly Practice Planner preview:</strong> modelled on the “Your Training Schedule” card on the Toolkit dashboard. No dedicated planner screenshot was supplied; swap in the real screen if it differs.</li>
        <li><strong>Branding:</strong> follows the live platform (Arboria, Nunito, paper, pine and plum). Three overrides at the top of <code>styles.css</code> switch to Montserrat, Lato and #f5d7a6.</li>
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
        <div class="modal-foot" style="display:block">
          <div class="btn-row">
            <a class="btn btn-plum" href="${UPGRADE_URL}" target="_blank" rel="noopener">${upgradeLabel()}</a>
            <a class="btn btn-ghost" href="#/toolkit" data-action="close-modal">Compare</a>
          </div>
          <p class="price-note">${PRICE_NOTE}</p>
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
    const name = ALIASES[parts[0]] || parts[0] || '';
    return { name, arg: parts[1] };
  }
  const NAV_FOR = { '': '', chapters: 'chapters', ladder: 'ladder', practice: 'practice', log: 'log', session: 'log' };
  function render() {
    const r = route();
    const views = {
      '': viewDashboard, chapters: viewChapters, intro: viewIntro, fear: viewFear, know: viewKnow, 'good-practice': viewGoodPractice,
      ladder: viewLadder, variety: viewVariety, practice: viewPractice, progress: viewProgress, finish: viewFinish,
      log: viewLog, toolkit: viewToolkit, safety: viewSafety, notes: viewNotes,
    };
    let html;
    const ch = CH.find((c) => c.route === r.name);
    if (GATED.has(r.name) && !acked()) html = viewGate();
    else if (ch && !accessible(ch.key)) html = viewGate(ch);
    else if (r.name === 'session') html = viewSession(r.arg);
    else html = (views[r.name] || viewDashboard)();
    $('#app').innerHTML = html;
    const active = NAV_FOR[r.name] !== undefined ? NAV_FOR[r.name] : CH.some((c) => c.route === r.name) ? 'chapters' : null;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === active));
    paintIcons();
    const key = location.hash;
    if (ui.lastRoute !== key) { ui.lastRoute = key; window.scrollTo(0, 0); }
  }
  function paintIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.9 } }); }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

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
    save(); render(); toast('Added to your ladder');
  }
  const blankReflection = () => ({ expected: '', happened: '', learned: '', confidence: 0, safe: '', settled: '', decision: '' });
  function applyRerate(ex, val) {
    if (!ex || !hasNum(val) || ex.rating === val) return;
    ex.history = ex.history || [];
    ex.history.push({ date: new Date().toISOString(), rating: val });
    ex.rating = val;
  }

  const actions = {
    'load-sample'() { state = sampleData(); save(); ui.justSaved = null; render(); toast('Example data loaded'); },
    'reset-all'() {
      if (!window.confirm('Reset all Essentials progress in this browser?')) return;
      state = blank(); save(); go('#/'); toast('Progress reset');
    },
    feature(el) { openFeature(el.dataset.key); },
    'close-modal'() { closeModal(); },
    dismiss(el) { state.dismissed[el.dataset.key] = true; save(); render(); },
    ack(el) { state.ack[el.dataset.key] = !state.ack[el.dataset.key]; save(); render(); },
    'mark-read'(el) {
      const k = el.dataset.key;
      state.read[k] = true; save();
      const i = CH.findIndex((c) => c.key === k);
      if (k === 'm8') { render(); toast('Course complete. Well done'); return; }
      toast('Chapter complete');
      go('#/' + CH[i + 1].route);
    },
    chip(el) {
      const g = el.dataset.group, v = el.dataset.val, arr = state.m1[g];
      const i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1); else arr.push(v);
      save(); render();
    },
    'add-chip'(el) { addChip(el.dataset.group); },
    'save-map'() {
      const first = !state.m1.done;
      state.m1.done = true; save();
      if (first) { toast('Fear map saved'); go('#/good-practice'); } else { render(); toast('Changes saved'); }
    },
    'add-lib'(el) {
      const l = LIBRARY.find((x) => x.key === el.dataset.key);
      if (!l) return;
      addToLadder({ key: l.key, title: l.title, desc: l.desc, custom: false });
      save(); render(); toast('Added to your ladder');
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
    edit(el) { ui.editing = ui.editing === el.dataset.id ? null : el.dataset.id; render(); },
    remove(el) {
      const x = getEx(el.dataset.id);
      if (!x) return;
      if (sessionsFor(x.id).length && !window.confirm('This exercise has logged sessions. Remove it from your ladder? Your log will keep the sessions.')) return;
      state.ladder = state.ladder.filter((y) => y.id !== x.id);
      save(); render();
    },
    'save-ladder'() {
      const now = new Date().toISOString();
      state.ladder.forEach((x) => {
        // Baseline = the first rating the user actually saves for this exercise. Never overwritten.
        if (x.original === undefined) { x.original = x.rating; x.originalDate = now; }
        if (!x.history || !x.history.length) x.history = [{ date: now, rating: x.rating }];
      });
      state.ladderSaved = true; ui.editing = null; save(); render(); toast('Exposure ladder saved');
    },
    'start-practice'() {
      const cur = currentStep();
      const ex = cur || state.ladder[0];
      state.draft = Object.assign({ step: 0, exId: ex.id, checks: [], before: 40, peak: 60, after: null, reps: 0, note: '' }, blankReflection());
      save(); render();
    },
    'pick-ex'(el) { if (el.dataset.locked) return; state.draft.exId = el.dataset.id; save(); render(); },
    check(el) { const i = Number(el.dataset.i); state.draft.checks[i] = !state.draft.checks[i]; save(); render(); },
    wiz(el) {
      const d = state.draft;
      d.step = Math.max(0, Math.min(STEPS.length - 1, d.step + Number(el.dataset.d)));
      if (d.step === 4 && !hasNum(d.after)) d.after = d.peak;
      save(); render(); window.scrollTo(0, 0);
    },
    reps(el) { state.draft.reps = Math.max(0, state.draft.reps + Number(el.dataset.d)); save(); render(); },
    'draft-set'(el) {
      const f = el.dataset.field, d = state.draft;
      const val = f === 'confidence' ? Number(el.dataset.val) : el.dataset.val;
      d[f] = d[f] === val ? (f === 'confidence' ? 0 : '') : val;
      save(); render();
    },
    'cancel-draft'() {
      if (!window.confirm('Discard this practice session?')) return;
      state.draft = null; save(); render();
    },
    'save-session'() {
      const d = state.draft, ex = getEx(d.exId);
      if (!d.decision) return;
      const s = {
        id: uid(), exId: d.exId, exTitle: ex ? ex.title : 'Exercise', date: new Date().toISOString(),
        before: d.before, peak: d.peak, after: d.after, reps: d.reps, note: d.note, reflected: true,
        reflection: { expected: d.expected, happened: d.happened, learned: d.learned, confidence: d.confidence, safe: d.safe, settled: d.settled, decision: d.decision },
      };
      if (ex && d.decision === 'progress') ex.done = true;
      state.sessions.push(s); state.draft = null; save();
      if (ladderAllDone()) { toast('Module 6 complete'); go('#/progress'); }
      else { ui.justSaved = s.id; toast('Session saved'); go('#/'); }
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
      if (ex && s.reflection.decision === 'progress') ex.done = true;
      s.reflected = true; save(); render();
      toast(s.reflection.decision === 'progress' ? 'Saved. Exercise marked complete' : 'Reflection saved');
    },
    'save-review'() {
      const now = new Date().toISOString();
      const items = state.ladder.map((x) => {
        const v = reviewValue(x);
        const prev = x.rating;
        applyRerate(x, v);
        return { id: x.id, title: x.title, original: hasNum(x.original) ? x.original : null, previous: prev, rating: v };
      });
      state.reviews.push({ date: now, items });
      state.reviewDraft = {};
      save(); render(); toast('Review saved');
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
    if (el.dataset.delta) {
      const t = document.getElementById(el.dataset.delta);
      if (t) { t.innerHTML = deltaHtml(el.dataset.orig === '' ? null : Number(el.dataset.orig), val); paintIcons(); }
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
    if (bind.startsWith('rv:')) { state.reviewDraft[bind.slice(3)] = val; return; }
    const [root, f] = bind.split('.');
    if (root === 'draft' && state.draft) state.draft[f] = val;
    if (root === 'm1') state.m1[f] = val;
  }

  window.addEventListener('hashchange', () => {
    ui.confirmDelete = null; ui.editing = null;
    if (route().name !== '') ui.justSaved = null;
    render();
  });
  window.addEventListener('pagehide', save);

  /* ---------------------------------------------------------- */
  /* Example data                                                */
  /* ---------------------------------------------------------- */
  function sampleData() {
    const s = blank();
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(19, 0, 0, 0); return d.toISOString(); };
    s.ack = { disclaimer: true, safety: true };
    s.read = { m1: true, m3: true, m5: true };
    s.m1 = { triggers: ['Being pumped', 'Climbing above my last clip', 'Climbing with someone new'], thoughts: ['What if my belayer doesn’t catch me?', 'What if I swing into the wall?'], body: ['Over-gripping and tension', 'Fast, shallow breathing'], behaviours: ['Saying “take” early', 'Down-climbing'], extra: '', done: true };
    const pick = (key, rating, first, done) => {
      const l = LIBRARY.find((x) => x.key === key);
      return { id: key, key, title: l.title, desc: l.desc, custom: false, rating, original: first, originalDate: day(20), done, history: [{ date: day(20), rating: first }].concat(first !== rating ? [{ date: day(3), rating }] : []) };
    };
    s.ladder = [pick('tr-snug', 10, 25, true), pick('tr-slack', 30, 40, false), pick('tr-unannounced', 50, 55, false),
      { id: 'own1', title: 'Top rope fall on the overhang', desc: 'Same as with a little slack, but on the steep wall.', custom: true, rating: 55, original: 60, originalDate: day(20), done: false, history: [{ date: day(20), rating: 60 }, { date: day(3), rating: 55 }] },
      pick('lead-clipped', 65, 65, false), pick('lead-at', 75, 75, false), pick('lead-above', 85, 85, false)];
    s.ladderSaved = true;
    const sess = (id, exId, ago, before, peak, after, reps, ref) => ({ id, exId, exTitle: s.ladder.find((x) => x.id === exId).title, date: day(ago), before, peak, after, reps, note: '', reflected: !!ref, reflection: Object.assign(blankReflection(), ref || {}) });
    s.sessions = [
      sess('s1', 'tr-snug', 17, 30, 55, 20, 5, { expected: 'That I’d freeze and not be able to let go.', happened: 'First one took ages. By the fifth I let go without counting down.', learned: 'The rope catches every time. My belayer was paying attention.', confidence: 3, safe: 'yes', settled: 'yes', decision: 'repeat' }),
      sess('s2', 'tr-snug', 13, 20, 40, 10, 6, { expected: 'Easier than last time, but still nervous.', happened: 'Pretty relaxed after the second fall.', learned: 'Starting with this step settles me down.', confidence: 4, safe: 'yes', settled: 'yes', decision: 'progress' }),
      sess('s3', 'tr-slack', 6, 45, 75, 40, 4, { expected: 'That the extra drop would feel like I’d hit the floor.', happened: 'Stomach dropped on the first one, then it was fine. Stopped after four as I got tired.', learned: 'The drop is short. The fear is mostly the anticipation.', confidence: 2, safe: 'yes', settled: 'partly', decision: 'repeat' }),
      sess('s4', 'tr-slack', 3, 38, 62, 25, 6, { expected: 'Still nervous about the drop.', happened: 'Calmer by the third fall. Tried one slightly left of the line.', learned: 'Warming up on the snug rope first helps.', confidence: 3, safe: 'yes', settled: 'yes', decision: 'repeat' }),
    ];
    return s;
  }

  render();
})();
