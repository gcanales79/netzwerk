require("dotenv").config();
var moment = require("moment-timezone");
const axios = require("axios");
var Twitter = require("twitter");
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

let fecha = moment().tz("Europe/Warsaw").format("X");

axios
  .get(`${process.env.url}/to-send-tweets/${fecha}`)
  .then((response) => {
    const { data } = response;
    //console.log(response)
    console.log(data)
    for (let i = 0; i < data.length; i++) {
      client.post(
        "statuses/update",
        { status: data[i].tweet },
        function (error, tweet, response) {
          if (!error) {
            //console.log(tweet);
            axios.put(`${process.env.url}/update-tweet/${data[i].id}`,{
                complete:true,
            })
            .then((response)=>{
                console.log(response.data)
            }).catch((err)=>{
                console.log(err)
            })
          }else
          console.log(error)
        }
      );
    }
  })
  .catch((err) => {
    console.log(err);
  });