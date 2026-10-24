# Newsletter signup — setup

The signup box is live on 32 pages. **It will not work until you do step 1**,
and until then anyone who tries gets "Signup is temporarily unavailable."
It is a one-line change, so do it first.

---

## 1. Create the group and point the site at it

**In Sender:** Subscribers → Groups → **Create group**. Call it something you
will recognise in a year — `Newsletter` is fine.

Open the group. The ID is the string in the browser's address bar after
`/groups/` — something like `eB1jKd`. (It is also under the group's
**Settings**.)

**Then add it to Netlify.** Either paste it into Site settings → Environment
variables as `SENDER_NEWSLETTER_GROUP`, or run:

```bash
netlify env:set SENDER_NEWSLETTER_GROUP "your-group-id-here"
```

Environment variables only take effect on a new deploy, so trigger one:

```bash
netlify deploy --build --prod
```

`SENDER_API_TOKEN` is already set from the free-talk funnel — the newsletter
reuses it. You do not need a second token.

---

## 2. Decide on double opt-in

The site currently assumes **double opt-in** — after someone subscribes it tells
them to look for a confirmation link, and warns them to check spam.

**I would keep it.** It is what your free-talk funnel already does, and given the
deliverability trouble you have had, a list where every address has actively
confirmed is worth more than a bigger list that gets you filtered. The cost is
real though: some people never click, and you lose them.

**If you switch that group to single opt-in in Sender**, tell the site, or it
will keep promising a confirmation email that never arrives:

```bash
netlify env:set SENDER_NEWSLETTER_CONFIRM "false"
```

The success message changes to "You're on the list" instead.

---

## 3. Automate the emails

You have the articles written as emails already, in `article-emails.html`. Two
ways to send them, and they do different jobs:

### A drip, so everyone gets the series from the start — recommended

Automations → **Create automation** → trigger **Subscriber added to a group** →
pick your newsletter group.

Then alternate steps:

```
Trigger: subscriber added to Newsletter
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
or you set it but have not deployed since.

**"Something went wrong signing you up"** — Sender rejected the call. Netlify →
Functions → `newsletter-signup` → the logs carry Sender's own error. Usually an
expired API token or a group ID that no longer exists.

**Subscribes but no email** — the address is in the group but the automation is
not switched on. In Sender an automation stays in draft until you publish it.

**People say they never got the confirmation** — check spam first; that is nearly
always where it is. The success panel already tells them to look there and to
mark it "not spam".
