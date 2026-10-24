# Newsletter signup — setup

The signup box is live on 32 pages and the Netlify side is **done**:

- `SENDER_NEWSLETTER_GROUP` = `enoZG7`, deployed and verified end to end.
- `SENDER_API_TOKEN` was already set from the free-talk funnel and is reused.

A test subscriber, `setup-test@expedition-psychology.com`, is sitting in group
`enoZG7` from that verification. **Delete it** before you start sending.

**One step is left**, and until you do it the site is making a promise it cannot
keep: after someone subscribes it tells them to look for a confirmation link.
Nothing sends that link yet. See the next two sections.

---

## 1. How opt-in works in this account

Sender's own double opt-in applies to forms it hosts. Subscribers added through
the API — which is what the site does — arrive **already active**, so there is no
native confirmation mail to switch on.

Your free-talk funnel gets around this with a click-gate, and the newsletter
copies it:

```
site form  →  API adds subscriber to the PENDING group
           →  automation sends "Confirm your subscription"
           →  they click the button
           →  automation sees the click, moves them to CONFIRMED
           →  the monthly series runs off CONFIRMED
```

That means **two groups**, not one. `enoZG7` is wired up as the group the website
writes into, so treat it as *pending* and create a second group for confirmed
subscribers.

If you would rather skip all of this, see "Single opt-in instead" below — it is a
legitimate choice and much less to build.

---

## 2. Build the confirmation automation

In Sender: rename `enoZG7` to something like **Newsletter — Pending**, then
create a second group, **Newsletter — Confirmed**.

Automations → Create automation → trigger **Subscriber added to a group** →
*Newsletter — Pending*:

```
Trigger: added to Newsletter — Pending
  → Email:  Confirm your subscription     (email-newsletter-confirm.html)
  → Wait / condition: clicked a link in that email
        yes → Add to group: Newsletter — Confirmed
              Remove from group: Newsletter — Pending
        no  → leave them, or remove after a week
```

Paste `email-newsletter-confirm.html` into the custom-HTML editor and
`email-newsletter-confirm.txt` into the plain-text field. Its button goes to
`expedition-psychology.com/newsletter-confirmed`, a page that just says they are
subscribed — Sender tracks the click, which is what moves them.

Leave `{$unsubscribe_link}` alone; Sender refuses to send without it.

### Single opt-in instead

Perfectly defensible: they typed their address into a form with the terms next to
it, which is consent. You lose nobody to an unclicked link, and given how often
your confirmations land in spam, that is not a small number.

To do it, skip this whole section, run the series straight off `enoZG7`, and tell
the website to stop promising a confirmation email:

```bash
netlify env:set SENDER_NEWSLETTER_CONFIRM "false"
netlify api createSiteBuild --data '{"site_id":"fe59753c-6764-4078-9990-bfd274378c5a"}'
```

The success message becomes "You're on the list" instead.

**My view:** start with single opt-in. You already know your confirmations get
filtered, and an unconfirmed subscriber who never hears from you again is worse
than a confirmed-by-form one who does. Move to double opt-in later if engagement
drops or complaints appear. The confirmation email is built and waiting either
way.

---

## 3. Automate the emails

You have the articles written as emails already, in `article-emails.html`. Two
ways to send them, and they do different jobs:

### A drip, so everyone gets the series from the start — recommended

Automations → **Create automation** → trigger **Subscriber added to a group** →
pick *Newsletter — Confirmed* (or `enoZG7` if you went single opt-in).

Then alternate steps:

```
Trigger: subscriber added to Newsletter — Confirmed
  → Email:  01 Goal Setting: Process Over Outcome
  → Delay:  1 month
  → Email:  02 Motivation That Lasts
  → Delay:  1 month
  → Email:  03 Building Resilience: The Four Pillars
  … and so on
```

Paste each email's source into Sender's custom-HTML editor, and the matching
plain-text version into the plain-text field.

The advantage is that it runs itself. Someone who subscribes next March still
starts at article one, and you never have to remember to send anything. With
nineteen articles that is a year and a half of automated sending.

Note the delay runs from when *they* subscribed, not from a fixed calendar date,
so people will receive emails on different days. That is normally what you want.

### Or broadcast campaigns, if you would rather send on a schedule

Campaigns → **Create campaign** → send to the newsletter group. Everyone gets it
on the same day, and you choose each month what goes out.

Use this if you want to write something timely, or react to what you are doing
that month. It is more work and easy to let slip.

**You can do both** — put the evergreen articles on the drip, and send occasional
broadcasts on top.

---

## 4. Test it end to end

1. Subscribe on any article page with an address you can check.
2. Confirm the subscriber appears in Sender, in the right group.
3. Click the confirmation link and check the first email arrives.
4. Check the unsubscribe link in that email actually works.

Test with an address at a different provider from your own — Gmail or Outlook,
not an `expedition-psychology.com` one. Mail to your own domain almost always
arrives; that tells you nothing about what everyone else sees.

---

## 5. Optional: record where each subscriber came from

The form already sends which page won the subscriber (`page:self-talk`,
`page:index`, and so on). To record it against the subscriber in Sender:

1. Sender → Subscribers → **Fields** → create a text field, e.g. `signup_source`.
2. ```bash
   netlify env:set SENDER_SOURCE_FIELD "{\$signup_source}"
   ```

Worth doing. After a few months it tells you which articles actually earn
subscribers, which is more useful than overall traffic.

---

## Where the box appears

32 pages: the home page, Recent Work, Free Tools, Courses, both Services pages,
all 21 articles and all 5 case studies. It sits directly above the footer.

Deliberately **not** on:

- **The Toolkit sales page** — a free newsletter competes with a £99 CTA.
- **The free-talk landing page** — it already has one job.
- **Worksheets and self-check tools** — people are mid-task.
- Feedback forms, the privacy policy, and the confirmation page.

### Adding or removing it

Add it to a page with one line above the footer, plus the script before
`</body>`:

```html
<div data-ep-newsletter data-source="page:whatever"></div>
<script src="newsletter-signup.js?v=1" defer></script>
```

Options: `data-variant="dark"` on an ink background, `data-variant="compact"` in
a sidebar, and `data-heading` / `data-sub` to override the wording on a
particular page. Removing it is just deleting those two lines.

If you change `newsletter-signup.js`, bump the `?v=1` across the site or browsers
will keep the old copy.

---

## How it fits together

```
form on the page
  → POST /.netlify/functions/newsletter-signup
      → Sender API: add subscriber to SENDER_NEWSLETTER_GROUP
          → Sender sends the confirmation, then runs the automation
```

The site never sends email and never stores an address — Sender owns both. The
function is at `netlify/functions/newsletter-signup.js`, kept separate from
`fof-talk-signup.js` on purpose: that one drives a working funnel and was not
worth the risk of sharing.

## If something breaks

**"Signup is temporarily unavailable"** — `SENDER_NEWSLETTER_GROUP` is missing,
or you set it but have not deployed since. It is set now, so this should not recur.

**"Something went wrong signing you up"** — Sender rejected the call. Netlify →
Functions → `newsletter-signup` → the logs carry Sender's own error. Usually an
expired API token or a group ID that no longer exists.

**Subscribes but no email** — the address is in the group but the automation is
not switched on. In Sender an automation stays in draft until you publish it.

**People say they never got the confirmation** — check spam first; that is nearly
always where it is. The success panel already tells them to look there and to
mark it "not spam".
