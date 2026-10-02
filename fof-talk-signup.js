/**
 * Fear of Falling — free talk signup.
 *
 * Progressive enhancement for any `form.talk-form` on the page. Posts the email
 * to the Netlify function, which adds the subscriber to the Sender.net pending
 * group. Sender then sends the double opt-in confirmation; the talk itself only
 * goes out once they click that link.
 *
 * Expected markup (see fear-of-falling-article.html):
 *   <form class="talk-form" data-source="article">
 *     <input type="email" name="email" class="talk-input" required>
 *     <button type="submit" class="talk-submit">Send me the talk</button>
 *     <input type="text" name="website" class="talk-hp">   <!-- honeypot -->
 *   </form>
 *   <p class="talk-msg"></p>
 *   <p class="talk-note">…</p>
 */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/fof-talk-signup';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var MESSAGES = {
    invalid: 'Please enter a valid email address.',
    failed: 'Something went wrong. Please try again in a moment.',
  };

  // Spelled out deliberately: the confirmation mail is the step people most
  // often miss, and it lands in spam often enough to be worth saying plainly.
  function successPanel(existing) {
    var lead = existing
      ? "You're already on the list."
      : 'Almost there.';
    var body = existing
      ? 'We&rsquo;ve sent your confirmation link again. Click it and the talk comes straight over.'
      : 'We&rsquo;ve just emailed you a confirmation link. Click it and the talk comes straight over.';
    return (
      '<div class="talk-done">' +
        '<p class="talk-done-h">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"></polyline></svg>' +
          lead + ' Check your inbox.' +
        '</p>' +
        '<p>' + body + '</p>' +
        '<p class="talk-done-spam"><strong>Can&rsquo;t see it? Check your spam or junk folder.</strong> ' +
          'The confirmation email often lands there &mdash; marking it &ldquo;not spam&rdquo; means the talk itself reaches you.</p>' +
        '<p>Still nothing after a few minutes? Email ' +
          '<a href="mailto:contact@expedition-psychology.com">contact@expedition-psychology.com</a> ' +
          'and we&rsquo;ll send it over directly.</p>' +
      '</div>'
    );
  }

  function setMessage(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('ok', 'err');
    el.classList.add('show', kind);
  }

  function init() {
    var forms = document.querySelectorAll('form.talk-form');

    Array.prototype.forEach.call(forms, function (form) {
      var wrap = form.parentElement;
      var msg = wrap ? wrap.querySelector('.talk-msg') : null;
      var note = wrap ? wrap.querySelector('.talk-note') : null;
      var input = form.querySelector('input[name="email"]');
      var button = form.querySelector('button[type="submit"]');
      var honeypot = form.querySelector('input[name="website"]');
      var originalLabel = button ? button.textContent : 'Send me the talk';

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var email = (input && input.value ? input.value : '').trim();
        if (!EMAIL_RE.test(email)) {
          setMessage(msg, MESSAGES.invalid, 'err');
          if (input) input.focus();
          return;
        }

        if (button) {
          button.disabled = true;
          button.textContent = 'Sending…';
        }
        if (msg) msg.classList.remove('show');

        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            website: honeypot ? honeypot.value : '',
            source: form.getAttribute('data-source') || 'unknown',
          }),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              return { ok: res.ok, data: data };
            });
          })
          .then(function (result) {
            if (!result.ok || !result.data || !result.data.ok) {
              var err = (result.data && result.data.error) || MESSAGES.failed;
              setMessage(msg, err, 'err');
              if (button) {
                button.disabled = false;
                button.textContent = originalLabel;
              }
              return;
            }

            // Success — retire the form, leave the confirmation in its place.
            form.style.display = 'none';
            if (note) note.style.display = 'none';
            if (msg) {
              msg.innerHTML = successPanel(result.data.status === 'existing');
              msg.classList.remove('err');
              msg.classList.add('show', 'ok');
            }
          })
          .catch(function () {
            setMessage(msg, MESSAGES.failed, 'err');
            if (button) {
              button.disabled = false;
              button.textContent = originalLabel;
            }
          });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
