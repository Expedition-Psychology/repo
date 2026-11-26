#!/usr/bin/env python3
"""The two Black Friday emails.

Both are generated from one template so the pair cannot drift apart. The
design is a single hero unit: the photograph has a gradient baked into its
lower third that fades to exactly the panel colour, so the image and the
dark offer panel beneath it read as one block rather than two stacked
rectangles. That trick needs no background images or overlays, so it holds
up in Outlook as well as anywhere else.
"""
import pathlib

SITE = pathlib.Path('/Users/finhaley/Website')
BASE = 'https://expedition-psychology.com'
INK = '#1c1c1c'
EMBER = '#c97a4a'
PINE = '#4b7a6e'
CODE = 'BLACKFRIDAY26'


def link(content):
    return (f'{BASE}/fear-of-falling?utm_source=newsletter&amp;utm_medium=email'
            f'&amp;utm_campaign=black-friday-2026&amp;utm_content={content}')


def plain(content):
    return link(content).replace('&amp;', '&')


EMAILS = [
    dict(
        slug='teaser',
        title='Tomorrow: 25% off the Fear of Falling Toolkit',
        subject='Tomorrow: 25% off the Fear of Falling Toolkit',
        preheader='Four days, one code, 25% off. Nothing to do tonight.',
        eyebrow='Black Friday &middot; Tomorrow',
        eyebrow_txt='BLACK FRIDAY - TOMORROW',
        h1='25% off the Toolkit.<br>From tomorrow.',
        h1_txt='25% OFF THE TOOLKIT. FROM TOMORROW.',
        lede=('A heads-up so it does not slip past you. The code opens tomorrow morning '
              'and closes at the end of Cyber Monday.'),
        price_label='25% off &middot; from tomorrow',
        price_label_txt='25% OFF - FROM TOMORROW',
        code_style='dashed',
        cta='Look round the Toolkit',
        cta_content='teaser-cta',
        undercta='Nothing to buy tonight &mdash; the code opens in the morning',
        undercta_txt='Nothing to buy tonight - the code opens in the morning.',
        signoff=('I&rsquo;ll send the code again tomorrow when it goes live. '
                 'Any questions about whether it fits your climbing, just reply.'),
        signoff_txt=('I\'ll send the code again tomorrow when it goes live. Any questions about\n'
                     'whether it fits your climbing, just reply.'),
        legal=('%s takes 25%% off the Fear of Falling Toolkit. Valid from Friday 27 November '
               'until the end of Monday 30 November 2026. One use per customer, and it cannot be '
               'combined with another discount code.' % CODE),
    ),
    dict(
        slug='live',
        title='25% off the Fear of Falling Toolkit — live now',
        subject='25% off the Fear of Falling Toolkit - live now',
        preheader='Code BLACKFRIDAY26. GBP 99 down to GBP 74.25, until Cyber Monday.',
        eyebrow='Black Friday &middot; Live now',
        eyebrow_txt='BLACK FRIDAY - LIVE NOW',
        h1='It&rsquo;s on.<br>25% off the Toolkit.',
        h1_txt='IT\'S ON. 25% OFF THE TOOLKIT.',
        lede=('The code is open. It stays open all weekend and closes at the end of '
              'Cyber Monday, Monday 30 November.'),
        price_label='25% off &middot; until Cyber Monday',
        price_label_txt='25% OFF - UNTIL CYBER MONDAY',
        code_style='solid',
        cta='Get the Toolkit for &pound;74.25',
        cta_content='friday-cta',
        undercta='Code %s &middot; closes end of Monday 30 November' % CODE,
        undercta_txt='Code %s - closes end of Monday 30 November.' % CODE,
        signoff=('Four days is long enough to think about it properly. If you are not sure it '
                 'fits your climbing, reply and ask me &mdash; I would rather you waited than '
                 'bought something that was wrong for you.'),
        signoff_txt=('Four days is long enough to think about it properly. If you are not sure it\n'
                     'fits your climbing, reply and ask me - I would rather you waited than bought\n'
                     'something that was wrong for you.'),
        legal=('%s takes 25%% off the Fear of Falling Toolkit. Valid until the end of '
               'Monday 30 November 2026. One use per customer, and it cannot be combined with '
               'another discount code.' % CODE),
    ),
]

POINTS = [
    '21 chapters and 24 video lessons, each with an interactive workbook built in.',
    'Fall-practice and exposure exercises in graded steps, built into the climbing you already do.',
    'A reflective log that tracks your fear over time and tells you when you are ready to move on.',
    'One payment, and it stays yours. No subscription.',
]

NUNITO = "'Nunito',Arial,Helvetica,sans-serif"
ARBORIA = "'arboria','Nunito',Arial,Helvetica,sans-serif"

