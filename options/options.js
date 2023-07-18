// Links

// Main click, other click, and keypress
function clickAndKeypress(el, fn)
{
	el.onclick = fn;
	el.onauxclick = fn;
	el.onkeypress = fn;
}

// Link: Keyboard shortcuts
async function keyboardShortcuts(e)
{
	// Skip other keys or right click
	if ((e.code && e.code !== 'Enter') || e.button === 2)
		return;

	// Tab createData
	const url = 'chrome://extensions/shortcuts';
	const middleClick = e.button === 1;
	const newWindow = e.shiftKey && ! e.ctrlKey && ! middleClick;

	// Should open in new window
	if (newWindow) {
		// Create tab in new window
		chrome.windows.create({ url: url });
	}
	// Should open in same window
	else {
		// Query the current tab in order to create a new adjacent tab
		const tabs = await chrome.tabs.query({active: true});
		const index = tabs[0].index + 1;

		// Tab createData
		const active = (! middleClick && ! (e.ctrlKey ^ e.shiftKey)) || (middleClick && e.shiftKey);

		// Create tab in same window
		chrome.tabs.create({ url: url, index: index, active: active });
	}
}
clickAndKeypress(document.getElementById('keyboardShortcuts'), keyboardShortcuts);

// Link: Big options page
function bigOptions(e)
{
	// Skip other keys or right click
	if ((e.code && e.code !== 'Enter') || e.button === 2) {
		return;
	}

	// Create tab
	chrome.runtime.openOptionsPage();
}
const bigOptionsLink = document.getElementById('bigOptions');
if (location.hash === '#popup')
	clickAndKeypress(bigOptionsLink, bigOptions);
else
	bigOptionsLink.remove();


// Emails

// Add email
const addEmailField = document.getElementById('addEmailField');
function addEmail(e)
{
	// Return for keys besides enter and if there's no value
	if (e.key && e.key !== 'Enter' || !addEmailField.value)
		return;

	// Get the key for the URL
	const email = addEmailField.value.toLowerCase();
	addEmailField.value = '';
	const key = `familiar:${email}`;

	// Load the UI and set the new key
	loadEmails(key);
}
addEmailField.onkeydown = addEmail;
document.getElementById('addEmailButton').onclick = addEmail;

// Remove email
function removeEmail(e)
{
	const div = e.target.parentNode;
	const key = `familiar:${div.dataset.email}`;

	div.remove();
	chrome.storage.sync.remove(key);
}

// Search emails
function searchEmails(e)
{
	const query = e.target.value.toLowerCase();
	const emails = document.getElementsByClassName('email');
	for (const email of emails) {
		if (email.dataset.email.includes(query))
			email.classList.remove('hidden');
		else
			email.classList.add('hidden');
	}
}
document.getElementById('searchEmails').oninput = searchEmails;

// Load emails
async function loadEmails(keyToAdd=null)
{
	// Get all emails
	const emails = await chrome.storage.sync.get();

	// Skip a duplicate key
	if (keyToAdd in emails)
		return;

	// Warning and skip if there's not enough space
	if (Object.keys(emails).length + (keyToAdd ? 1 : 0) >= chrome.storage.sync.MAX_ITEMS) {
		alert(`Only ${chrome.storage.sync.MAX_ITEMS} entries allowed by the browser`);
		return;
	}

	// Add the key
	if (keyToAdd) {
		emails[keyToAdd] = true;
		chrome.storage.sync.set({[keyToAdd]: true});
	}

	// Get the keys, which may already be sorted
	const keys = keyToAdd ? Object.keys(emails).sort() : Object.keys(emails);

	// Make fields for each email
	const container = document.getElementById('emails');
	container.innerHTML = '';
	for (const key of keys) {
		// Skip unused rules
		if (key !== keyToAdd && !emails[key])
			continue;

		// Get email
		const match = key.match(/^familiar:(.*)/);
		if (!match)
			continue;
		const email = match[1];

		// Create email container div
		const div = document.createElement('div');
		div.className = 'email relative';
		div.dataset.email = email;
		container.appendChild(div);

		// Create email text
		const span = document.createElement('span');
		span.className = 'option noClick';
		span.innerText = email;
		div.appendChild(span);

		// Create remove button
		const button = document.createElement('button');
		button.className = 'remove';
		button.onclick = removeEmail;
		div.appendChild(button);
	}
}

loadEmails();
window.onfocus = loadEmails;
