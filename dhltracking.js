require("dotenv").config();
const axios = require("axios");

axios
  .get(`${process.env.url_netzwerk}/get-tracking-of/DHL`, {})
  .then((response) => {
    console.log(response.data);
    for (let i = 0; i < response.data.data.length; i++) {
      updateTrackingDHL(
        response.data.data[i].tracking,
        response.data.data[i].status, 
        response.data.data[i].id,
        response.data.data[i].phone,
        response.data.data[i].description
      );
    }
  })
  .catch((err) => {
    console.log(err);
  });

//let tracking = "3099318585";

function updateTrackingDHL(tracking, status,id,telephone,description) {
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
            mandarWhatsapp(telephone,description,trackingStatus)
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

function mandarWhatsapp(telephone,description,status){
    axios.post(`${process.env.url_netzwerk}/status-tracking`,{
      telephone:telephone,
      description:description,
      status,status
    }).then((response)=>{
      console.log(response.data.message.sid)
    }).catch((err)=>{
      console.log(err)
    })
}
