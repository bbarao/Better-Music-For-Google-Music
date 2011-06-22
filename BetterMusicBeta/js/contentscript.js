/**
 * contentscripts.js
 * Parses player page and transmit song information to background page
 * @author Alexey Savartsov <asavartsov@gmail.com>
 * @author Brad Lambeth <brad@lambeth.us>
 * @author Jared Sartin <jared@level2studios.com>
 * Licensed under the MIT license
 */

/**
 * Player class
 *
 * Google Music Beta page parser
 */
function Player(parser) { 
    this.has_song = parser._get_has_song();
    this.is_playing = parser._get_is_playing();
    this.shuffle = parser._get_shuffle();
    this.repeat_mode = parser._get_repeat_mode();
    this.playlists = parser._get_playlists();
    this.song = {
        position: parser._get_song_position(),
        time: parser._get_song_time(),
        title: parser._get_song_title(),
        artist: parser._get_song_artist(),
        album: parser._get_song_album(),
        cover: parser._get_song_cover(),
        thumbsup: parser._get_is_thumbs_up(),
        thumbsdown: parser._get_is_thumbs_down()
    };
}

/**
 * Constructor for parser class
 * Executes scripts to fetch now playing info from cloudplayer
 * @returns {GoogleMusicParser}
 */
GoogleMusicParser = function() {

};

/**
 * Check whether a song loaded into player widget
 *
 * @return true if some song is loaded, otherwise false
 */
GoogleMusicParser.prototype._get_has_song = function() {
    return $("#playerSongInfo div").hasClass("goog-inline-block goog-flat-button");
};

/**
 * Checks whether song is playing or paused
 *
 * @return true if song is playing, false if song is paused
 */
GoogleMusicParser.prototype._get_is_playing = function() {
    return ($("#playPause").attr("title") == "Pause");
};

/**
 * Checks whether random play is on or not
 *
 * @return true if shuffle, false if not shuffle
 */
GoogleMusicParser.prototype._get_shuffle = function() {
    return $("#shuffle_mode_button").attr("class");
};

/**
 * Checks whether song is playing or paused
 *
 * @return true if song is playing, false if song is paused
 */
GoogleMusicParser.prototype._get_repeat_mode = function() {
    return $("#repeat_mode_button").attr("class");
};

/**
 * Parses playlists
 *
 * @return array of playlists
 */
GoogleMusicParser.prototype._get_playlists = function() {
    var playlists = [];
    var playlist = [];
    $('#magic-playlists li').each(function(){
        playlist = [$(this).attr("id"), $(this).find('.nav-item .fade-out-content').attr('title')];
        playlists.push(playlist);
    });
    $('#playlists li').each(function(){
        playlist = [$(this).attr("id"), $(this).find('.nav-item .fade-out-content').attr('title')];
        playlists.push(playlist);
    });
    return playlists;
};
/**
 * Get current song playing position
 *
 * @return Playing position in seconds
 */
GoogleMusicParser.prototype._get_song_position = function() {
    var _time = $("#currentTime").text();
    _time = $.trim(_time).split(':');
    if(_time.length == 2) {
        return (parseInt(_time[0], 10) * 60 + parseInt(_time[1], 10));
    }
    else {
        return 0;
    }
};

/**
 * Get current song length
 *
 * @return Song length in seconds
 */
GoogleMusicParser.prototype._get_song_time = function() {
    var _time = $("#duration").text();
    _time = $.trim(_time).split(':');
    if(_time.length == 2) {
        return (parseInt(_time[0], 10) * 60 + parseInt(_time[1], 10));
    }
    else {
        return 0;
    }
};

/**
 * Get current song title
 *
 * @return Song title
 */
GoogleMusicParser.prototype._get_song_title = function() {
    // the text inside the div located inside element with id="playerSongTitle"
    return $("#playerSongTitle div").text();
};

/**
 * Get current song artist
 *
 * @return Song artist
 */
GoogleMusicParser.prototype._get_song_artist = function() {
    return $("#playerArtist div").text();
};

/**
 * Get current song artwork
 *
 * @return Image URL or default artwork
 */
GoogleMusicParser.prototype._get_song_cover = function() {
    return ("http:" + $("#playingAlbumArt").attr("src"));
};

/**
 * Get current song album name
 *
 * @return Album name or null
 */
GoogleMusicParser.prototype._get_song_album = function() {
    return null;
};

/**
 * Get current song thumbs up
 *
 * @return True if song has thumbs up, false if not
 */
GoogleMusicParser.prototype._get_is_thumbs_up = function() {
    return $("#thumbsUpPlayer").attr("aria-pressed");
};

/**
 * Get current song thumbs down
 *
 * @return True if song has thumbs down, false if not
 */
GoogleMusicParser.prototype._get_is_thumbs_down = function() {
    return $("#thumbsDownPlayer").attr("aria-pressed");
};


// Non-Parsing functions

var port = chrome.extension.connect({name: "musicbeta"});

//send information "immediately" - populate plugin information
setTimeout("SendMessage()", 200);

//Auto Send Message every 10 seconds
window.setInterval(function() {
    SendMessage();
}, 10000);

//Forced send on update (new song starts, mode changes, etc.)
document.getElementById("playerSongInfo").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

document.getElementById("playPause").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

document.getElementById("repeat_mode_button").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

document.getElementById("shuffle_mode_button").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

document.getElementById("thumbsUpPlayer").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

document.getElementById("thumbsDownPlayer").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

// Function to send the message
function SendMessage(){
    port.postMessage({song: new Player(new GoogleMusicParser())});
}

// Initialize the search bar for minimal CSS
//var obj = document.querySelector("#header .search");
//obj.parentNode.removeChild(obj);
//document.body.appendChild(obj);

// Injection for thumbs
(function() {
    var script = document.createElement("script");
    script.src = "http://code.jquery.com/jquery-1.6.1.min.js";
    document.body.appendChild( script );
})()

injectScript("function triggerMouseEvent(element, eventname){ var event = document.createEvent('MouseEvents'); event.initMouseEvent(eventname, true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, element); element.dispatchEvent(event); }");
injectScript("function replicateClick(element){ triggerMouseEvent(element, 'mouseover'); triggerMouseEvent(element, 'mousedown'); triggerMouseEvent(element, 'mouseup'); }");
injectScript("function thumbsUp(){ replicateClick(document.getElementById('thumbsUpPlayer')); }");
injectScript("function thumbsDown(){ replicateClick(document.getElementById('thumbsDownPlayer')); }");