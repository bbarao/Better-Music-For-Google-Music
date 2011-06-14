/**
 * popup.js
 * Popup page script
 * @author Jared Sartin <jared@level2studios.com>
 * Based on work by @author Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */


/* Background page */
var bp = chrome.extension.getBackgroundPage();

var currSong = bp.currentSong;

/* Render popup when DOM is ready */
$(document).ready(function() {
    render_popup();
	notification_autoclose();
    if(!($('body').hasClass('notification'))){
       setInterval(function(){auto_update();}, '1000');
    }
});

function render_popup(){
    render_scrobble_link();
    render_options_link();
    render_miniplayer_playlist_link();
    render_toast_link();
    render_miniplayer_link();
    render_song();
    render_playlist_links();
    render_auth_link();
    render_playing_controls();
    render_google_rating();
}

/* Notification closing */

// Auto closes notification after 8 seconds, stops auto close if moused over, then starts 2 second close count after close
function notification_autoclose(){
	if($('body').hasClass('notification')){
		windowTimer = setTimeout(function(){window.close();}, '8000');
		window.onmouseout = function(e){
			windowTimer = setTimeout(function(){window.close();}, '2000');
		}
		window.onmouseover = function(e){
			clearTimeout(windowTimer);
		}
	}
}

// Closes the notification
function notification_close(){
	if($('body').hasClass('notification')){
		window.close();
	}
}

/* Auto updating */

function auto_update(){
    if(currSong != bp.currentSong){
        currSong = bp.currentSong;
        render_popup();
    }
}

/* Render functions */

/**
 * Renders current song details
 */
function render_song() {
    if(bp.player.song)
    {
        $("#artist").text(bp.player.song.artist);
        $("#track").text(bp.player.song.title);
        cover = 'img/defaultcover.png';
        if(bp.player.song.cover !== 'http:default_album_med.png')
            cover = bp.player.song.cover;
        $("#cover").attr({ src: cover, width: "60", height: "60" });
        
        if(bp.lastfm_api.session.name && bp.lastfm_api.session.key) {
            render_love_button();
        }
        else {
            $("#lastfm-buttons").hide();
        }
    }
    else {
        $("#song").addClass("nosong");
        $("#artist").text("Nothing is playing");
        $("#track").html('<a></a>');
        $("#track a")
        .attr({ 
            href: "http://music.google.com/music/listen",
            target: "_blank"
        })
        .text("Go to Google Music");
        $("#cover ").attr({ src: "img/defaultcover.png" });
        $("#lastfm-buttons").hide();
    }
}

/**
 * Renders the link to toggle the options panel
 */
function render_options_link() {
    $("#optionsButton").html('<a></a>');
    $("#optionsButton a")
    .attr({
        href: "#" 
    })
    .click(function(){
        $("#optionsPanel").slideToggle('fast');
    })
    .text("Options");
}

/**
 * Renders the link to toggle the miniplayer playlist panel
 */
function render_miniplayer_playlist_link() {
    if(bp.playlists.length>0){
        $("#miniPlaylist").html('<a></a>');
        $("#miniPlaylist a")
        .attr({
            href: "#" 
        })
        .click(function(){
            $("#miniplayerPlaylist").css('display', 'block');
        })
        .text("Playlists");
    }
}

/**
 * Renders the link to turn on/off scrobbling
 */
function render_scrobble_link() {
    $("#scrobbling").html('<a></a>');
    $("#scrobbling a")
    .attr({
        href: "#" 
    })
    .click(on_toggle_scrobble)
    .text(bp.SETTINGS.scrobble ? "Stop scrobbling" : "Resume scrobbling");
}

/**
 * Renders the link to turn on/off toasting
 */
function render_toast_link() {
    $("#toasting").html('<a></a>');
    $("#toasting a")
    .attr({
        href: "#" 
    })
    .click(on_toggle_toast)
    .text(bp.SETTINGS.toast ? "Stop toasting" : "Resume toasting");
}

/**
 * Renders the link to open miniplayer
 */
function render_miniplayer_link() {
    $("#miniplayer").html('<a></a>');
    $("#miniplayer a")
    .attr({
        href: "#" 
    })
    .click(open_miniplayer)
    .text("Open Mini-Player");
}

/**
 * Renders the links to start playlists
 */
