// Links

// Main click, other click, and keypress
function clickAndKeypress(el, fn) {
	el.onclick = fn;
	el.onauxclick = fn;
	el.onkeypress = fn;
}

// Link: Keyboard shortcuts
async function keyboardShortcuts(e) {
	// Skip other keys or right click
	if ((e.code && e.code != 'Enter') || e.button == 2)
		return;

	// Tab createData
	const url = 'chrome://extensions/shortcuts';
	const middleClick = e.button == 1;
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
function bigOptions(e) {
	// Skip other keys or right click
	if ((e.code && e.code != 'Enter') || e.button == 2) {
		return;
	}

	// Create tab
	chrome.runtime.openOptionsPage();
}
const bigOptionsLink = document.getElementById('bigOptions');
if (location.hash == '#popup')
	clickAndKeypress(bigOptionsLink, bigOptions);
else
	bigOptionsLink.remove();




// Options

// TODO: Replace the textarea with the UI from Customizer

// Load all options
async function loadOptions() {
	// const familiarField = document.getElementById('familiar');

	// // Get all keys
	// for (const key of Object.keys(await chrome.storage.sync.get()).sort()) {
	// 	// Get email from key
	// 	const match = key.match(/^familiar:(.*)/);
	// 	if (!match)
	// 		continue;
	// 	const email = match[1];

	// 	familiarField.value += email + '\n';
	// }
}
loadOptions();
