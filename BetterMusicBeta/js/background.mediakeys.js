/*
 * Created by Tyler Rigsby
 * Version 1.0
 * Background page for handling messages between the content scripts
 */

chrome.extension.onRequest.addListener( 
	function(request, sender, sendResponse) {
		chrome.tabs.getAllInWindow(null, 
			function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					if (tabs[i].url.indexOf("music.google.com") != -1) {
						makeCall(request, tabs[i].id);
						sendResponse({});
					}
				}
			}
		);
		sendResponse({});
	}	
);

// Calls the corresponding javascript function when a media button is pressed
function makeCall(request, id) {
	if (request.code == '179') {
		chrome.tabs.executeScript(id,
			{
			  code: "location.assign('javascript:SJBpost(\"playPause\");void 0');",
			  allFrames: true
			});
	} else if (request.code == '176') {
		chrome.tabs.executeScript(id,
			{
			  code: "location.assign('javascript:SJBpost(\"nextSong\");void 0');",
			  allFrames: true
			});
	} else if (request.code == '177') {
		chrome.tabs.executeScript(id,
			{
			  code: "location.assign('javascript:SJBpost(\"prevSong\");void 0');",
			  allFrames: true
			});
	}
}