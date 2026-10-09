// Password gate for the Fear of Falling Essentials prototype.
//
// Everything under /prototypes/fof-essentials/ needs a session cookie. Without
// one, visitors get a password page; the right password sets the cookie.
//
// The repo is public, so the password itself is never stored here. We keep:
//   VERIFIER   = SHA-256(PBKDF2(password, SALT, ITER))
//   TOKEN_HASH = SHA-256(HMAC(PBKDF2(password, SALT, ITER), "ep-fofe-session-v1"))
// The session token can only be derived from the password, and the stored hash
// of it can't be turned back into a valid cookie.
//
// To change the password, regenerate all three values with the same derivation
// (PBKDF2-SHA256, 32-byte output, new random SALT) and redeploy. Existing
// sessions stop working automatically because TOKEN_HASH changes.

const ITER = 60000;
const SALT = 'bfc2962c32f972bb21cbcd0c54526a29';
const VERIFIER = '6680b0c6639b70905dc83f0f81cd055b02f81fb8dffc01a9fd88fd76a5bd31c1';
const TOKEN_HASH = '773ddefea824d9a563c183985c264fc0da8af44835aa1a79656e9ab3282291e5';

const COOKIE = 'ep_fofe';
const COOKIE_PATH = '/prototypes/fof-essentials';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (data) => hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? enc.encode(data) : data));

function sameHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

// Returns the session token for a correct password, or null.
async function tokenFor(password) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ITER }, key, 256);
  if (!sameHex(await sha256(derived), VERIFIER)) return null;
  const hk = await crypto.subtle.importKey('raw', derived, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', hk, enc.encode('ep-fofe-session-v1')));
}

const PRIVATE_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'same-origin',
};

function loginPage(error) {
  const html = `<!DOCTYPE html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Fear of Falling Essentials | Expedition Psychology</title>
<link rel="icon" type="image/png" href="/assets/img/favicon-icon.png">
<link rel="stylesheet" href="https://use.typekit.net/frv6yjh.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600&display=swap">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:#f3f3f0;color:#444440;font-family:Nunito,system-ui,sans-serif;font-weight:400}
  .card{width:100%;max-width:400px;background:#fff;border:1px solid #e6e6e1;border-radius:20px;padding:32px 28px;box-shadow:0 4px 12px rgba(46,46,46,.08)}
  img{height:30px;display:block;margin-bottom:26px}
  .eyebrow{font-family:arboria,system-ui,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5b4a6a}
  h1{font-family:arboria,system-ui,sans-serif;font-weight:500;color:#2e2e2e;font-size:1.55rem;margin:6px 0 8px;letter-spacing:-.01em}
  p{margin:0 0 22px;color:#84847c;font-size:15px;line-height:1.5}
  label{display:block;font-weight:600;color:#2e2e2e;font-size:15px;margin-bottom:6px}
  input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid #d4d4cd;border-radius:12px;background:#f7f7f4;color:#2e2e2e}
  input:focus{outline:none;border-color:#4b7a6e;box-shadow:0 0 0 3px rgba(75,122,110,.35);background:#fff}
  button{margin-top:16px;width:100%;min-height:46px;border:0;border-radius:999px;background:#4b7a6e;color:#fff;font-family:arboria,system-ui,sans-serif;font-weight:500;font-size:15px;cursor:pointer}
  button:hover{background:#3a6056}
  .err{background:#f6e3e1;color:#8a3a33;border-radius:10px;padding:10px 12px;font-size:14px;margin-bottom:16px}
</style></head>
<body><main class="card">
  <img src="/assets/img/logo-wordmark-black-trimmed.png" alt="Expedition Psychology">
  <span class="eyebrow">Private preview</span>
  <h1>Fear of Falling Essentials</h1>
  <p>Enter the password you were given to open the prototype.</p>
  ${error ? '<div class="err" role="alert">That password isn’t right. Please try again.</div>' : ''}
  <form method="post">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Open the prototype</button>
  </form>
</main></body></html>`;
  return new Response(html, { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE_HEADERS } });
}

export default async (request, context) => {
  const cookie = readCookie(request, COOKIE);
  if (cookie && /^[0-9a-f]{64}$/.test(cookie) && sameHex(await sha256(cookie), TOKEN_HASH)) {
    const res = await context.next();
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(PRIVATE_HEADERS)) out.headers.set(k, v);
    return out;
  }

  if (request.method === 'POST') {
    let password = '';
    try { password = String((await request.formData()).get('password') || ''); } catch (e) { /* bad form */ }
    const token = password && password.length <= 200 ? await tokenFor(password) : null;
    if (!token) return loginPage(true);
    const url = new URL(request.url);
    return new Response(null, {
      status: 303,
      headers: {
        Location: url.pathname,
        'Set-Cookie': `${COOKIE}=${token}; Path=${COOKIE_PATH}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        ...PRIVATE_HEADERS,
      },
    });
  }

  return loginPage(false);
};

export const config = { path: ['/prototypes/fof-essentials', '/prototypes/fof-essentials/*'] };
