require("dotenv").config();
const axios = require("axios");
const EasyPost = require("@easypost/api");
const api = new EasyPost(process.env.EASY_POST_API_KEY);

let tracking="702-4980318-2709018";
let carrier="Amazonmws";

trackingPackage(tracking,carrier)

function trackingPackage(tracking,carrier) {
    const tracker = new api.Tracker({
      tracking_code: tracking,
      carrier: carrier,
    });
  
    tracker
      .save()
      .then((Tracker) => {
        console.log(Tracker)
        //console.log("Tracker done")
      })
      .catch((err) => {
        console.log(err);
      });
  }
  