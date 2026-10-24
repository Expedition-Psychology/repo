#!/usr/bin/env python3
"""Builds the four-email Fear of Falling sequence (plus a discount variant).

Each email is written once, as structured blocks, and rendered to both HTML and
plain text from that single source — so the two can never drift apart.

Everything factual here comes from the live Toolkit page or the brief: £99
one-off, 24 video lessons, the app's exposure ladder, logging and progress
tracking, and three verbatim testimonials. Nothing is invented, no outcome is
promised, and fall practice is never described as risk-free.
"""
import html as _html
import pathlib
import re
import textwrap

SITE = pathlib.Path('/Users/finhaley/Website')
OUT = SITE / 'fear-of-falling-email-sequence'
BASE = 'https://expedition-psychology.com'
TOOLKIT = f'{BASE}/fear-of-falling'

# ── design tokens ────────────────────────────────────────────────────────
HEAD = "'arboria','Nunito',Arial,Helvetica,sans-serif"
BODY = "'Nunito',Arial,Helvetica,sans-serif"
INK, PINE, PAPER, OUTER = '#2e2e2e', '#4b7a6e', '#f3f3f0', '#e9e9e4'
TEXT, MUTED, RULE = '#4a4a4a', '#6b6b6b', '#e0e0da'

P    = f"margin:0 0 16px;font-family:{BODY};font-size:16px;line-height:26px;color:{TEXT};"
LEAD = f"margin:0 0 16px;font-family:{BODY};font-size:17px;line-height:28px;color:{INK};"
H2   = f"margin:32px 0 12px;font-family:{HEAD};font-size:21px;line-height:28px;font-weight:500;color:{INK};"


def cta_url(slug):
    return (f'{TOOLKIT}?utm_source=newsletter&amp;utm_medium=email'
            f'&amp;utm_campaign=fof-sequence&amp;utm_content={slug}')


# ── block renderers ──────────────────────────────────────────────────────
def strip(t):
    """HTML copy -> plain text."""
    t = re.sub(r'<br\s*/?>', '\n', t)
    return _html.unescape(re.sub(r'<[^>]+>', '', t))


