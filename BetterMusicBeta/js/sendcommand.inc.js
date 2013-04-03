/**
 * sendcommand.inc.js
 * Send command code - keeping the system DRY
 * @author Jared Sartin <jared@level2studios.com>
 * Licensed under the MIT license
 */

//Find the Google Music Beta tab
function FindMusicBetaTab(callback) {
chrome.windows.getAll({populate: true}, function(windows) {
    for (var window = 0; window < windows.length; window++) {
      for (var i = 0; i < windows[window].tabs.length; i++) {
        if (windows[window].tabs[i].url.
            indexOf('http://play.google.com/music/listen') == 0 ||
            windows[window].tabs[i].url.
            indexOf('https://play.google.com/music/listen') == 0) {
          callback(windows[window].tabs[i].id)
          return;
        }
      }
    }
    callback(null);
  });  
}

// Send the given command to a tab showing Music Beta,
// or open one if non exists.
function sendCommand(command, options) {
  FindMusicBetaTab(function(tab_id) {
    if (tab_id) {
      if (command == "foreground") {
        chrome.tabs.update(tab_id, {selected: true});
      } 
      else if (command == "fullCommand") {
        chrome.tabs.executeScript(tab_id, {code: "location.assign('javascript:SJBpost(" + options + ");void 0');", allFrames: true});
      }
      else if (command == "thumbsUp"){
        chrome.tabs.executeScript(tab_id, {code: "location.assign('javascript:thumbsUp();void 0');", allFrames: true});
        }
      else if (command == "thumbsDown"){
        chrome.tabs.executeScript(tab_id, {code: "location.assign('javascript:thumbsDown();void 0');", allFrames: true});
        }
      else if (command.indexOf("rateStars(") == 0){
        chrome.tabs.executeScript(tab_id, {code: "location.assign('javascript:" + command + ";void 0');", allFrames: true});
        }
      else {
        chrome.tabs.executeScript(tab_id, {code: "location.assign('javascript:SJBpost(\"" + command + "\");void 0');", allFrames: true});
        if(command == 'nextSong' || command == 'prevSong'){
          notification_close();
        }
      }
    } 
    else {
      chrome.tabs.create({url: 'http://play.google.com/music/listen', selected: true});
    }
  });
}
