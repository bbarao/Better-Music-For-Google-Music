/**
 * Created by Tyler Rigsby
 * Version 1.0
 */

// Adds a listener to every page for the media keys
document.addEventListener('keydown', function(event) {
	if (event.keyCode == '179' || event.keyCode == '176' || event.keyCode == '177') {
		chrome.extension.sendRequest({code: event.keyCode});
	}
});