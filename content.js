const familiarEmails = new Set();


async function getFamiliarEmails()
{
	for (const key of Object.keys(await chrome.storage.sync.get())) {
		// Get email from key or skip
		const match = key.match(/^familiar:(.*)/);
		if (match === null)
			continue;
		const email = match[1];

		familiarEmails.add(email);
	}
}


function changeStyling(element, email)
{
	if (emailIsFamiliar(email)) {
		element.classList.remove('familiarEmailsExtensionUnfamiliar');
		element.classList.add('familiarEmailsExtensionFamiliar');
	}
	else {
		element.classList.remove('familiarEmailsExtensionFamiliar');
		element.classList.add('familiarEmailsExtensionUnfamiliar');
	}
}


function emailIsFamiliar(email)
{
	// Emails are case-insensitive
	email = toLowerCase();

	// Return true if the email is simply in the set
	if (familiarEmails.has(email))
		return true;

	// Return false if failed to parse the email with @
	const emailParts = email.split('@');
	const username = emailParts[0];
	const hostname = emailParts[1];
	if (!hostname)
		return false;

	// Return false if failed to parse the hostname with .
	const hostnameParts = hostname.split('.');
	if (hostnameParts.length < 2)
		return false;

	// Create subdivisions with the wildcard(s) of the hostname
	const hostnameSubdivisions = [hostname];
	for (let i = hostnameParts.length - 2; i >= 0; i--) {
		const wildcardParts = ['*'];
		for (let j = i; j < hostnameParts.length; j++)
			wildcardParts.push(hostnameParts[j]);
		hostnameSubdivisions.push(wildcardParts.join('.'));
	}

	// Return true if a matching wildcard is in the set
	for (const hostnameSubdivision of hostnameSubdivisions)
		if (familiarEmails.has(`${username}@${hostnameSubdivision}`) ||
			familiarEmails.has(`*@${hostnameSubdivision}`))
			return true;

	return false;
}


function showFamiliarEmailsForGmail()
{
	// Iterate over elements with emails
	for (const element of document.querySelectorAll('span[email]')) {
		// Get email from attribute or skip
		const email = element.getAttribute('email');
		if (email === null)
			continue;

		changeStyling(element, email);
	}
}


async function main()
{
	await getFamiliarEmails();

	// Run the function frequently
	window.onpopstate = showFamiliarEmailsForGmail;
	const _ = setInterval(showFamiliarEmailsForGmail, 1000);
	document.body.onclick = showFamiliarEmailsForGmail;
}

main();
