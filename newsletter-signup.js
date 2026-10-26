/**
 * Newsletter signup widget.
 *
 * Renders itself into any `<div data-ep-newsletter></div>` on the page, so the
 * markup lives in one file rather than being pasted into sixty pages. Posts to
 * the Netlify function, which adds the subscriber to the Sender.net group.
 *
 * Usage — one placeholder, one script tag:
 *   <div data-ep-newsletter data-source="article:self-talk"></div>
 *   <script src="newsletter-signup.js?v=2" defer></script>
 *
 * Attributes (all optional):
 *   data-source   recorded against the subscriber so you can see which page won them
 *   data-variant  "dark" on an ink background, "compact" for a tighter inline box
 *   data-heading  override the heading
 *   data-sub      override the supporting line
 *
 * Styles are injected here too, because these pages run two different CSS
 * systems and the widget has to look the same on both. It uses design-system
 * custom properties where they exist and falls back to literals where they do not.
 */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/newsletter-signup';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var HEADING = 'Get 15% off the Fear of Falling Toolkit';
  var SUB = 'Sign up to the Stay updated email and we&rsquo;ll send you a 15% discount code. ' +
            'One email a month on fear, pressure and performance in the outdoors, and you can ' +
            'unsubscribe whenever you like.';

  var CSS = [
    '.epn{background:var(--surface-sunken,#eceae6);border-top:1px solid var(--border-subtle,#e0e0da);',
      'border-bottom:1px solid var(--border-subtle,#e0e0da);padding:56px 24px;}',
    '.epn-in{max-width:620px;margin:0 auto;text-align:center;}',
    '.epn-eyebrow{margin:0 0 12px;font-family:var(--font-heading,inherit);font-weight:600;font-size:12px;',
      'letter-spacing:.14em;text-transform:uppercase;color:var(--ep-pine,#4b7a6e);}',
    '.epn-h{margin:0 0 10px;font-family:var(--font-heading,inherit);font-weight:500;',
      'font-size:28px;line-height:1.2;color:var(--text-strong,#2e2e2e);letter-spacing:-.01em;}',
    '.epn-sub{margin:0 0 26px;font-family:var(--font-body,inherit);font-size:16px;line-height:1.65;',
      'color:var(--text-muted,#6b6b6b);}',
    '.epn-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0 0 14px;}',
    '.epn-input{flex:1 1 260px;min-width:0;max-width:340px;box-sizing:border-box;padding:15px 20px;',
      'border-radius:999px;border:1px solid var(--border-subtle,#d9d8d2);background:#fff;',
      'font-family:var(--font-body,inherit);font-size:16px;color:var(--text-strong,#2e2e2e);',
      'outline:none;transition:border-color .18s,box-shadow .18s;}',
    '.epn-input::placeholder{color:#9b9b94;}',
    '.epn-input:focus{border-color:var(--ep-pine,#4b7a6e);box-shadow:0 0 0 3px rgba(75,122,110,.15);}',
    '.epn-btn{flex:0 0 auto;border:none;cursor:pointer;padding:15px 30px;border-radius:999px;',
      'background:var(--ep-pine,#4b7a6e);color:#fff;font-family:var(--font-heading,inherit);',
      'font-weight:600;font-size:13px;letter-spacing:.07em;text-transform:uppercase;',
      'transition:transform .18s,box-shadow .18s;}',
    '.epn-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(46,46,46,.14);}',
    '.epn-btn[disabled]{opacity:.6;cursor:default;transform:none;box-shadow:none;}',
    '.epn-note{margin:0;font-family:var(--font-body,inherit);font-size:12.5px;line-height:1.6;',
      'color:var(--text-muted,#8a8a84);}',
    '.epn-note a{color:var(--text-muted,#6b6b6b);}',
    '.epn-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;}',
    '.epn-msg{display:none;margin:14px 0 0;font-family:var(--font-body,inherit);font-size:14px;',
      'line-height:1.6;color:var(--ep-clay,#b6534b);}',
    '.epn-msg.show{display:block;}',
    '.epn-done{text-align:left;background:#fff;border:1px solid var(--border-subtle,#e0e0da);',
      'border-radius:14px;padding:24px 26px;}',
    '.epn-done-h{display:flex;align-items:center;gap:9px;margin:0 0 10px;',
      'font-family:var(--font-heading,inherit);font-weight:600;font-size:17px;',
      'color:var(--text-strong,#2e2e2e);}',
    '.epn-done-h svg{flex:none;color:var(--ep-pine,#4b7a6e);}',
    '.epn-done p{margin:0 0 8px;font-family:var(--font-body,inherit);font-size:14.5px;line-height:1.65;',
      'color:var(--text-body,#4a4a4a);}',
    '.epn-done p:last-child{margin-bottom:0;}',
    '.epn-done strong{color:var(--text-strong,#2e2e2e);}',
    '.epn-done a{color:var(--ep-pine,#4b7a6e);}',
    // dark variant, for ink-coloured sections
    '.epn--dark{background:var(--ep-ink,#2e2e2e);border-color:rgba(255,255,255,.1);}',
    '.epn--dark .epn-h{color:#fff;}',
    '.epn--dark .epn-sub{color:rgba(243,243,240,.7);}',
    '.epn--dark .epn-eyebrow{color:#9fd3bb;}',
    '.epn--dark .epn-note{color:rgba(243,243,240,.45);}',
    '.epn--dark .epn-note a{color:rgba(243,243,240,.7);}',
    '.epn--dark .epn-input{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.26);color:#f3f3f0;}',
    '.epn--dark .epn-input::placeholder{color:rgba(243,243,240,.5);}',
    // compact variant, for sidebars and narrow columns
    '.epn--compact{padding:30px 22px;border-radius:14px;border:1px solid var(--border-subtle,#e0e0da);}',
    '.epn--compact .epn-h{font-size:21px;}',
    '.epn--compact .epn-sub{font-size:15px;margin-bottom:18px;}',
    '@media (max-width:620px){',
      '.epn{padding:40px 20px;}',
      '.epn-h{font-size:23px;}',
      '.epn-row{flex-direction:column;align-items:stretch;}',
      '.epn-input{max-width:none;}',
      '.epn-btn{width:100%;}',
    '}',
    '@media print{.epn{display:none!important;}}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('epn-style')) return;
    var st = document.createElement('style');
    st.id = 'epn-style';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function tick() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
      'stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }

  function donePanel(existing, confirm) {
    if (!confirm) {
      return '<div class="epn-done">' +
        '<p class="epn-done-h">' + tick() +
          (existing ? 'You were already subscribed' : 'You&rsquo;re on the list') + '</p>' +
        '<p><strong>Your 15% code is on its way.</strong> It does not expire, so there is no rush ' +
          'to use it.</p>' +
        '<p>After that, one Stay updated email a month on fear, pressure and performance.</p>' +
      '</div>';
    }
    return '<div class="epn-done">' +
      '<p class="epn-done-h">' + tick() + 'One more step &mdash; then your code' + '</p>' +
      '<p>' + (existing
        ? 'You were already on the list, so we have sent your confirmation link again.'
        : 'We have just emailed you a confirmation link.') +
        ' <strong>Click it and your 15% code comes straight over.</strong></p>' +
      '<p><strong>Please check your spam or junk folder.</strong> That email lands there more often ' +
        'than it should. If you find it, mark it &ldquo;not spam&rdquo; so the rest reach your inbox.</p>' +
      '<p>Nothing after a few minutes? Email ' +
        '<a href="mailto:contact@expedition-psychology.com">contact@expedition-psychology.com</a>' +
        ' and we will add you by hand.</p>' +
    '</div>';
  }

  function render(host) {
    var variant = (host.getAttribute('data-variant') || '').trim();
    var heading = host.getAttribute('data-heading') || HEADING;
    var sub = host.getAttribute('data-sub') || SUB;

    var cls = 'epn';
    if (variant.indexOf('dark') > -1) cls += ' epn--dark';
    if (variant.indexOf('compact') > -1) cls += ' epn--compact';

    host.className = (host.className ? host.className + ' ' : '') + cls;
    host.innerHTML =
      '<div class="epn-in">' +
        '<p class="epn-eyebrow">Stay Updated</p>' +
        '<h2 class="epn-h">' + heading + '</h2>' +
        '<p class="epn-sub">' + sub + '</p>' +
        '<form class="epn-form" novalidate>' +
          '<div class="epn-row">' +
            '<label for="epn-e-' + host.__epnId + '" class="epn-hp">Email address</label>' +
            '<input id="epn-e-' + host.__epnId + '" type="email" name="email" class="epn-input" ' +
              'placeholder="you@example.com" autocomplete="email" required>' +
            '<button type="submit" class="epn-btn">Subscribe</button>' +
          '</div>' +
          '<label class="epn-hp">Leave this empty' +
            '<input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '</form>' +
        '<p class="epn-msg" role="alert" aria-live="polite"></p>' +
        '<p class="epn-note">The Stay updated email from Expedition Psychology. We will never share your ' +
          'address, and you can unsubscribe from any email. See our ' +
          '<a href="privacy-policy.html">Privacy Policy</a>.</p>' +
      '</div>';

    wire(host);
  }

  function wire(host) {
    var form = host.querySelector('.epn-form');
    var input = host.querySelector('.epn-input');
    var button = host.querySelector('.epn-btn');
    var hp = host.querySelector('input[name="website"]');
    var msg = host.querySelector('.epn-msg');
    var note = host.querySelector('.epn-note');
    var label = button.textContent;

    function fail(text) {
      msg.textContent = text;
      msg.classList.add('show');
      button.disabled = false;
      button.textContent = label;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.classList.remove('show');

      var email = (input.value || '').trim();
      if (!EMAIL_RE.test(email)) {
        fail('Please enter a valid email address.');
        input.focus();
        return;
      }

      button.disabled = true;
      button.textContent = 'Signing up…';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          website: hp ? hp.value : '',
          source: host.getAttribute('data-source') || document.title || 'unknown',
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (r) {
          if (!r.ok || !r.data || !r.data.ok) {
            fail((r.data && r.data.error) || 'Something went wrong. Please try again in a moment.');
            return;
          }
          form.style.display = 'none';
          if (note) note.style.display = 'none';
          msg.innerHTML = donePanel(r.data.status === 'existing', r.data.confirm !== false);
          msg.style.color = 'inherit';
          msg.classList.add('show');
        })
        .catch(function () {
          fail('Something went wrong. Please try again in a moment.');
        });
    });
  }

  function init() {
    var hosts = document.querySelectorAll('[data-ep-newsletter]');
    if (!hosts.length) return;
    injectStyles();
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].__epnDone) continue;
      hosts[i].__epnDone = true;
      hosts[i].__epnId = i;
      render(hosts[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
