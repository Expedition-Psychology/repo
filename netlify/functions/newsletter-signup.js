/**
 * Newsletter signup.
 *
 * Adds the subscriber to a Sender.net group and lets Sender own everything that
 * happens next — confirmation, welcome, and whatever campaigns or automations
 * are attached to that group. Nothing here sends email.
 *
 * Deliberately separate from fof-talk-signup rather than sharing it: that
 * function drives a working funnel, and a newsletter box on sixty pages is not
 * worth the risk of breaking it.
 *
 * Required environment variables (Netlify > Site settings > Environment variables):
 *   SENDER_API_TOKEN            API token from Sender.net > Settings > API access tokens
 *   SENDER_NEWSLETTER_GROUP     Group ID of the newsletter group
 * Optional:
 *   SENDER_NEWSLETTER_CONFIRM   "false" if that group uses single opt-in, so the
 *                               page stops telling people to look for a
 *                               confirmation link that is never sent.
 *                               Defaults to true (double opt-in).
 *   SENDER_SOURCE_FIELD         Custom field key (e.g. "{$signup_source}") to
 *                               record which page they subscribed from
 */

const SENDER_SUBSCRIBERS_URL = 'https://api.sender.net/v2/subscribers';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  // Honeypot — bots fill hidden fields. Pretend it worked so they stop retrying.
  if (String(payload.website || '').trim()) {
    return json(200, { ok: true, status: 'new', confirm: true });
  }

  const email = String(payload.email || '').trim().toLowerCase();
  const source = String(payload.source || '').trim().slice(0, 80);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const token = process.env.SENDER_API_TOKEN;
  const group = process.env.SENDER_NEWSLETTER_GROUP;
  if (!token || !group) {
    console.error('Missing SENDER_API_TOKEN or SENDER_NEWSLETTER_GROUP');
    return json(500, { ok: false, error: 'Signup is temporarily unavailable. Please try again later.' });
  }

  const confirm = String(process.env.SENDER_NEWSLETTER_CONFIRM || 'true').toLowerCase() !== 'false';

  const body = {
    email,
    groups: [group],
    trigger_automation: true,
  };
  if (source && process.env.SENDER_SOURCE_FIELD) {
    body.fields = { [process.env.SENDER_SOURCE_FIELD]: source };
  }

  let res;
  let text;
  try {
    res = await fetch(SENDER_SUBSCRIBERS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    text = await res.text();
  } catch (err) {
    console.error('Sender.net request failed:', err);
    return json(502, { ok: false, error: 'Could not reach the mailing service. Please try again.' });
  }

  if (res.ok) {
    return json(200, { ok: true, status: 'new', confirm });
  }

  // 422 is Sender's validation response — most often "already a subscriber".
  // Not worth surfacing as an error: they are on the list either way.
  if (res.status === 422) {
    console.warn('Sender.net 422 for newsletter signup:', text);
    return json(200, { ok: true, status: 'existing', confirm });
  }

  console.error('Sender.net error', res.status, text);
  return json(502, { ok: false, error: 'Something went wrong signing you up. Please try again.' });
};
