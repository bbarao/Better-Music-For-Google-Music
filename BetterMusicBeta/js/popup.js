/**
 * popup.js
 * Controls interactivity in the popup window
 * @author Jared Sartin <jared@level2studios.com>
 * @author Derek Slenk <derek@level2studios.com>
 * Licensed under the MIT license
 */

chrome.extension.onConnect.addListener(port_on_connect);

/**
 * Content script has connected to the extension
 **/
function port_on_connect(port) {
    console.assert(port.name == "musicbeta");
    // Connect another port event handlers
    port.onMessage.addListener(port_on_message);
}

/**
 * Sends command to messaging for the inject script to contolr page
 **/
function sendCommand(gmbCommand){
	
}

function playPause(){
	sendCommand('playPause');
	// change button
}



/**
 * function to load data when it is passed from the page
 **/
function port_on_message(message) {
    // Current player state
    var _p = message;

    if(_p.has_song) {
        if(_p.is_playing) {
        	// The player is paused
        }
        else {
            // The player is paused
        }
    }
    else {
    	// No song
    }
}