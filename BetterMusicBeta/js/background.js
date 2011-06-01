/**
 * background.js
 * Controls the toast notifications and scrobbling for Better Music Beta
 * @author Jared Sartin <jared@level2studios.com>
 * @author Derek Slenk <derek@level2studios.com>
 * Licensed under the MIT license
 */

var CurrentSongInfo = '';
var lastfm_api_key = '41b5091ff76ed125105e038191937bd9';
var lastfm_secret_key = '4a4e7fc6803dc19275deaa672c70627f';
var lastfm_username = '';
var lastfm_password = '';

var lastfm_session;

var cache = new LastFMCache();

var lastfm = new LastFM({
  apiKey    : lastfm_api_key,
  apiSecret : lastfm_secret_key,
  cache     : cache
});

// to store use 
// http://www.smashingmagazine.com/2010/10/11/local-storage-and-how-to-use-it/
// http://diveintohtml5.org/storage.html

//EXAMPLES:

//var foo = localStorage.getItem("bar");
// ...
//localStorage.setItem("bar", foo);

//OR

//var foo = localStorage["bar"];
// ...
//localStorage["bar"] = foo;

var player = {}; // Previous player state
var currentSong = '';

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
    var _p = message;

    // Basic song check for toasting
    if(!(currentSong == (_p.song.title + _p.song.artist))){
      currentSong = _p.song.title + _p.song.artist;
      need_to_toast = true;
    }

    if(_p.has_song) {
        if(_p.is_playing) {
            chrome.browserAction.setIcon({'path': 'img/main-play.png' });
            
            //This is the scrobble area
            
            if (need_to_toast){
              ToastyPopup(_p.song.cover, _p.song.title, _p.song.artist);
              need_to_toast = false;
            }

            // Save player state
            player = _p;
        }
        else {
            // The player is paused
            chrome.browserAction.setIcon({'path': 'img/main-pause.png' });
        }
    }
    else {
        chrome.browserAction.setIcon({ 'path': 'img/main-idle.png' });
        player = {};
        need_to_toast = true;
        currentSong = '';
    }
}
 
 /**
  * Content script has disconnected
  */
function port_on_disconnect() {
    player = {}; // Clear player state
    now_playing_toast = false;
}

 /**
  * Sends the information to the desktop toast
  */
function ToastyPopup(icon, title, artist){
  //TrackToast();
  // Create a simple text notification:
  if(icon == "http:default_album_med.png"){
    icon = "img/logo-48x48.png";
  }
  var notification = webkitNotifications.createNotification(
    icon,
    title,
    artist
  );
  // Then show the notification
  notification.show();
  // Then auto close!
  setTimeout(function(){
      notification.cancel();
      }, '6000');

}

 /**
  * Send event to GA
  */
function TrackToast(){
  _gaq.push(['_trackEvent', 'MusicToast', 'Toast']);
}