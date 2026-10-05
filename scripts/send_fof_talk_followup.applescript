-- Fear of Falling talk follow-up mailer
--
-- Open this file in Script Editor and press Run (▶).
--
-- HOW TO USE:
--   1. First run: leave sendForReal = false. Open the log (View > Show Log,
--      or Cmd+Shift+I) before running, so you can see the dry-run preview.
--   2. Test for real: set sendForReal to true and testEmail to your own
--      address, then Run. Check the email that arrives (sender, formatting).
--   3. Full send: set testEmail back to "" and Run again. This sends to all
--      26 unique attendees (12 Foundry + 14 Climbing Works), pausing
--      `delaySeconds` between each, and BCCs bccAddress on every send.
--
-- The first real send will trigger a macOS prompt asking to let Script
-- Editor (or the saved app) control Mail — approve it.

property sendForReal : false
property testEmail : ""
property senderAddress : "fin.haley@expedition-psychology.com"
property bccAddress : "fin.haley@expedition-psychology.com"
property delaySeconds : 2

property foundryCSV : "/Users/finhaley/Desktop/The_Fear_of_Falling_Talk_-_The_Foundry_Climbing_Center_Attendees_3011348034903_20260917_081917_238.csv"
property worksCSV : "/Users/finhaley/Desktop/The_Fear_of_Falling_Talk_-_The_Climbing_Works_Attendees_3011348034903_20260910_103823_691.csv"
property foundryCode : "FOUNDRYTALK25"
property worksCode : "WORKSTALK25"
property emailSubject : "Your 25% discount ends this Wednesday"

property seenEmails : {}

on run
	set my seenEmails to {}
	set allRecipients to {}

	set allRecipients to allRecipients & my loadRecipients(foundryCSV, foundryCode, 1, 3, "Foundry")
	set allRecipients to allRecipients & my loadRecipients(worksCSV, worksCode, 2, 4, "Climbing Works")

	if testEmail is not "" then
		if (count of allRecipients) = 0 then
			display dialog "No recipients could be loaded from the CSVs, so there's no template to build a test email from." buttons {"OK"} default button "OK"
			return
		end if
		set firstRec to item 1 of allRecipients
		set allRecipients to {{theEmail:testEmail, theFirstName:(theFirstName of firstRec), theCode:(theCode of firstRec), theSource:"TEST"}}
	end if

	set modeLabel to "DRY RUN"
	if sendForReal then set modeLabel to "SENDING"
	log ((count of allRecipients) as text) & " recipient(s) — " & modeLabel

	repeat with rec in allRecipients
		set bodyText to my buildBody(theFirstName of rec, theCode of rec)
		my sendEmail(theEmail of rec, bodyText, theSource of rec, theCode of rec)
	end repeat

	set summary to ((count of allRecipients) as text) & " email(s) processed in " & modeLabel & " mode."
	if not sendForReal then set summary to summary & " Nothing was sent — check the log (View > Show Log) for the preview, then set sendForReal to true when ready."
	display dialog summary buttons {"OK"} default button "OK"
end run

-- Reads a CSV, returns a list of records for rows with a valid email not
-- already seen (across both files), and marks them seen.
on loadRecipients(csvPath, code, firstNameIndex, emailIndex, sourceLabel)
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
						set theFirstName to my trimText(item firstNameIndex of theFields)
						if theFirstName is "" then set theFirstName to "there"
						set end of outList to {theEmail:theEmail, theFirstName:theFirstName, theCode:code, theSource:sourceLabel}
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

on buildBody(firstName, code)
	set bodyLines to {"Hi " & firstName & ",", "", ¬
		"I hope you’re doing well.", "", ¬
		"I just wanted to follow up after the Fear of Falling talk and remind you about the 25% discount on the Fear of Falling Toolkit.", "", ¬
		"If you were thinking about giving the programme a go, the discount code " & code & " expires this Wednesday, so this is the last chance to use the offer before it ends.", "", ¬
		"The toolkit is designed to help you take what we covered in the talk and actually put it into practice at the wall, with a structured programme of fall practice, psychological strategies, personalised exercises and progress tracking.", "", ¬
		"You can find the course here:", ¬
		"https://expedition-psychology.com/fear-of-falling", "", ¬
		"If you’d like a better idea of what’s included, we’ve also put together a short video explaining the programme:", ¬
		"https://www.youtube.com/watch?v=XVexM0NG50Q", "", ¬
		"And if you have any questions or you’re unsure whether the toolkit would be right for you, just reply to this email and I’d be happy to help.", "", ¬
		"Just remember to use " & code & " before the end of Wednesday if you’d like to get the 25% discount.", "", ¬
		"All the best,", "", ¬
		"Fin Haley", ¬
		"Co-Founder // Clinical Psychologist & Rock Climbing Instructor", "", ¬
		"Find out more on our website: www.expedition-psychology.com", ¬
		"Follow us on Instagram: @expedition_psychology"}
	set AppleScript's text item delimiters to return
	set bodyText to bodyLines as text
	set AppleScript's text item delimiters to ""
	return bodyText
end buildBody

on sendEmail(toAddress, bodyText, sourceLabel, codeUsed)
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
		log "SENT to " & toAddress & "  [" & sourceLabel & ", " & codeUsed & "]"
		delay delaySeconds
	else
		log "DRY RUN — would send to " & toAddress & "  [" & sourceLabel & ", " & codeUsed & "]"
	end if
end sendEmail
