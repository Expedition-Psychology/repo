# Fear of Falling — free talk funnel

The funnel:

```
Visitor  →  enters email (article page or Toolkit page)
         →  Netlify function adds them to Sender.net "Pending" group
         →  Automation A emails "Confirm your email"
         →  they click the confirm button
              ├─ lands on /fof-talk-confirmed.html — talk plays immediately
              └─ Automation B fires on that click:
                   ├─ moves them to the "Confirmed" group
                   └─ emails the talk (with Toolkit CTA), within a minute or two
         →  Toolkit
```

Double opt-in: nobody joins the marketing list until they click the confirmation
link. Only ever send campaigns to the **Confirmed** group.

The talk reaches them twice over, both instantly: on screen when they confirm,
and by email as a copy they can come back to.

## Files

| File | What it is |
| --- | --- |
| `fear-of-falling-article.html` | The article, with the signup form (`data-source="article"`) |
| `fear-of-falling.html` | Toolkit page — "Not ready yet?" signup near the bottom (`data-source="toolkit-page"`) |
| `fof-talk-confirmed.html` | Landing page the confirmation button points at. Plays the talk, then sells the Toolkit. `noindex`. |
| `fof-talk-signup.js` | Front-end: posts the form to the function, handles success/error |
| `netlify/functions/fof-talk-signup.js` | Server: adds the subscriber to Sender.net |
| `email-fof-talk-confirm.html` | Email 1 — "Confirm your email" |
| `email-fof-talk-deliver.html` | Email 2 — the talk + Toolkit CTA |

The talk: <https://www.youtube.com/watch?v=gXD2u-74HdY>

---

## Setup (one-off)

### 1. Sender.net — create two groups

Subscribers → Groups → New group:

- **Fear of Falling Talk — Pending** (everyone who submits the form)
- **Fear of Falling Talk — Confirmed** (everyone who clicked the confirm link)

You need the **Pending** group's ID. Either read it from the group's URL in the
dashboard, or list them once you have a token (step 2):

```bash
curl -s https://api.sender.net/v2/groups \
  -H "Authorization: Bearer YOUR_TOKEN" -H "Accept: application/json"
```

### 2. Sender.net — create an API token

Settings → API access tokens → create one. Copy it; it's only shown once.

### 3. Netlify — add the environment variables

Site settings → Environment variables → Add:

| Key | Value |
| --- | --- |
| `SENDER_API_TOKEN` | the token from step 2 |
| `SENDER_FOF_PENDING_GROUP` | the **Pending** group ID from step 1 |

Optional — record which page each signup came from. Create a custom field in
Sender first (Subscribers → Fields), then set:

| Key | Value |
| --- | --- |
| `SENDER_SOURCE_FIELD` | e.g. `{$signup_source}` |

Redeploy after adding these (Deploys → Trigger deploy) so the function picks
them up.

### 4. Sender.net — build two automations

Two separate workflows, not one. The point is that the talk goes out the moment
someone confirms — no delay, and nobody is missed however long they take to
click.

Do **not** build this as a single workflow with a delay and a condition. In that
shape the delay runs before the condition is evaluated, so the talk email is
held for the full delay even when the subscriber confirmed immediately — and
anyone who confirms after the window is silently dropped down the No branch,
leaving someone who consented and watched the talk off the list entirely.

#### Automation A — "FoF talk: confirm"

Automation → **Create New Workflow** → name it `FoF talk: confirm`.

- **Trigger:** *Subscriber Added to a Group* → **Fear of Falling Talk — Pending**
- **Step 1 — Email:**
  - Email title (internal): `FoF talk — confirm`
  - Sender name: Fin Haley · From: your expedition-psychology.com address
  - Subject: *Confirm your email to get the Fear of Falling talk*
  - Content: **custom HTML**, paste `email-fof-talk-confirm.html` unedited. The
    button must stay pointed at
    `https://expedition-psychology.com/fof-talk-confirmed.html`.