TPL = '''<!DOCTYPE html>
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
  body{{margin:0;padding:0;width:100%;background:#e6e6e1;}}
  table{{border-collapse:collapse;}}
  img{{border:0;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}}
  a{{color:#3a6056;}}
  @media only screen and (max-width:600px){{
    .container{{width:100% !important;}}
    .px{{padding-left:24px !important;padding-right:24px !important;}}
    .h1{{font-size:30px !important;line-height:36px !important;}}
    .price{{font-size:44px !important;line-height:50px !important;}}
    .btn a{{display:block !important;}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:#e6e6e1;">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">{preheader}</span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#e6e6e1;">
    <tr>
      <td align="center" style="padding:30px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="container" style="width:100%;max-width:640px;background:#f3f3f0;border-radius:18px;overflow:hidden;">

          <tr><td style="height:3px;line-height:3px;font-size:0;background:{ember};">&nbsp;</td></tr>

          <tr>
            <td align="center" style="padding:22px 40px 20px;background:#ffffff;">
              <a href="{base}"><img src="{base}/assets/img/logo-wordmark-black.png" width="132" alt="Expedition Psychology" style="display:block;width:132px;height:auto;max-width:132px;"></a>
            </td>
          </tr>

          <!-- Hero: the photo's lower third already fades to {ink}, so the panel
               below continues it with no visible join. -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;background:{ink};">
              <a href="{hero_link}"><img src="{base}/assets/img/email/bf-hero.jpg" width="640" alt="A climber lowering off at an indoor wall, seen from above" style="display:block;width:100%;max-width:640px;height:auto;"></a>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:4px 44px 40px;background:{ink};">
              <p style="margin:0 0 18px;font-family:{nunito};font-size:11.5px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:{ember};">{eyebrow}</p>
              <h1 class="h1" style="margin:0 0 16px;font-family:{arboria};font-size:36px;line-height:43px;font-weight:500;color:#ffffff;letter-spacing:-0.5px;">{h1}</h1>
              <p style="margin:0 0 30px;font-family:{nunito};font-size:16.5px;line-height:27px;color:rgba(243,243,240,0.62);max-width:30em;">{lede}</p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid rgba(243,243,240,0.14);border-bottom:1px solid rgba(243,243,240,0.14);">
                <tr>
                  <td style="padding:24px 0 22px;">
                    <p style="margin:0 0 12px;font-family:{nunito};font-size:11px;line-height:15px;letter-spacing:2.6px;text-transform:uppercase;color:rgba(243,243,240,0.45);">{price_label}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                      <td valign="bottom" style="padding:0 16px 0 0;font-family:{arboria};font-size:52px;line-height:52px;font-weight:600;color:#ffffff;" class="price">&pound;74.25</td>
                      <td valign="bottom" style="padding:0 0 7px;font-family:{nunito};font-size:16px;line-height:22px;color:rgba(243,243,240,0.5);"><span style="text-decoration:line-through;">&pound;99</span>&nbsp;&nbsp;save &pound;24.75</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;"><tr>
                <td style="{code_css}font-family:{arboria};font-size:20px;line-height:24px;font-weight:600;letter-spacing:3px;color:#ffffff;">{code}</td>
              </tr></table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="margin:26px 0 0;"><tr>
                <td align="center" style="background:{pine};border-radius:999px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{cta_link}" style="height:54px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="{pine}">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;">{cta_plain}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a href="{cta_link}" style="display:inline-block;padding:18px 40px;font-family:{arboria};font-size:14px;line-height:18px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">{cta}</a>
                  <!--<![endif]-->
                </td>
              </tr></table>
              <p style="margin:14px 0 0;font-family:{nunito};font-size:13px;line-height:20px;color:rgba(243,243,240,0.42);">{undercta}</p>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:38px 44px 8px;">
              <p style="margin:0 0 6px;font-family:{nunito};font-size:11px;line-height:15px;letter-spacing:2.6px;text-transform:uppercase;color:{ember};">The Fear of Falling Toolkit</p>
              <p style="margin:0 0 22px;font-family:{arboria};font-size:23px;line-height:31px;font-weight:500;color:#2e2e2e;letter-spacing:-0.2px;">A step-by-step programme for retraining the fear &mdash; not a training plan.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
{points}              </table>
              <p style="margin:24px 0 0;font-family:{nunito};font-size:15px;line-height:25px;color:#6b6b6b;">Built by Dr Fin Haley, a chartered clinical psychologist and rock climbing instructor, with Mammut and The Foundry Climbing Centre. Taught indoors; the skills carry over to outdoor sport climbing with the appropriate risk assessment. <a href="{body_link}" style="color:#3a6056;">See the full page</a> &mdash; there is a free chapter and a recorded talk on it.</p>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:30px 44px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e0e0da;">
                <tr><td style="padding-top:24px;font-family:{nunito};font-size:15px;line-height:25px;color:#4a4a4a;">
                  {signoff}<br><br>
                  All the best,<br>
                  <strong style="font-family:{arboria};color:#2e2e2e;">Fin</strong><br>
                  <span style="font-size:13px;color:#8a8a84;">Dr Fin Haley &middot; Clinical Psychologist &amp; Rock Climbing Instructor<br>Expedition Psychology</span>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" align="center" style="padding:26px 44px 32px;background:{ink};">
              <p style="margin:0 0 10px;font-family:{nunito};font-size:12px;line-height:18px;color:rgba(243,243,240,0.5);">Expedition Psychology &middot; <a href="{base}" style="color:rgba(243,243,240,0.7);">expedition-psychology.com</a></p>
              <p style="margin:0 0 10px;font-family:{nunito};font-size:11px;line-height:17px;color:rgba(243,243,240,0.35);">{legal}</p>
              <p style="margin:0;font-family:{nunito};font-size:11px;line-height:17px;color:rgba(243,243,240,0.35);">You&#x27;re receiving this because you signed up for emails from Expedition Psychology. <a href="{{$unsubscribe_link}}" style="color:rgba(243,243,240,0.55);">Unsubscribe</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
'''

