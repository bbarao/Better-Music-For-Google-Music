chrome.extension.onRequest.addListener(function(request, sender, callback) {
	var last_fm_api='41b5091ff76ed125105e038191937bd9'
	var last_fm_secret_key='4a4e7fc6803dc19275deaa672c70627f'
    var SongInfo = document.getElementById("playerSongInfo").innerHTML;
    var state = "notplaying";
    if (SongInfo != ''){
      var SongArtist = document.getElementById("playerArtist");
      var SongTitle = document.getElementById("playerSongTitle");
      var SongAlbumArt = document.getElementById("playingAlbumArt").attributes;
      state = SongAlbumArt.getNamedItem("src").nodeValue;
      state += "|";
      state += SongTitle.innerHTML.replace(/<.*?>/g, '');
      state += "|";
      state += SongArtist.innerHTML.replace(/<.*?>/g, '');
    }
    callback(state);
  });

document.getElementById("playerSongInfo").addEventListener("DOMSubtreeModified", function() {
    chrome.extension.sendRequest(0);
  });
