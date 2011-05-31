chrome.extension.onRequest.addListener(function(request, sender, callback) {
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
