require("dotenv").config();
const axios = require("axios");
const EasyPost = require("@easypost/api");
const api = new EasyPost(process.env.EASY_POST_TEST_KEY);

let tracking="EZ1000000001";
let carrier="UPS";

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
  