POINT_ROW = ('                <tr>\n'
             '                  <td valign="top" width="26" style="padding:0 14px 14px 0;">'
             '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
             '<td style="width:18px;height:2px;line-height:2px;font-size:0;background:{ember};">&nbsp;</td>'
             '</tr></table></td>\n'
             '                  <td valign="top" style="padding:0 0 14px;font-family:{nunito};'
             'font-size:15.5px;line-height:25px;color:#4a4a4a;">{text}</td>\n'
             '                </tr>\n')

TXT = '''Subject: {subject}
Preheader: {preheader}

---

{eyebrow_txt}

{h1_txt}

{lede}

    {price_label_txt}

    GBP 99  ->  GBP 74.25   (save GBP 24.75)

    Code: {code}

{cta_txt}:
{cta_link}

{undercta_txt}

---

THE FEAR OF FALLING TOOLKIT

A step-by-step programme for retraining the fear - not a training plan.

{points_txt}

Built by Dr Fin Haley, a chartered clinical psychologist and rock climbing
instructor, with Mammut and The Foundry Climbing Centre. Taught indoors; the
skills carry over to outdoor sport climbing with the appropriate risk
assessment. See the full page - there is a free chapter and a recorded talk
on it:
{body_link}


{signoff_txt}

All the best,
Fin

Dr Fin Haley
Clinical Psychologist & Rock Climbing Instructor
Expedition Psychology
{base}

---

{legal_txt}

You're receiving this because you signed up for emails from Expedition
Psychology. Unsubscribe: {{$unsubscribe_link}}
'''


def wrap(text, width=78, indent=''):
    words, lines, cur = text.split(), [], indent
    for w in words:
        if len(cur) + len(w) + 1 > width and cur.strip():
            lines.append(cur.rstrip())
            cur = indent + w + ' '
        else:
            cur += w + ' '
    lines.append(cur.rstrip())
    return '\n'.join(lines)


def bullet(text, width=76):
    """A wrapped list item whose continuation lines hang under the text,
    not under the asterisk."""
    body = wrap(strip_ents(text), width - 2)
    return '\n'.join(('* ' if i == 0 else '  ') + l for i, l in enumerate(body.split('\n')))


def strip_ents(s):
    for a, b in [('&middot;', '-'), ('&mdash;', '-'), ('&rsquo;', "'"), ('&pound;', 'GBP '),
                 ('&amp;', '&'), ('<br>', ' '), ('&nbsp;', ' ')]:
        s = s.replace(a, b)
    return s


for e in EMAILS:
    code_css = ('border:1.5px dashed rgba(243,243,240,0.4);border-radius:10px;padding:13px 24px;'
                if e['code_style'] == 'dashed'
                else 'background:%s;border-radius:10px;padding:14px 26px;' % EMBER)

    points = ''.join(POINT_ROW.format(ember=EMBER, nunito=NUNITO, text=p) for p in POINTS)

    html = TPL.format(
        title=e['title'], preheader=e['preheader'], base=BASE, ink=INK, ember=EMBER, pine=PINE,
        nunito=NUNITO, arboria=ARBORIA, eyebrow=e['eyebrow'], h1=e['h1'], lede=e['lede'],
        price_label=e['price_label'], code=CODE, code_css=code_css,
        cta=e['cta'], cta_plain=strip_ents(e['cta']), cta_link=link(e['cta_content']),
        hero_link=link(e['slug'] + '-image'), body_link=link(e['slug'] + '-body'),
        undercta=e['undercta'], points=points, signoff=e['signoff'], legal=e['legal'],
    )
    (SITE / ('email-black-friday-%s.html' % e['slug'])).write_text(html, encoding='utf-8')

    txt = TXT.format(
        subject=e['subject'], preheader=wrap(e['preheader']), eyebrow_txt=e['eyebrow_txt'],
        h1_txt=e['h1_txt'], lede=wrap(strip_ents(e['lede'])), price_label_txt=e['price_label_txt'],
        code=CODE, cta_txt=strip_ents(e['cta']).upper(), cta_link=plain(e['cta_content']),
        undercta_txt=wrap(strip_ents(e['undercta_txt'])),
        points_txt='\n\n'.join(bullet(p) for p in POINTS),
        body_link=plain(e['slug'] + '-body'), signoff_txt=e['signoff_txt'],
        legal_txt=wrap(strip_ents(e['legal'])), base=BASE,
    )
    (SITE / ('email-black-friday-%s.txt' % e['slug'])).write_text(txt, encoding='utf-8')
    print('wrote email-black-friday-%s.html / .txt' % e['slug'])
