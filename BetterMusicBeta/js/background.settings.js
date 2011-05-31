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