function render_playlist_links() {
    if(bp.playlists.length>0 && $("#optionsSection").length>0){
        playlistSectionContent = '<h2>Playlists</h2>';
        $("#optionsSection").before('<div id="playlistSection"></div>');
        playlistSectionContent += build_playlist_links();
        $('#playlistSection').html(playlistSectionContent);
    }
    else if(bp.playlists.length>0 && $("#miniplayerPlaylist").length>0){
        playlistSectionContent = '<h2>Playlists</h2>';
        playlistSectionContent += build_playlist_links();
        $('#playlistHolder').html(playlistSectionContent);
        $('#closeMiniPlaylist').click(hide_playlists_miniplayer);
    }
}

/**
 * Builds playlist links and content
 */
function build_playlist_links(){
    playlists = bp.playlists;
    playlistLinks = "";
    for (var i=0;i<playlists.length; i++) {
        playlistLinks += '<a href="javascript:playlistStart(\'' + playlists[i][0] + '\');">' + playlists[i][1] + '</a><br />';
    }
    return playlistLinks;
}

/**
 * Renders authentication/profile link
 */
function render_auth_link() {
    if(bp.lastfm_api.session.name && bp.lastfm_api.session.key)
    {
        $("#lastfm-profile").html("Last.FM User: " + "<a></a><a></a>");
        $("#lastfm-profile a:first")
        .attr({
            href: "http://last.fm/user/" + bp.lastfm_api.session.name,
            target: "_blank"
        })
        .text(bp.lastfm_api.session.name);
        
        $("#lastfm-profile a:last")
        .attr({
            href: "#",
            title: "Logout"
        })
        .click(on_logout)
        .addClass("logout");
    }
    else {
        $("#lastfm-profile").html('<a></a>');
        $("#lastfm-profile a")
        .attr({
            href: "#" 
        })
        .click(on_auth)
        .text("Connect to Last.fm");
    }
}

/**
 * Renders all the play controls
 */

function render_playing_controls(){
    $('#playing_controls').html('<div id="repeat_mode_button" title="Repeat songs"></div><div id="shuffle_mode_button" title="Shuffle songs"></div><div id="rew" class="goog-flat-button goog-flat-button-disabled goog-inline-block" title="Previous song" role="button" style="-webkit-user-select: none; "></div><div id="playPause" class="goog-flat-button goog-inline-block" title="Play" role="button" style="-webkit-user-select: none; "></div><div id="ff" class="goog-flat-button goog-flat-button-disabled goog-inline-block" title="Next song" role="button" style="-webkit-user-select: none; "></div>');
    $('#repeat_mode_button').attr({class: bp.player.repeat_mode || 'NO_REPEAT'});
    $('#shuffle_mode_button').attr({class: bp.player.shuffle});
    if(bp.player.song){
        $('#rew').removeClass('goog-flat-button-disabled');
        $('#ff').removeClass('goog-flat-button-disabled');
        if(bp.player.is_playing)
            $('#playPause').addClass('goog-flat-button-checked').attr({ title: "Pause song"});
        else
            $('#playPause').removeClass('goog-flat-button-checked').attr({ title: "Resume song"});            
    }

    $('#playPause').hover(function(){$(this).addClass('goog-flat-button-hover')},function(){$(this).removeClass('goog-flat-button-hover')}).click(playPause);
    $('#rew').hover(function(){$(this).addClass('goog-flat-button-hover')},function(){$(this).removeClass('goog-flat-button-hover')}).click(prevSong);
    $('#ff').hover(function(){$(this).addClass('goog-flat-button-hover')},function(){$(this).removeClass('goog-flat-button-hover')}).click(nextSong);
    $('#repeat_mode_button').click(toggleRepeat);
    $('#shuffle_mode_button').click(toggleShuffle);
}

/**
 * Renders the Google
 */