def render_html(blocks):
    out = []
    for b in blocks:
        kind = b[0]
        if kind == 'lead':
            out.append(f'<p style="{LEAD}">{b[1]}</p>')
        elif kind == 'p':
            out.append(f'<p style="{P}">{b[1]}</p>')
        elif kind == 'h2':
            out.append(f'<p style="{H2}">{b[1]}</p>')
        elif kind == 'list':
            rows = ''.join(
                f'<tr>'
                f'<td valign="top" style="padding:0 10px 10px 0;font-family:{BODY};'
                f'font-size:16px;line-height:26px;color:{PINE};">&bull;</td>'
                f'<td valign="top" style="padding:0 0 10px;font-family:{BODY};'
                f'font-size:16px;line-height:26px;color:{TEXT};">{i}</td></tr>'
                for i in b[1])
            out.append('<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                       f'width="100%" style="margin:0 0 6px;">{rows}</table>')
        elif kind == 'panel':
            _, label, items = b
            rows = ''.join(
                f'<tr><td style="padding:0 0 16px;">'
                f'<p style="margin:0 0 4px;font-family:{HEAD};font-size:17px;line-height:24px;'
                f'font-weight:600;color:{INK};">{h}</p>'
                f'<p style="margin:0;font-family:{BODY};font-size:15px;line-height:24px;'
                f'color:{TEXT};">{s}</p></td></tr>' for h, s in items)
            lab = (f'<p style="margin:0 0 16px;font-family:{HEAD};font-size:12px;line-height:16px;'
                   f'letter-spacing:2px;text-transform:uppercase;color:{PINE};">{label}</p>'
                   if label else '')
            out.append(
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="background:#ffffff;border:1px solid {RULE};border-radius:14px;margin:0 0 20px;">'
                f'<tr><td style="padding:26px 28px 10px;">{lab}'
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'
                f'{rows}</table></td></tr></table>')
        elif kind == 'quotes':
            rows = ''.join(
                f'<tr><td style="padding:0 0 20px;">'
                f'<p style="margin:0 0 7px;font-family:{BODY};font-size:16px;line-height:25px;'
                f'color:{INK};">&ldquo;{q}&rdquo;</p>'
                f'<p style="margin:0;font-family:{HEAD};font-size:13px;line-height:18px;'
                f'font-weight:600;letter-spacing:.4px;color:{PINE};">{w}</p></td></tr>'
                for q, w in b[1])
            out.append(
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="background:#ffffff;border:1px solid {RULE};border-radius:14px;margin:0 0 20px;">'
                '<tr><td style="padding:26px 28px 6px;">'
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'
                f'{rows}</table></td></tr></table>')
        elif kind == 'image':
            _, src, alt, cap = b
            c = (f'<p style="margin:8px 0 0;font-family:{BODY};font-size:13px;line-height:20px;'
                 f'color:{MUTED};text-align:center;">{cap}</p>') if cap else ''
            out.append(
                f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="margin:4px 0 22px;"><tr><td align="center">'
                f'<img src="{BASE}/assets/img/email/seq/{src}" width="584" alt="{alt}" '
                f'style="display:block;width:100%;max-width:584px;height:auto;border:1px solid {RULE};'
                f'border-radius:12px;">{c}</td></tr></table>')
        elif kind == 'video':
            _, src, alt, cap, url = b
            out.append(
                f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="margin:4px 0 22px;"><tr><td align="center">'
                f'<a href="{url}" target="_blank">'
                f'<img src="{BASE}/assets/img/email/seq/{src}" width="584" alt="{alt}" '
                f'style="display:block;width:100%;max-width:584px;height:auto;border:1px solid {RULE};'
                f'border-radius:12px;"></a>'
                f'<p style="margin:10px 0 0;font-family:{BODY};font-size:13px;line-height:20px;'
                f'color:{MUTED};text-align:center;">'
                f'<a href="{url}" target="_blank" style="color:{PINE};text-decoration:none;'
                f'font-weight:600;">&#9654;&nbsp;{cap}</a></p>'
                f'</td></tr></table>')
        elif kind == 'note':
            out.append(
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="background:#eceae6;border-radius:14px;margin:4px 0 20px;">'
                f'<tr><td style="padding:20px 24px;"><p style="margin:0;font-family:{BODY};'
                f'font-size:15px;line-height:24px;color:{TEXT};">{b[1]}</p></td></tr></table>')
        elif kind == 'price':
            out.append(
                '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
                f'style="background:#ffffff;border:1px solid {RULE};border-radius:14px;margin:4px 0 22px;">'
                '<tr><td align="center" style="padding:24px 24px;">'
                f'<p style="margin:0 0 4px;font-family:{HEAD};font-size:30px;line-height:36px;'
                f'font-weight:600;color:{INK};">{b[1]}</p>'
                f'<p style="margin:0;font-family:{BODY};font-size:15px;line-height:23px;'
                f'color:{MUTED};">{b[2]}</p></td></tr></table>')
    return '\n              '.join(out)


def render_text(blocks, width=72):
    out = []
    wrap = lambda t: textwrap.fill(strip(t), width)
    for b in blocks:
        kind = b[0]
        if kind in ('lead', 'p'):
            out.append(wrap(b[1]))
        elif kind == 'h2':
            out.append(strip(b[1]).upper())
        elif kind == 'list':
            out.extend(textwrap.fill(strip(i), width, initial_indent='  - ',
                                     subsequent_indent='    ') for i in b[1])
        elif kind == 'panel':
            if b[1]:
                out.append(strip(b[1]).upper())
            for h, s in b[2]:
                out.append(textwrap.fill(f'{strip(h)} — {strip(s)}', width,
                                         initial_indent='  * ', subsequent_indent='    '))
        elif kind == 'quotes':
            for q, w in b[1]:
                out.append(textwrap.fill(f'"{strip(q)}"', width, initial_indent='  ',
                                         subsequent_indent='  ') + f'\n      — {strip(w)}')
        elif kind == 'image':
            out.append(f'[ {strip(b[2])} ]')
        elif kind == 'video':
            out.append(f'{strip(b[3])}\n  {b[4].replace("&amp;", "&")}')
        elif kind == 'note':
            out.append(wrap(b[1]))
        elif kind == 'price':
            out.append(f'{strip(b[1])} — {strip(b[2])}')
    return '\n\n'.join(out)


# ── page shell ───────────────────────────────────────────────────────────
def button(url, label):
    return f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr><td align="center" style="background:{PINE};border-radius:999px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{url}" style="height:52px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="{PINE}">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;">{label}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a href="{url}" style="display:inline-block;padding:17px 38px;font-family:{HEAD};font-size:14px;line-height:18px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#ffffff;text-decoration:none;">{label}</a>
                  <!--<![endif]-->
                </td></tr>
              </table>'''


def build(title, tag, h1, deck, preheader, blocks, cta_label, cta_href,
          cta_sub, signoff, hero=None, hero_alt=''):
    hero_row = ''
    if hero:
        hero_row = f'''
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <a href="{cta_href}"><img src="{BASE}/assets/img/email/seq/{hero}" width="640" alt="{hero_alt}" style="display:block;width:100%;max-width:640px;height:auto;border:0;"></a>
            </td>
          </tr>'''

    return f'''<!DOCTYPE html>
<html lang="en-GB" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<meta name="robots" content="noindex,nofollow">
<title>{title}</title>
<link rel="stylesheet" href="https://use.typekit.net/frv6yjh.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
<!--[if mso]>
<style>table,td,div,p,a,h1,span{{font-family:Arial,Helvetica,sans-serif !important;}}</style>
<![endif]-->
<style>
  body{{margin:0;padding:0;width:100%;background:{OUTER};}}
  table{{border-collapse:collapse;}}
  img{{border:0;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}}
  a{{color:#3a6056;}}
  @media only screen and (max-width:600px){{
    .container{{width:100% !important;}}
    .px{{padding-left:22px !important;padding-right:22px !important;}}
    .py{{padding-top:26px !important;}}
    .h1{{font-size:27px !important;line-height:33px !important;}}
    .btn a{{display:block !important;}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{OUTER};">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">{preheader}</span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{OUTER};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="container" style="width:100%;max-width:640px;background:{PAPER};border-radius:16px;overflow:hidden;">

          <tr>
            <td class="px" align="left" style="padding:14px 32px;background:#ffffff;">
              <a href="{BASE}"><img src="{BASE}/assets/img/logo-wordmark-black.png" width="140" alt="Expedition Psychology" style="display:block;width:140px;height:auto;max-width:140px;"></a>
            </td>
          </tr>{hero_row}

          <tr>
            <td class="px" style="padding:32px 40px 28px;background:{INK};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;"><tr><td style="background:{PINE};border-radius:8px;padding:6px 14px;font-family:{BODY};font-size:12px;line-height:16px;letter-spacing:2.5px;text-transform:uppercase;color:{PAPER};">{tag}</td></tr></table>
              <h1 class="h1" style="margin:0 0 14px;font-family:{HEAD};font-size:33px;line-height:40px;font-weight:500;color:#ffffff;">{h1}</h1>
              <p style="margin:0;font-family:{BODY};font-size:16px;line-height:26px;color:rgba(243,243,240,0.72);">{deck}</p>
            </td>
          </tr>

          <tr>
            <td class="px py" style="padding:34px 40px 10px;">
              {render_html(blocks)}
            </td>
          </tr>

          <tr>
            <td class="px btn" align="center" style="padding:14px 40px 36px;">
              {button(cta_href, cta_label)}
              <p style="margin:14px 0 0;font-family:{BODY};font-size:13px;line-height:20px;color:{MUTED};">{cta_sub}</p>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:0 40px 34px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid {RULE};">
                <tr><td style="padding-top:22px;font-family:{BODY};font-size:15px;line-height:24px;color:{INK};">
                  {signoff}<br><br>
                  All the best,<br>
                  <strong style="font-family:{HEAD};">Fin</strong><br>
                  <span style="font-size:13px;color:{MUTED};">Dr Fin Haley &middot; Clinical Psychologist &amp; Rock Climbing Instructor<br>Expedition Psychology</span>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" align="center" style="padding:24px 40px 30px;background:{INK};">
              <p style="margin:0 0 10px;font-family:{BODY};font-size:12px;line-height:18px;color:rgba(243,243,240,0.55);">Expedition Psychology &middot; <a href="{BASE}" style="color:rgba(243,243,240,0.75);">expedition-psychology.com</a></p>
              <p style="margin:0;font-family:{BODY};font-size:11px;line-height:17px;color:rgba(243,243,240,0.4);">You&#x27;re receiving this because you signed up for the free Fear of Falling talk. <a href="{{$unsubscribe_link}}" style="color:rgba(243,243,240,0.6);">Unsubscribe</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
'''


def plain(subject, preheader, h1, deck, blocks, cta_label, cta_href, cta_sub, signoff):
    url = cta_href.replace('&amp;', '&')
    return f'''{subject}
{preheader}

{'=' * 68}
{strip(h1).upper()}
{'=' * 68}

{textwrap.fill(strip(deck), 72)}

{render_text(blocks)}

{'-' * 68}
{strip(cta_label).upper()}
{url}
{strip(cta_sub)}
{'-' * 68}

{textwrap.fill(strip(signoff), 72)}

All the best,
Fin

Dr Fin Haley
Clinical Psychologist & Rock Climbing Instructor
Expedition Psychology
{BASE}

You're receiving this because you signed up for the free Fear of Falling
talk. Unsubscribe: {{$unsubscribe_link}}
'''


# ════════════════════════════ THE SEQUENCE ════════════════════════════
TESTIMONIALS = [
 ("Before the course, the gap between my top-rope and lead grade was three grades. "
  "Now it&rsquo;s half a grade.", "Nessa Cashmore"),
 ("Climbs I used to get mega pumped on earlier this season are now easy warm-ups, "
  "and I&rsquo;ve since climbed my hardest grade.", "Filippa Nordenson"),
 ("The videos are great &mdash; short, manageable and broken down into bite-sized chunks. "
  "I also love having a tangible workbook to work through.", "Kristina Fowler"),
]

EMAILS = []

# ───────────── EMAIL 2 · Day 2 ─────────────
EMAILS.append(dict(
 file='email-02-understanding-vs-doing',
 subject="Why knowing how to fall isn't always enough",
 title="Why knowing how to fall isn&rsquo;t always enough",
 tag='The Toolkit', slug='email-02',
 hero='e2-hero.jpg',
 hero_alt='A climber reaching for a hold on a lead route, with their belayer below',
 h1='Knowing it isn&rsquo;t the same as doing it',
 deck='You watched the talk, so the four strategies make sense on paper. '
      'What happens on the wall is a different question &mdash; and that gap is not a knowledge problem.',
 preheader='The gap between understanding your fear and climbing differently is structure, not information.',
 blocks=[
  ('lead', 'Thanks for watching the talk. I hope the four strategies landed.'),
  ('p', 'Here is the thing I see most often, and it has nothing to do with whether you understood them.'),
  ('p', 'You are two clips up. The next move is a long reach to a hold you cannot quite see, and the '
        'bolt is level with your hips. You know the fall is clean. You could probably explain, right '
        'now, exactly why your body is reacting the way it is.'),
  ('p', 'And you still shuffle your feet, chalk up twice, grip harder than the hold needs, and come down.'),
  ('h2', 'Why understanding does not transfer on its own'),
  ('p', 'Fear does not update because you have been told something is safe. It updates through repeated '
        'experience that the thing you braced for did not happen &mdash; at a level you can actually '
        'tolerate, often enough for the learning to stick.'),
  ('p', 'That is slow, specific work, and it is where most people stall. Not on the theory, but on the '
        'practicalities: which exercise, at what level, how often, and how you would know you were ready '
        'to step up.'),
  ('h2', 'Turning the principles into a plan'),
  ('p', 'That is what the Fear of Falling Toolkit is for. It takes the same ideas from the talk and '
        'builds them into a personalised programme &mdash; an exposure ladder set around what you '
        'actually find hard, exercises that fit inside a normal session, and a way to record what '
        'happened so the next step responds to you rather than a generic schedule.'),
  ('note', 'Fall practice always carries real risk. The Toolkit is about building up sensibly, within '
           'your own judgement and with a belayer you trust &mdash; not about pushing past it.'),
 ],
 cta_label='Explore the Toolkit', cta_sub='&pound;99 one-off &middot; lifetime access &middot; self-paced',
 signoff='If there is a particular situation that trips you up, reply and tell me what happens &mdash; '
         'I read every one.',
))

# ───────────── EMAIL 3 · Day 4 ─────────────
EMAILS.append(dict(
 file='email-03-what-progress-looks-like',
 subject='What does progress with fear of falling actually look like?',
 title='What progress actually looks like',
 tag='The Toolkit', slug='email-03',
 hero='e3-hero.jpg',
 hero_alt='A climber high on an indoor lead wall with their belayer at the base',
 h1='Progress rarely feels like progress',
 deck='Most climbers describe the goal as &ldquo;not being scared any more&rdquo;. '
      'That is usually the wrong target &mdash; and waiting for it is what keeps people stuck.',
 preheader='Progress is not the absence of fear. Here is what it actually tends to look like.',
 blocks=[
  ('lead', 'Almost everyone who comes to me describes the aim the same way: they want to stop feeling '
           'frightened.'),
  ('p', 'It is an understandable goal, and it is not what getting better looks like. Holding out for it '
        'tends to keep people exactly where they are.'),
  ('p', 'Fear is not a fault to be removed. On a lead wall it is frequently doing its job. What shifts '
        'with practice is not whether it turns up, but what you can do while it is there.'),
  ('h2', 'So what changes first'),
  ('list', [
    'Committing to the move instead of downclimbing to the last bolt.',
    'Settling within thirty seconds, rather than carrying it for the rest of the route.',
    'Choosing to practise falls on a session where you would previously have found a reason not to.',
    'Noticing your grip easing before your forearms are gone.',
  ]),
  ('p', 'None of these feels like a breakthrough at the time, which is exactly why they go unnoticed. '
        'You remember the sessions that felt bad.'),
  ('h2', 'Making small changes visible'),
  ('p', 'This is why the Toolkit asks you to rate and record what you do. An exposure ladder gives you '
        'rungs to measure against, and the logs turn a slow trend into something you can look at '
        '&mdash; which matters most on the weeks when nothing feels like it is moving.'),
  ('h2', 'From climbers who have worked through it'),
  ('quotes', TESTIMONIALS),
  ('p', 'Their experience will not be everyone&rsquo;s, and I would not claim otherwise. But structured '
        'practice gives you something to judge by other than how the last session felt.'),
 ],
 cta_label='Start making progress', cta_sub='&pound;99 one-off &middot; lifetime access &middot; self-paced',
 signoff='What would count as progress for you? Reply and tell me &mdash; it is usually a more useful '
         'question than it first sounds.',
))

# ───────────── EMAIL 4 · Day 7 ─────────────
EMAILS.append(dict(
 file='email-04-inside-the-toolkit',
 subject="Here's what's inside the Fear of Falling Toolkit",
 title='Inside the Fear of Falling Toolkit',
 tag='The Toolkit', slug='email-04',
 hero=None, hero_alt='',
 h1='What you actually get for &pound;99',
 deck='A structured, self-paced programme rather than another set of videos &mdash; '
      'here is what is in it, and how it fits around the climbing you already do.',
 preheader='24 video lessons, a personalised exposure ladder, and the logs that tell you when to step up.',
 blocks=[
  ('lead', 'You know what to work on. What is usually missing is a plan to follow, and something that '
           'tells you when you are ready for the next step.'),
  ('p', 'That is the whole design brief for the Toolkit. It is self-paced, yours to keep, and built to '
        'run alongside your normal sessions rather than replace them.'),
  ('h2', 'What is included'),
  ('panel', 'The programme', [
    ('24 video lessons', 'Short and specific, each with an interactive workbook built in.'),
    ('A personalised exposure hierarchy', 'Your ladder, built around what you actually find hard.'),
    ('Structured fall-practice exercises', 'Graded steps rather than a leap, with clear instructions.'),
    ('Goal setting', 'The direction you are working in, and the climber you want to be.'),
    ('Anxiety ratings and progress tracking', 'Rate how an exercise felt; the plan uses it to pace you.'),
    ('Reflective logs', 'So the small changes are recorded instead of forgotten.'),
    ('Cognitive and mindfulness skills', 'Practical attention and self-talk work, explained simply.'),
  ]),
  ('h2', 'Inside the app'),
  ('p', 'Rather than describe the interface, here is a walk through it &mdash; the lessons and their '
        'workbooks, the ladder, and how the logging actually works. It takes about three minutes.'),
  ('video', 'e4-video.jpg',
   'Play the video: Dr Fin Haley explaining what is inside the Fear of Falling Toolkit',
   'Watch: what the Toolkit is, in three minutes',
   'https://www.youtube.com/watch?v=XVexM0NG50Q&amp;t=33s'),
  ('h2', 'How a week actually runs'),
  ('panel', '', [
    ('Before the session', 'Ten minutes on a lesson and its workbook, then pick the exercise for today.'),
    ('At the wall', 'Work the rung you are on. It is designed to sit inside a normal session, not add one.'),
    ('Afterwards', 'Rate how it felt and note what happened. That rating is what paces the next step.'),
  ]),
  ('price', '&pound;99', 'One-off payment &middot; lifetime access &middot; no subscription'),
  ('h2', 'Why it is not just videos'),
  ('p', 'Information is the part you already have &mdash; the talk gave you that for nothing. What the '
        'Toolkit adds is sequence and feedback: a ladder built for you, a reason to do the next thing in '
        'a particular order, and a record that shows whether it is working.'),
  ('note', 'Written by Dr Fin Haley, a Clinical Psychologist and qualified Rock Climbing Instructor. '
           'Fall practice carries real risk; every exercise assumes your own judgement, a trusted '
           'belayer and a suitable wall.'),
 ],
 cta_label='Explore the full toolkit', cta_sub='&pound;99 one-off &middot; lifetime access',
 signoff='If you want to know whether it suits your particular situation, reply and ask. '
         'I would rather tell you it is not a fit than have you buy the wrong thing.',
))

# ───────────── EMAIL 5 · Day 10 ─────────────
E5_BLOCKS = [
  ('lead', 'You signed up for the talk because something about your climbing was not sitting right. '
           'Probably a route you keep not getting on, or a move you keep not committing to.'),
  ('p', 'That reason has not gone anywhere. The question is just whether this is the month you do '
        'something structured about it.'),
  ('p', 'Confidence is not something that arrives and then lets you climb. It is the residue of having '
        'done the thing, in manageable steps, enough times. Waiting to feel ready is the one approach '
        'that reliably does not work.'),
  ('h2', 'Three things people say to me'),
  ('panel', '', [
    ('&ldquo;I do not have the time.&rdquo;',
     'The exercises run inside sessions you are already climbing. There is no extra night out.'),
    ('&ldquo;I have tried fall practice before.&rdquo;',
     'Usually by jumping to the big version and bracing through it. A ladder is the difference: small, '
     'repeatable steps, in an order, with a record of what each one did.'),
    ('&ldquo;I am not sure it will work for me.&rdquo;',
     'I cannot promise it will, and I would be wary of anyone who did. What I can say is that it is '
     'self-paced, yours permanently, and backed by a money-back guarantee &mdash; if it is not right '
     'for you, we will make it right.'),
  ]),
  ('h2', 'What you would be starting'),
  ('list', [
    '24 video lessons with workbooks built in, at your own pace.',
    'An exposure ladder set around the situations you actually avoid.',
    'Fall-practice exercises in graded steps, not one leap.',
    'Ratings and logs, so you can see the trend rather than guess at it.',
  ]),
  ('price', '&pound;99', 'One-off payment &middot; lifetime access &middot; no subscription'),
]

EMAILS.append(dict(
 file='email-05-your-next-step',
 subject='Ready to start working on your fear of falling?',
 title='Your next step',
 tag='The Toolkit', slug='email-05',
 hero=None, hero_alt='',
 h1='Ready to start?',
 deck='You signed up for the talk for a reason. If that reason is still there, '
      'this is the part where it becomes something you are actually working on.',
 preheader='Self-paced, yours to keep, and designed to run inside the sessions you already climb.',
 blocks=E5_BLOCKS,
 cta_label='Get the Toolkit', cta_sub='&pound;99 one-off &middot; lifetime access &middot; self-paced',
 signoff='And if the answer is not now, that is genuinely fine &mdash; it is not going anywhere, and '
         'the tools from the talk work whether or not you ever buy anything.',
))

# ───────────── EMAIL 5 · discount variant ─────────────
EMAILS.append(dict(
 file='email-05-discount-variant',
 subject='Ready to start working on your fear of falling? ({{DISCOUNT_AMOUNT}} off)',
 title='Your next step',
 tag='The Toolkit', slug='email-05-discount',
 hero=None, hero_alt='',
 h1='Ready to start?',
 deck='You signed up for the talk for a reason. If that reason is still there, '
      'this is the part where it becomes something you are actually working on.',
 preheader='{{DISCOUNT_AMOUNT}} off until {{DISCOUNT_DEADLINE}} &mdash; self-paced, and yours to keep.',
 blocks=E5_BLOCKS[:-1] + [
   ('price', '&pound;99', 'One-off payment &middot; lifetime access &middot; no subscription'),
   ('note', '<strong>{{DISCOUNT_AMOUNT}} off until {{DISCOUNT_DEADLINE}}.</strong> '
            'Use the code <strong>{{DISCOUNT_CODE}}</strong> at checkout. '
            'Everything above is included either way &mdash; the price is the only thing that changes.'),
 ],
 cta_label='Get the Toolkit', cta_sub='Code {{DISCOUNT_CODE}} &middot; ends {{DISCOUNT_DEADLINE}}',
 signoff='And if the answer is not now, that is genuinely fine &mdash; it is not going anywhere, and '
         'the tools from the talk work whether or not you ever buy anything.',
))


# ════════════════════════════ WRITE ════════════════════════════
OUT.mkdir(exist_ok=True)
summary = []
for e in EMAILS:
    href = cta_url(e['slug'])
    html_doc = build(e['title'], e['tag'], e['h1'], e['deck'], e['preheader'], e['blocks'],
                     e['cta_label'], href, e['cta_sub'], e['signoff'], e['hero'], e['hero_alt'])
    txt_doc = plain(e['subject'], e['preheader'], e['h1'], e['deck'], e['blocks'],
                    e['cta_label'], href, e['cta_sub'], e['signoff'])
    (OUT / f"{e['file']}.html").write_text(html_doc, encoding='utf-8')
    (OUT / f"{e['file']}.txt").write_text(txt_doc, encoding='utf-8')
    words = len(re.findall(r"[A-Za-z0-9'&;]+", strip(' '.join(
        b[1] if isinstance(b[1], str) else ' '.join(map(str, b[1]))
        for b in e['blocks'] if b[0] in ('lead', 'p', 'h2', 'list', 'note')))))
    summary.append((e['file'], words, len(html_doc) // 1024))

for f, w, k in summary:
    print(f'  {f:<36} ~{w:>3} words   {k:>2}KB')
print(f'\n{len(EMAILS)} emails + plain-text versions -> {OUT}')
