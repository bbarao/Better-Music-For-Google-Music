/**
 * background.js
 * Controls the data transfer between page, bacground page, and last.fm
 * @author Jared Sartin <jared@level2studios.com>
 * Based on work by @author Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */

var currentVersion = "1.5.7"

var SETTINGS = {
    api_key: "ae40619c4838789cf6660391be7b6ada",
    api_secret: "ee955e252af3c85e66e15864e31174fe",
    
    callback_file: "lastfm_callback.html",
};

var player = {}; // Previous player state
var playlists = [];
var now_playing_sent = false;
var scrobbled = false;
var lastfm_api = new LastFM(SETTINGS.api_key, SETTINGS.api_secret);

var currentSong = '';

// Load settings from local storage
lastfm_api.session.key = localStorage["session_key"] || null;
lastfm_api.session.name = localStorage["session_name"] || null;

// This enables scrobbling by default
SETTINGS.scrobble = !(localStorage["scrobble"] == "false");

// This enables toasting by default
SETTINGS.toast = !(localStorage["toast"] == "false");

//This sets toasts by default to 8 seconds
SETTINGS.toast_duration = localStorage["toast_duration"] >= 1000 ? localStorage["toast_duration"] : localStorage["toast_duration"] = 8000;

// Connect event handlers
chrome.extension.onConnect.addListener(port_on_connect);

/**
 * Content script has connected to the extension
 */
function port_on_connect(port) {
    console.assert(port.name == "musicbeta");
    // Connect another port event handlers
    port.onMessage.addListener(port_on_message);
    port.onDisconnect.addListener(port_on_disconnect);
}
 
/**
 * New message arrives to the port
 */
function port_on_message(message) {
    // Current player state
    var _p = message.song;
    playlists = _p.playlists;
    
    if(_p.has_song) {
        // Basic song check for toasting
        if(!(currentSong == (_p.song.title + _p.song.artist))){
          currentSong = _p.song.title + _p.song.artist;
          need_to_toast = true;
          TrackUse('Song', currentVersion);
        }
        if(_p.is_playing) {
            chrome.browserAction.setIcon({'path': 'img/main-play.png' });
            //do scrobble if enabled
            if(SETTINGS.scrobble) {
                // Last.fm recommends to scrobble a song at least at 50%
                var time_to_scrobble = _p.song.time * 0.7 - _p.song.position;
                
                // Check for valid timings and for that the now playing status was reported at least once
                // This intended to fix an issue with invalid timings that Amazon accidentally reports on
                // song start
                if(time_to_scrobble <= 0 && _p.song.position > 0 && _p.song.time > 0) {
                    if(now_playing_sent && !scrobbled) {
                        scrobbled = true;
                        // Scrobble this song
                        lastfm_api.scrobble(_p.song.title,
                            /* Song start time */
                            Math.round(new Date().getTime() / 1000) - _p.song.position, 
                            _p.song.artist,
                            _p.song.album,
                            function(response) {
                                if(!response.error) {
                                  // Song was scrobled, waiting for the next song
                                    now_playing_sent = false;
                                    TrackUse('Scrobble', currentVersion);
                                }
                                else {
                                    if(response.error == 9) {
                                        // Session expired
                                        clear_session();
                                    }
                                }
                            });
                    }
                }
                else {
                    if (!now_playing_sent) { //only once per track
                        // Set now playing status
                        lastfm_api.now_playing(_p.song.title,
                            _p.song.artist,
                            _p.song.album,
                            function(response) {
                            });
                        
                        now_playing_sent = true;
                        scrobbled = false;
                    }
                } //end enabled scrobble section
            }
            //do toast if need to toast and enabled
            if (need_to_toast == true && SETTINGS.toast == true){
              ToastyPopup(_p.song.cover, _p.song.title, _p.song.artist);
              need_to_toast = false;
            }
             
            // Save player state
            player = _p;
        }
        else {
            // Save player state
            player = _p;
            // The player is paused
            chrome.browserAction.setIcon({'path': 'img/main-pause.png' });
        }
    }
    else {
        chrome.browserAction.setIcon({ 'path': 'img/main-idle.png' });
        player = {};
        scrobbled = false;
        now_playing_sent = false;
        need_to_toast = true;
        currentSong = '';
    }
}
 
 /**
  * Content script has disconnected
  */
function port_on_disconnect() {
    player = {}; // Clear player state
    scrobbled = false;
    now_playing_sent = false;
    chrome.browserAction.setIcon({ 'path': 'img/main-idle.png' });
}


/**
 * Authentication link from popup window
 */
function start_web_auth() {
    var callback_url = chrome.extension.getURL(SETTINGS.callback_file);
    chrome.tabs.create({
        'url': 
            "http://www.last.fm/api/auth?api_key=" + SETTINGS.api_key + "&cb=" + callback_url });
}

/**
 * Clears last.fm session
 */
function clear_session() {
    lastfm_api.session = {};
    
    localStorage.removeItem("session_key");
    localStorage.removeItem("session_name");
}

/**
 * Toggles setting to scrobble songs or not
 */
function toggle_scrobble() {
    SETTINGS.scrobble = !SETTINGS.scrobble;
    localStorage["scrobble"] = SETTINGS.scrobble;
}

/**
 * Toggles setting to toast songs or not
 */
function toggle_toast() {
    SETTINGS.toast = !SETTINGS.toast;
    localStorage["toast"] = SETTINGS.toast;
}

function save_toast_duration(seconds) {
    ms_time = seconds * 1000;
    SETTINGS.toast_duration = ms_time;
    localStorage["toast_duration"] = ms_time;
}

/**
 * Last.fm session request
 */
function get_lastfm_session(token) {
    lastfm_api.authorize(token, function(response) {
        // Save session
        if(response.session)
        {
            localStorage["session_key"] = response.session.key;
            localStorage["session_name"] = response.session.name;
        }
    });
}

 /**
  * Sends the information to the desktop toast
  */
function ToastyPopup(){
    var miniplayer_open = false;
    chrome.extension.getViews({type:"notification"}).forEach(function(win) {
        if(win.is_miniplayer())
            miniplayer_open = true;
    });
    if(!(miniplayer_open)){
          TrackUse('Toast', currentVersion);
          var notification = webkitNotifications.createHTMLNotification('notification.html');
          notification.show();  
    }
}

 /**
  * Send event to GA
  */
function TrackUse(eventName, eventTag){
  _gaq.push(['_trackEvent', 'MusicToast', eventName, eventTag]);
}
