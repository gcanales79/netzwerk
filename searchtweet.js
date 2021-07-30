require("dotenv").config();
var Twitter = require("twitter");
var client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEYN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRETN,
});

client.get('search/tweets', {q: "#liderazgo #trabajoenequipo",}, function(error, tweets, response) {
    console.log(tweets);
 });