function render_google_rating(){
    if(bp.player.song){
        $('#google-buttons').html('<div class="rating-container hover-button"><div class="goog-inline-block goog-flat-button thumbs-up-button hover-button" title="" role="button" style="-webkit-user-select: none; " tabindex="0"></div><div class="goog-inline-block goog-flat-button thumbs-down-button hover-button" title="" role="button" style="-webkit-user-select: none; " tabindex="0"></div></div>');
        $('.thumbs-up-button').hover(function(){
            $(this).toggleClass('goog-flat-button-hover')
        }).click(ratingUp);
        $('.thumbs-down-button').hover(function(){
            $(this).toggleClass('goog-flat-button-hover')
        }).click(ratingDown);
        if(bp.player.song.thumbsup == "true"){
			$('#google-buttons').addClass('rating-up');
		}
		else if(bp.player.song.thumbsdown == "true"){
			$('#google-buttons').addClass('rating-down');
		}
    }
}

/**
 * Renders the love button
 */
function render_love_button() {    
    $("#love-button").html('<img src="img/ajax-loader.gif">');
    
    bp.lastfm_api.is_track_loved(bp.player.song.title,
            bp.player.song.artist, 
            function(result) {
                $("#love-button").html('<a href="#"></a>');
        
                if(result) {
                    $("#love-button a").attr({ title: "Unlove this song"})
                    .click(on_unlove)
                    .addClass("loved");
            
                }
                else {
                    $("#love-button a").attr({ title: "Love this song" })
                    .click(on_love)
                    .addClass("notloved");
                }
            });
}

/* Event handlers */

/**
 * Turn on/off scrobbling link was clicked
 */
function on_toggle_scrobble() {
    bp.toggle_scrobble();
    render_scrobble_link();
}

/**
 * Turn on/off scrobbling link was clicked
 */
function on_toggle_toast() {
    bp.toggle_toast();
    render_toast_link();
}

/**
 * Authentication link was clicked
 */
function on_auth() {
    bp.start_web_auth();
    window.close();
}

/**
 * Logout link was clicked
 */
function on_logout() {
    bp.clear_session();
    render_auth_link();
}

/**
 * Hides playlists window in miniplayer
 */
function hide_playlists_miniplayer() {
    $("#miniplayerPlaylist").css('display', 'none');
}

/**
 * Miniplayer link was clicked
 */
function open_miniplayer() {
    var notification = webkitNotifications.createHTMLNotification('miniplayer.html');
    notification.show();
}

/**
 * Love button was clicked
 */
function on_love() {
    bp.lastfm_api.love_track(bp.player.song.title, bp.player.song.artist, 
        function(result) {
            if(!result.error) {
                render_love_button();
            }
            else {
                if(result.error == 9) {
                    // Session expired
                    bp.clear_session();
                    render_auth_link();
                }
            }
        });

    $("#love-button").html('<img src="img/ajax-loader.gif">');
}

/**
 * Unlove button was clicked
 */
function on_unlove() {
    bp.lastfm_api.unlove_track(bp.player.song.title, bp.player.song.artist, 
        function(result) {
            if(!result.error) {
                render_love_button();
            }
            else {
                if(result.error == 9) {
                    // Session expired
                    bp.clear_session();
                    render_auth_link();
                }
            }
        });

    $("#love-button").html('<img src="img/ajax-loader.gif">');
}


/**
 * Send commands to control playback
 */

function playPause(){
    sendCommand("playPause");
    setTimeout("render_popup()", 200);
}

function prevSong(){
    sendCommand("prevSong");
    setTimeout("render_popup()", 200);
}

function nextSong(){
    sendCommand("nextSong");
    setTimeout("render_popup()", 200);
}

function toggleRepeat(){
    sendCommand("toggleRepeat");
    setTimeout("render_playing_controls()", 100);
    setTimeout("render_playing_controls()", 500);
}

function toggleShuffle(){
    sendCommand("toggleShuffle");
    setTimeout("render_playing_controls()", 100);
    setTimeout("render_playing_controls()", 500);
}

function ratingUp(){
    sendCommand("ratingUp");
    setTimeout("render_popup()", 150);
}

function ratingDown(){
    sendCommand("ratingDown");
    setTimeout("render_popup()", 150);
}

function playlistStart(plsID){
    sendCommand("fullCommand", "\"playlistSelected\", this, {id: \"" + plsID + "\"}");
    sendCommand("fullCommand", "\"playlistSelected\", this, {id: \"" + plsID + "\"}");
    setTimeout(sendCommand("fullCommand", "\"playPlaylist\", null, \"1\""), 200);
    hide_playlists_miniplayer();
    setTimeout("render_popup()", 100);
}