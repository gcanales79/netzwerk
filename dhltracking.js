require("dotenv").config();
const axios = require("axios");
const EasyPost = require("@easypost/api");
const api = new EasyPost(process.env.EASY_POST_API_KEY);

axios
  .get(`${process.env.url_netzwerk}/get-tracking-of/DHL`, {})
  .then((response) => {
    console.log(response.data);
    for (let i = 0; i < response.data.data.length; i++) {
      let tracking = response.data.data[i].tracking;
      let status = response.data.data[i].status;
      let id = response.data.data[i].id;
      let phone = response.data.data[i].phone;
      let description = response.data.data[i].description;
      let carrier = response.data.data[i].carrier;
      /*updateTrackingDHL(
        response.data.data[i].tracking,
        response.data.data[i].status, 
        response.data.data[i].id,
        response.data.data[i].phone,
        response.data.data[i].description
      );*/

      trackingPackage(tracking, status, id, phone, description, carrier);
    }
  })
  .catch((err) => {
    console.log(err);
  });

//let tracking = "3099318585";

function updateTrackingDHL(tracking, status, id, telephone, description) {
  //console.log("Hello")
  axios
    .get(`https://api-eu.dhl.com/track/shipments?trackingNumber=${tracking}`, {
      headers: {
        Accept: "application/json",
        "DHL-API-Key": process.env.DHL_API_KEY,
      },
    })
    .then((response) => {
      //console.log(response.data.shipments[0].status);
      let trackingStatus = response.data.shipments[0].status.description;
      //console.log(trackingStatus)
      if (status != trackingStatus) {
        axios
          .put(`${process.env.url_netzwerk}/update-tracking/${id}`, {
            status: trackingStatus,
          })
          .then((response) => {
            //console.log(response.data);
            mandarWhatsapp(telephone, description, trackingStatus);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function mandarWhatsapp(telephone, description, status) {
  axios
    .post(`${process.env.url_netzwerk}/status-tracking`, {
      telephone: telephone,
      description: description,
      status,
      status,
    })
    .then((response) => {
      console.log(response.data.message.sid);
    })
    .catch((err) => {
      console.log(err);
    });
}

function trackingPackage(tracking, status, id, phone, description, carrier) {
  const tracker = new api.Tracker({
    tracking_code: tracking,
    carrier: carrier,
  });

  tracker
    .save()
    .then((Tracker) => {
      let trackingStatus = Tracker.status;
      if (status != trackingStatus) {
        axios
          .put(`${process.env.url_netzwerk}/update-tracking/${id}`, {
            status: trackingStatus,
          })
          .then((response) => {
            //console.log(response.data);
            mandarWhatsapp(phone, description, trackingStatus);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