Nothing else. **No delay, no condition, no branches** — the workflow is exactly
two blocks, trigger then email. Everything that happens after the click belongs
to Automation B.

> If subscribers receive the confirmation email twice, this is why: extra steps
> were left on Automation A. Open it and delete everything below *Send an
> email*.

**Activate.**

#### Automation B — "FoF talk: deliver"

Automation → **Create New Workflow** → name it `FoF talk: deliver`.

- **Trigger:** *A Link Is Clicked* → the confirmation URL
  `https://expedition-psychology.com/fof-talk-confirmed.html`
- **Step 1 — Action:** *Move subscriber to group* →
  **Fear of Falling Talk — Confirmed**
- **Step 2 — Email:**
  - Email title (internal): `FoF talk — delivery`
  - Subject: *Here's your Fear of Falling talk*
  - Content: **custom HTML**, paste `email-fof-talk-deliver.html`.

**Activate.**

The click fires Automation B directly, so the talk email lands within a minute
or two of confirming. Anyone who never clicks simply stays in Pending and
receives nothing further — which is what keeps the list clean.

If the click trigger won't let you select that URL (Sender's docs don't confirm
whether it can target links inside automation emails), see
*Fallback: single workflow* at the end of this document.

### 5. Check the sending domain

Sender.net → Settings → Domain authentication. Authenticate
`expedition-psychology.com` (SPF/DKIM) or the confirmation emails will land in
spam and the whole funnel stalls at step one.

---

## Testing it end to end

1. Deploy, then submit the form on `/fear-of-falling-article.html` with a real
   address you can check.
2. The page should say *"Almost there — check your inbox…"*.
3. Sender → Subscribers: the address is in **Pending**.
4. The confirmation email arrives; click the button.
5. You land on `/fof-talk-confirmed.html` and the talk plays.
6. Within a minute or two, Sender moves you to **Confirmed** and the talk email
   arrives. If it doesn't, Automation B's trigger isn't matching the click —
   check the URL on its trigger matches the button in the confirmation email
   exactly.

If step 3 doesn't happen, check the function log: Netlify → Logs → Functions →
`fof-talk-signup`. Missing env vars log
`Missing SENDER_API_TOKEN or SENDER_FOF_PENDING_GROUP`.

## Notes

- Submitting an address that's already subscribed returns a friendly "you're
  already on the list" rather than an error (Sender replies 422; the function
  treats it as success).
- The form has a honeypot field (`website`). Bots that fill it get a fake
  success and are never sent to Sender.
- GDPR: consent is the confirmation click, and every email carries an
  unsubscribe link (`{$unsubscribe_link}` — Sender refuses to send without
  one). Keep marketing to the Confirmed group.
- The older `fof-waitlist` Netlify form (52 submissions) is untouched and
  unrelated — this funnel does not write to Netlify Forms.

---

## Fallback: single workflow

Only if Sender's *A Link Is Clicked* trigger can't target the confirmation URL.
This delivers the talk email late, so prefer the two-automation setup above.

One workflow, `FoF talk — double opt-in`:

- **Trigger:** *Subscriber Added to a Group* → **Pending**
- **Step 1 — Email:** the confirmation email (`email-fof-talk-confirm.html`)
- **Step 2 — Delay:** 1 day
- **Step 3 — Condition:** *Workflow email activity* → the Step 1 email →
  activity **clicked**. Not *opened* — Apple Mail Privacy Protection pre-fetches
  images and marks messages opened whether or not anyone read them, so an
  open-based branch fires for most iPhone users regardless.
- **Yes → Action:** move to **Confirmed**
- **Yes → Email:** the talk (`email-fof-talk-deliver.html`)
- **No:** leave empty

Keep the delay at 1 day. Shortening it to minutes looks more responsive but is
worse: the condition is evaluated once, when the delay expires, so anyone
confirming after that point drops down the No branch permanently — consented,
watched the talk, never added to the list. A long delay only costs a slow email;
a short one loses subscribers silently.

The talk still plays instantly on `/fof-talk-confirmed.html` either way — the
delay only affects the emailed copy.
