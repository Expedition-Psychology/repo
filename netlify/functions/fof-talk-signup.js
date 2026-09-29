/**
 * Fear of Falling — free talk signup.
 *
 * Adds the subscriber to the Sender.net "pending" group. A Sender automation
 * triggered by that group sends the double opt-in confirmation email; once the
 * subscriber confirms, Sender moves them to the confirmed group and sends the
 * talk. Nothing here sends email directly — Sender owns the sending.
 *
 * Required environment variables (Netlify > Site settings > Environment variables):
 *   SENDER_API_TOKEN          API access token from Sender.net > Settings > API access tokens
 *   SENDER_FOF_PENDING_GROUP  Group ID of "Fear of Falling Talk — Pending"
 * Optional:
 *   SENDER_SOURCE_FIELD       Custom field key (e.g. "{$signup_source}") to record which page they signed up from
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
    return json(200, { ok: true, status: 'pending' });
  }

  const email = String(payload.email || '').trim().toLowerCase();
  const firstname = String(payload.firstname || '').trim().slice(0, 80);
  const source = String(payload.source || '').trim().slice(0, 80);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const token = process.env.SENDER_API_TOKEN;
  const group = process.env.SENDER_FOF_PENDING_GROUP;
  if (!token || !group) {
    console.error('Missing SENDER_API_TOKEN or SENDER_FOF_PENDING_GROUP');
    return json(500, { ok: false, error: 'Signup is temporarily unavailable. Please try again later.' });
  }

  const body = {
    email,
    groups: [group],
    trigger_automation: true,
  };
  if (firstname) body.firstname = firstname;
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
    return json(200, { ok: true, status: 'pending' });
  }

  // 422 is Sender's validation response — most commonly "already a subscriber".
  // That is not an error worth showing: they are on the list either way.
  if (res.status === 422) {
    console.warn('Sender.net 422 for signup:', text);
    return json(200, { ok: true, status: 'existing' });
  }

  console.error('Sender.net error', res.status, text);
  return json(502, { ok: false, error: 'Something went wrong signing you up. Please try again.' });
};
