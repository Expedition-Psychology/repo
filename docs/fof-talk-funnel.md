# Fear of Falling — free talk funnel

The funnel:

```
Visitor  →  enters email (article page or Toolkit page)
         →  Netlify function adds them to Sender.net "Pending" group
         →  Sender automation emails "Confirm your email"
         →  they click  →  lands on /fof-talk-confirmed.html (talk plays)
                        →  Sender moves them to "Confirmed" group
                        →  Sender emails the talk (with Toolkit CTA)
         →  Toolkit
```

Double opt-in: nobody joins the marketing list until they click the confirmation
link. Only ever send campaigns to the **Confirmed** group.

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

### 4. Sender.net — build the automation

Automation → New automation.

Automation → **Create New Workflow**. Name it "Fear of Falling talk — double
opt-in".

- **Trigger:** *Subscriber Added to a Group* → **Fear of Falling Talk — Pending**
- **Step 1 — Email:** the confirmation email. Use the custom-HTML option and
  paste `email-fof-talk-confirm.html`. The button must link to
  `https://expedition-psychology.com/fof-talk-confirmed.html`.
  Subject: *Confirm your email to get the Fear of Falling talk*
- **Step 2 — Delay:** 1 day (gives them time to click)
- **Step 3 — Condition:** *Workflow email activity* → pick the Step 1 email →
  activity **clicked**. This creates Yes / No branches.
  (Sender has no standalone "link is clicked" condition — it hangs off the
  email's own activity.)
- **Step 4 — Yes branch, Action:** *Move subscriber to group* →
  **Fear of Falling Talk — Confirmed**
- **Step 5 — Yes branch, Email:** the talk. Paste `email-fof-talk-deliver.html`.
  Subject: *Here's your Fear of Falling talk*
- **No branch:** leave empty.

Then **Activate** (top right). Anyone who doesn't click stays in Pending and
gets no marketing — which is the point.

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
6. Within the automation's delay window, Sender moves you to **Confirmed** and
   sends the talk email.

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
