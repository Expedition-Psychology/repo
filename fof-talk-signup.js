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
    pending: 'Almost there — check your inbox and click the confirmation link to get the talk.',
    existing: "You're already on the list. Check your inbox (and spam) for the talk.",
    invalid: 'Please enter a valid email address.',
    failed: 'Something went wrong. Please try again in a moment.',
  };

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
            setMessage(
              msg,
              result.data.status === 'existing' ? MESSAGES.existing : MESSAGES.pending,
              'ok'
            );
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
