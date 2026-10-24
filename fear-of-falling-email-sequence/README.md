# Fear of Falling — post-talk email sequence

Four emails (plus one variant) sent to people who signed up for the free Fear of
Falling talk, taking them from "that made sense" to buying the £99 Toolkit.

They are written as one argument split across ten days, not four separate
adverts. Each one hands off to the next:

| | Day | Subject | The job it does |
|---|---|---|---|
| **2** | 2 | Why knowing how to fall isn't always enough | Names the gap: you understood the talk and still came down. Reframes it as a structure problem, not a knowledge problem. |
| **3** | 4 | What does progress with fear of falling actually look like? | Resets the goal. Progress isn't the absence of fear — so here is what it is, and why you need a record to see it. |
| **4** | 7 | Here's what's inside the Fear of Falling Toolkit | Answers "what do I actually get for £99", with real screenshots and a week in practice. |
| **5** | 10 | Ready to start working on your fear of falling? | Closes. Reconnects with why they signed up, handles the three objections, asks. |

Email 2 raises the problem, 3 redefines what solving it looks like, 4 shows the
mechanism, 5 asks. Nothing is repeated between them: the exposure ladder is
introduced in 2, justified in 3, shown in 4 and summarised in 5.

## Files

```
email-02-understanding-vs-doing.html / .txt
email-03-what-progress-looks-like.html / .txt
email-04-inside-the-toolkit.html / .txt
email-05-your-next-step.html / .txt
email-05-discount-variant.html / .txt
```

Each `.txt` is the plain-text alternative for the matching `.html`. Both are
generated from the same source copy, so they cannot drift apart — if you edit
one by hand, edit the other.

## Sending

Paste the HTML file's source into your ESP's custom-HTML editor and the `.txt`
into its plain-text field. In Sender this is one automation off the talk-signup
group, with Delay steps of 2, 2 and 3 days between the emails.

- **Leave `{$unsubscribe_link}` in place.** It is Sender's tag; Sender refuses
  to send without it. Swap it if you move platform.
- **Suppress existing Toolkit customers.** Nobody who has already bought should
  receive emails 4 or 5. If purchasers are not yet in their own group, set that
  up before the first send.
- **Subject lines and preheaders** are in the first two lines of each `.txt`.

## Images

All images use absolute `https://expedition-psychology.com` URLs, so they
resolve in any client. They live in `assets/img/email/seq/` and must stay
deployed for as long as the sequence is in use — deleting them breaks every
email already sitting in someone's inbox.

The product shots in email 4 are genuine captures of the Toolkit: the dashboard,
the training-goals screen, the fear-rating log, and the lesson syllabus. If the
interface changes, re-capture them rather than letting them go stale.

## The discount variant

`email-05-discount-variant.html` is email 5 with a discount block, for if you
ever want to run one. **It contains placeholders, not a real offer**, because
you removed the launch discount from the Toolkit page deliberately and I was not
going to invent terms:

```
{{DISCOUNT_AMOUNT}}     e.g. "£20" or "20%"
{{DISCOUNT_CODE}}       e.g. "CLIMB20"
{{DISCOUNT_DEADLINE}}   e.g. "Sunday 9 November"
```

Find and replace all three before sending, and check the code actually exists at
checkout. If you are not running a discount, delete this file so it cannot be
sent by accident.

## What's verified, and what isn't

Everything factual is taken from the live Toolkit page or your brief:

- £99 one-off, lifetime access, no subscription.
- 24 video lessons with workbooks built in.
- The exposure ladder, fall-practice exercises, goal setting, anxiety ratings,
  progress tracking, reflective logs, cognitive and mindfulness skills.
- The three testimonials in email 3 are verbatim from the Toolkit page —
  Nessa Cashmore, Filippa Nordenson, Kristina Fowler. No testimonial is invented
  or paraphrased.
- The money-back guarantee in email 5 is worded exactly as your sales page
  words it: "if it is not right for you, we will make it right." No refund
  window is stated, because the page does not state one. **If you have defined
  terms, add them** — a specific guarantee converts better than a vague one.

Deliberately avoided: any promise that the reader will overcome their fear, any
clinical claim beyond "this is how exposure works", and any suggestion that fall
practice is risk-free. Emails 2 and 4 say plainly that it carries real risk and
assumes your own judgement, a trusted belayer and a suitable wall.

## Checks already run

- HTML is well-formed in all five; no unclosed tags.
- Table-based layout, inline CSS, with a bulletproof VML button for Outlook.
- Responsive at 375px: container fills, headline drops to 27px, padding tightens,
  CTA goes full-width, no horizontal overflow.
- Every image has descriptive alt text and an absolute URL; every link is
  absolute. Total image weight is under 130KB per email.
- `color-scheme: light` is declared to stop dark-mode clients inverting the
  palette.
- Word counts (body, excluding header and footer): 320 / 360 / 397 / 306.
  Email 3 includes ~55 words of testimonial; email 4 is longest by design.

## Design system

Shared across all five so they read as one sequence: 640px container, white
logo bar, ink `#2e2e2e` headline band with a pine `#4b7a6e` tag, `#f3f3f0` body,
Arboria headings over Nunito body text, white feature cards with a 14px radius,
and a pine pill CTA. They stay distinct through structure rather than colour —
2 and 3 carry a photograph, 4 carries product screenshots and a price block,
5 is a plain letter with no image above the fold.

To change the design once for all five, edit the generator rather than the five
files: `_generator.py`, kept alongside these files.
