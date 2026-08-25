/* ==========================================================================
   Expedition Psychology — Cookie Consent & Tracking Manager
   --------------------------------------------------------------------------
   Non-essential tracking (Google Analytics 4 + Meta Pixel) is loaded ONLY
   after the visitor gives explicit opt-in consent. Global Privacy Control
   (GPC) signals are honoured automatically as an opt-out. Visitors can
   change their choice at any time via the footer "Cookie Preferences" and
   "Do Not Sell or Share My Personal Information" links.
   ========================================================================== */
(function () {
  "use strict";

  var GA_ID = "G-92FYJ0ZZZS";
  var FB_ID = "1572714024573888";
  var KEY = "epx_cookie_consent"; // "granted" | "denied"
  var loaded = false;

  /* ---------- storage helpers ---------- */
  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* ---------- Global Privacy Control ---------- */
  function gpcEnabled() {
    try { return navigator.globalPrivacyControl === true; } catch (e) { return false; }
  }

  /* ---------- load trackers (only on consent) ---------- */
  function loadTrackers() {
    if (loaded) return;
    loaded = true;

    /* Google Analytics 4 */
    window["ga-disable-" + GA_ID] = false;
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });

    /* Meta Pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", FB_ID);
    window.fbq("track", "PageView");
  }

  /* ---------- stop / opt out of tracking ---------- */
  function disableTrackers() {
    window["ga-disable-" + GA_ID] = true; // GA respects this flag and stops sending
  }

  /* ---------- banner UI ---------- */
  function injectStyles() {
    if (document.getElementById("epx-consent-style")) return;
    var css =
      "#epx-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;" +
      "background:#ffffff;color:#2e2e2e;border:1px solid #e0dfdb;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);" +
      "padding:20px 22px;font-family:'nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;}" +
      "#epx-consent h2{margin:0 0 6px;font-family:'arboria',Georgia,serif;font-weight:600;font-size:16px;color:#2e2e2e;letter-spacing:.01em;}" +
      "#epx-consent p{margin:0 0 14px;color:#3d3d3d;}" +
      "#epx-consent a{color:#4b7a6e;text-decoration:underline;}" +
      "#epx-consent .epx-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}" +
      "#epx-consent button{font-family:'nunito',-apple-system,sans-serif;font-weight:700;font-size:13.5px;letter-spacing:.02em;" +
      "border-radius:999px;padding:11px 22px;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s,color .15s;}" +
      "#epx-consent .epx-accept{background:#4b7a6e;color:#f3f3f0;}" +
      "#epx-consent .epx-accept:hover{background:#3f6a5f;}" +
      "#epx-consent .epx-reject{background:transparent;color:#3d3d3d;border-color:#cfcec9;}" +
      "#epx-consent .epx-reject:hover{background:#f3f3f0;border-color:#b8b7b1;}" +
      "#epx-consent .epx-gpc{margin-top:12px;font-size:12px;color:#717171;}" +
      "@media (max-width:480px){#epx-consent .epx-row{flex-direction:column;align-items:stretch;}#epx-consent button{width:100%;}}";
    var st = document.createElement("style");
    st.id = "epx-consent-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function removeBanner() {
    var el = document.getElementById("epx-consent");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function showBanner() {
    injectStyles();
    removeBanner();
    var gpc = gpcEnabled();
    var wrap = document.createElement("div");
    wrap.id = "epx-consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie consent");
    wrap.innerHTML =
      '<h2>Your privacy choices</h2>' +
      '<p>We use cookies and similar tracking technologies for analytics and marketing, ' +
      'to understand how our site is used and to improve it. These are optional and load ' +
      'only if you accept. Essential cookies needed to run the site are always on. ' +
      'See our <a href="privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="epx-row">' +
      '<button type="button" class="epx-accept">Accept all</button>' +
      '<button type="button" class="epx-reject">Reject non-essential</button>' +
      '</div>' +
      (gpc ? '<div class="epx-gpc">A Global Privacy Control signal was detected in your browser and is being honoured — non-essential tracking stays off unless you choose to accept.</div>' : '');
    document.body.appendChild(wrap);
    wrap.querySelector(".epx-accept").addEventListener("click", accept);
    wrap.querySelector(".epx-reject").addEventListener("click", reject);
  }

  function accept() { setChoice("granted"); removeBanner(); loadTrackers(); }
  function reject() { setChoice("denied"); disableTrackers(); removeBanner(); }

  /* ---------- public API (footer links) ---------- */
  window.epxOpenConsent = function () { showBanner(); };
  window.epxDoNotSell = function () {
    setChoice("denied");
    disableTrackers();
    injectStyles();
    removeBanner();
    var note = document.createElement("div");
    note.id = "epx-consent";
    note.innerHTML =
      '<h2>Opted out</h2>' +
      '<p>Your preference has been recorded. We will not use non-essential tracking, and will not sell or share your personal information for cross-context behavioural advertising on this device.</p>' +
      '<div class="epx-row"><button type="button" class="epx-reject">Close</button></div>';
    document.body.appendChild(note);
    note.querySelector(".epx-reject").addEventListener("click", removeBanner);
  };

  /* ---------- legal links bar (footer of every page) ---------- */
  function buildLegalBar() {
    var bar = document.createElement("div");
    bar.id = "epx-legal-bar";
    bar.setAttribute("data-epx-legal", "");
    bar.style.cssText =
      "border-top:1px solid #e0dfdb;background:#f3f3f0;color:#717171;" +
      "font-family:'nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
      "font-size:12px;line-height:1.6;text-align:center;padding:14px 16px;" +
      "display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:center;align-items:center;";
    bar.innerHTML =
      '<a href="privacy-policy.html" style="color:#4b7a6e;text-decoration:none;">Privacy Policy</a>' +
      '<a href="#" onclick="epxOpenConsent();return false;" style="color:#4b7a6e;text-decoration:none;">Cookie Preferences</a>' +
      '<a href="#" onclick="epxDoNotSell();return false;" style="color:#4b7a6e;text-decoration:none;">Do Not Sell or Share My Personal Information</a>';
    return bar;
  }

  function ensureLegalBar() {
    // If the page already has static legal links (marketing footers, or the
    // service/event pages' own footers), don't inject a bar.
    if (document.querySelector("[data-epx-legal]")) return;

    // Regular (non x-dc) pages: content is already in the DOM, append now.
    if (!document.querySelector("x-dc") && !document.getElementById("dc-root")) {
      document.body.appendChild(buildLegalBar());
      return;
    }
    // x-dc pages render after this script. Wait: if the page renders its own
    // legal links (data-epx-legal), skip; otherwise append a bar at the end.
    var tries = 0;
    var iv = setInterval(function () {
      if (document.querySelector("[data-epx-legal]")) { clearInterval(iv); return; }
      if (++tries > 15) { // ~3s
        clearInterval(iv);
        if (!document.getElementById("epx-legal-bar")) document.body.appendChild(buildLegalBar());
      }
    }, 200);
  }

  // Wire up the static footer legal controls (works even for content rendered
  // later by x-dc) via event delegation.
  document.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t.nodeType === 1) {
      if (t.classList && t.classList.contains("epx-cookie-prefs")) { e.preventDefault(); window.epxOpenConsent(); return; }
      if (t.classList && t.classList.contains("epx-do-not-sell")) { e.preventDefault(); window.epxDoNotSell(); return; }
      t = t.parentNode;
    }
  });

  /* ---------- init ---------- */
  function init() {
    ensureLegalBar();
    var choice = getChoice();
    if (choice === "granted") { loadTrackers(); return; }
    if (choice === "denied") { disableTrackers(); return; }
    // No explicit choice yet:
    if (gpcEnabled()) { disableTrackers(); return; } // honour GPC as opt-out, no nag
    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
