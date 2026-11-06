-- Fear of Falling Toolkit launch mailer (15% off, code LAUNCH15)
--
-- Open this file in Script Editor and press Run (▶).
--
-- HOW TO USE:
--   1. First run: leave sendForReal = false. Open the log (View > Show Log,
--      or Cmd+Shift+I) before running, so you can see the dry-run preview.
--   2. Test for real: set sendForReal to true and testEmail to your own
--      address, then Run. Check the email that arrives (sender, formatting).
--   3. Full send: set testEmail back to "" and Run again. This sends to all
--      235 unique recipients in the CSV, pausing `delaySeconds` between each,
--      and BCCs bccAddress on every send.
--
-- Note: 235 individual sends from one Mail account in one sitting is a real
-- volume. The delay below is set higher than the smaller talk-followup
-- script to go easier on the mail provider — if you see bounces or a
-- "sending too fast" warning partway through, stop and increase delaySeconds
-- before resuming (it's safe to re-run: already-sent addresses aren't
-- tracked, so re-running from scratch would re-send everyone — see note in
-- loadRecipients if you need to resume a partial send).
--
-- The first real send will trigger a macOS prompt asking to let Script
-- Editor (or the saved app) control Mail — approve it.

property sendForReal : false
property testEmail : ""
property senderAddress : "fin.haley@expedition-psychology.com"
property bccAddress : "fin.haley@expedition-psychology.com"
property delaySeconds : 4

property recipientsCSV : "/Users/finhaley/Desktop/fof_launch_recipients.csv"
property discountCode : "LAUNCH15"
property emailSubject : "15% off ends tomorrow — Fear of Falling Toolkit"

property seenEmails : {}

on run
	set my seenEmails to {}
	set allRecipients to my loadRecipients(recipientsCSV, 1, 2)

	if testEmail is not "" then
		if (count of allRecipients) = 0 then
			display dialog "No recipients could be loaded from the CSV, so there's no template to build a test email from." buttons {"OK"} default button "OK"
			return
		end if
		set firstRec to item 1 of allRecipients
		set allRecipients to {{theEmail:testEmail, theFirstName:(theFirstName of firstRec)}}
	end if

	set modeLabel to "DRY RUN"
	if sendForReal then set modeLabel to "SENDING"
	log ((count of allRecipients) as text) & " recipient(s) — " & modeLabel

	repeat with rec in allRecipients
		set bodyText to my buildBody(theFirstName of rec)
		my sendEmail(theEmail of rec, bodyText)
	end repeat

	set summary to ((count of allRecipients) as text) & " email(s) processed in " & modeLabel & " mode."
	if not sendForReal then set summary to summary & " Nothing was sent — check the log (View > Show Log) for the preview, then set sendForReal to true when ready."
	display dialog summary buttons {"OK"} default button "OK"
end run

-- Reads the CSV (email, first_name, send_from), ignoring send_from — every
-- email is sent from senderAddress regardless of what the CSV says. Dedupes
-- by email (the source list had none duplicated, but this guards future
-- reruns/edits).
on loadRecipients(csvPath, emailIndex, firstNameIndex)
	set outList to {}
	set fileContents to (read (POSIX file csvPath) as «class utf8»)
	set theLines to paragraphs of fileContents
	set isFirstLine to true
	repeat with theLine in theLines
		set theLine to theLine as text
		if isFirstLine then
			set isFirstLine to false
		else if (length of theLine) > 0 then
			set AppleScript's text item delimiters to ","
			set theFields to text items of theLine
			set AppleScript's text item delimiters to ""
			if (count of theFields) ≥ emailIndex then
				set theEmail to my trimText(item emailIndex of theFields)
				if theEmail contains "@" then
					if theEmail is not in my seenEmails then
						set end of my seenEmails to theEmail
						set theFirstName to ""
						if (count of theFields) ≥ firstNameIndex then set theFirstName to my trimText(item firstNameIndex of theFields)
						if theFirstName is "" then set theFirstName to "there"
						set end of outList to {theEmail:theEmail, theFirstName:theFirstName}
					end if
				end if
			end if
		end if
	end repeat
	return outList
end loadRecipients

on trimText(t)
	set t to t as text
	repeat while t starts with " "
		set t to text 2 thru -1 of t
	end repeat
	repeat while t ends with " "
		set t to text 1 thru -2 of t
	end repeat
	return t
end trimText

on buildBody(firstName)
	set bodyLines to {"Hi " & firstName & ",", "", ¬
		"It’s Fin from Expedition Psychology.", "", ¬
		"A month ago, you signed up to hear more about our programme for climbers looking to overcome their fear of falling, so I wanted to let you know that the Fear of Falling Toolkit is now live.", "", ¬
		"We’re offering 15% off the full toolkit, but the discount expires tomorrow.", "", ¬
		"Use code " & discountCode & " at checkout to claim the discount.", "", ¬
		"The toolkit is designed to give you a structured way to work on your fear at your own pace. It includes:", "", ¬
		"- Step-by-step video lessons.", ¬
		"- Practical psychological strategies.", ¬
		"- Personal goals, progress tracking and reflective tools.", "", ¬
		"If you complete the toolkit and don’t notice a meaningful change in your climbing, we offer a money-back guarantee.", "", ¬
		"You can watch a short video explaining how the toolkit works here:", ¬
		"https://www.youtube.com/watch?v=XVexM0NG50Q&t=1s", ¬
		"And you can access the Fear of Falling Toolkit here:", ¬
		"https://expedition-psychology.com/fear-of-falling", "", ¬
		"If you have any questions about the programme or want to know whether it might be right for you, feel free to reply to this email.", "", ¬
		"All the best,", "", ¬
		"Fin Haley", ¬
		"Expedition Psychology"}
	set AppleScript's text item delimiters to return
	set bodyText to bodyLines as text
	set AppleScript's text item delimiters to ""
	return bodyText
end buildBody

on sendEmail(toAddress, bodyText)
	if sendForReal then
		tell application "Mail"
			set newMsg to make new outgoing message with properties {subject:emailSubject, content:bodyText, visible:false}
			tell newMsg
				set sender to senderAddress
				make new to recipient at end of to recipients with properties {address:toAddress}
				if bccAddress is not "" then
					make new bcc recipient at end of bcc recipients with properties {address:bccAddress}
				end if
			end tell
			send newMsg
		end tell
		log "SENT to " & toAddress
		delay delaySeconds
	else
		log "DRY RUN — would send to " & toAddress
	end if
end sendEmail
