#!/usr/bin/env python3
"""Send the Fear of Falling talk follow-up (25% discount) email via Apple Mail.

Reads the Eventbrite-style attendee CSVs for the Foundry and Climbing Works
talks, dedupes by email address, and sends each unique attendee a personalised
plain-text follow-up with the right discount code for their event.

Defaults to a dry run (prints every email it *would* send). Nothing is sent
until you pass --send.

Usage:
    python3 scripts/send_fof_talk_followup.py                  # preview only
    python3 scripts/send_fof_talk_followup.py --test-email you@example.com --send
    python3 scripts/send_fof_talk_followup.py --send            # real send

The first real send will trigger a macOS prompt asking to allow this script
to control Mail.app — approve it once in System Settings > Privacy & Security
> Automation.
"""
import argparse
import csv
import subprocess
import sys
import tempfile
import time
from pathlib import Path

SENDER_ADDRESS = "fin.haley@expedition-psychology.com"
SUBJECT = "Your 25% discount ends this Wednesday"

SOURCES = {
    "foundry": {
        "label": "Foundry",
        "code": "FOUNDRYTALK25",
        "default_csv": "/Users/finhaley/Desktop/The_Fear_of_Falling_Talk_-_The_Foundry_Climbing_Center_Attendees_3011348034903_20260917_081917_238.csv",
    },
    "works": {
        "label": "Climbing Works",
        "code": "WORKSTALK25",
        "default_csv": "/Users/finhaley/Desktop/The_Fear_of_Falling_Talk_-_The_Climbing_Works_Attendees_3011348034903_20260910_103823_691.csv",
    },
}

BODY_TEMPLATE = """Hi {first_name},

I hope you’re doing well.

I just wanted to follow up after the Fear of Falling talk and remind you about the 25% discount on the Fear of Falling Toolkit.

If you were thinking about giving the programme a go, the discount code {code} expires this Wednesday, so this is the last chance to use the offer before it ends.

The toolkit is designed to help you take what we covered in the talk and actually put it into practice at the wall, with a structured programme of fall practice, psychological strategies, personalised exercises and progress tracking.

You can find the course here:
https://expedition-psychology.com/fear-of-falling

If you’d like a better idea of what’s included, we’ve also put together a short video explaining the programme:
https://www.youtube.com/watch?v=XVexM0NG50Q

And if you have any questions or you’re unsure whether the toolkit would be right for you, just reply to this email and I’d be happy to help.

Just remember to use {code} before the end of Wednesday if you’d like to get the 25% discount.

All the best,

Fin Haley
Co-Founder // Clinical Psychologist & Rock Climbing Instructor

Find out more on our website: www.expedition-psychology.com
Follow us on Instagram: @expedition_psychology
"""


def load_recipients(csv_path, code, seen):
    """Return a list of {email, first_name, code} dicts, deduped against `seen`."""
    recipients = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = (row.get("Attendee email") or "").strip()
            if not email or "@" not in email:
                continue
            key = email.lower()
            if key in seen:
                continue
            seen.add(key)
            first_name = (row.get("Attendee first name") or "").strip() or "there"
            recipients.append({"email": email, "first_name": first_name, "code": code})
    return recipients


def applescript_escape(value):
    return value.replace("\\", "\\\\").replace('"', '\\"')


def send_via_mail(subject, body_path, to_address, sender_address, bcc_address):
    bcc_line = ""
    if bcc_address:
        bcc_line = (
            f'        make new bcc recipient at end of bcc recipients '
            f'with properties {{address:"{applescript_escape(bcc_address)}"}}\n'
        )

    script = f'''
set bodyText to (read (POSIX file "{applescript_escape(str(body_path))}") as «class utf8»)
tell application "Mail"
    set newMsg to make new outgoing message with properties {{subject:"{applescript_escape(subject)}", content:bodyText, visible:false}}
    tell newMsg
        set sender to "{applescript_escape(sender_address)}"
        make new to recipient at end of to recipients with properties {{address:"{applescript_escape(to_address)}"}}
{bcc_line}    end tell
    send newMsg
end tell
'''
    subprocess.run(["osascript", "-"], input=script, text=True, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--send", action="store_true", help="Actually send via Mail.app. Without this flag, only previews.")
    parser.add_argument("--foundry-csv", default=SOURCES["foundry"]["default_csv"])
    parser.add_argument("--works-csv", default=SOURCES["works"]["default_csv"])
    parser.add_argument("--bcc", default=SENDER_ADDRESS, help="BCC address for each send. Pass '' to disable.")
    parser.add_argument("--test-email", help="Only send/preview a single test message to this address, using the first recipient's name/code.")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds to wait between sends (default 2s).")
    args = parser.parse_args()

    seen = set()
    all_recipients = []
    for key in ("foundry", "works"):
        src = SOURCES[key]
        csv_path = args.foundry_csv if key == "foundry" else args.works_csv
        for r in load_recipients(csv_path, src["code"], seen):
            all_recipients.append((r, src["label"]))

    if args.test_email:
        if not all_recipients:
            print("No recipients loaded from the CSVs — cannot build a test email.", file=sys.stderr)
            sys.exit(1)
        sample, label = all_recipients[0]
        all_recipients = [({**sample, "email": args.test_email}, f"TEST ({label} template)")]

    print(f"{len(all_recipients)} recipient(s) queued ({'SEND' if args.send else 'DRY RUN'}).\n")

    with tempfile.TemporaryDirectory() as tmpdir:
        for recipient, source in all_recipients:
            body = BODY_TEMPLATE.format(first_name=recipient["first_name"], code=recipient["code"])
            print("=" * 60)
            print(f"To: {recipient['email']}   [{source}, code={recipient['code']}]")
            print("-" * 60)
            print(f"Subject: {SUBJECT}\n")
            print(body)

            if args.send:
                body_path = Path(tmpdir) / "body.txt"
                body_path.write_text(body, encoding="utf-8")
                send_via_mail(SUBJECT, body_path, recipient["email"], SENDER_ADDRESS, args.bcc)
                print("[sent via Mail.app]")
                time.sleep(args.delay)

    if not args.send:
        print("\nDry run only — nothing was sent. Re-run with --send to actually send these emails.")


if __name__ == "__main__":
    main()
