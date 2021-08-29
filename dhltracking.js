require("dotenv").config();
const axios = require("axios");


let tracking="3099318585"

axios.get(`https://api-eu.dhl.com/track/shipments?trackingNumber=${tracking}`,{
    headers:{
        "Accept":"application/json",
        "DHL-API-Key":process.env.DHL_API_KEY,
    }
}).then((response) => {
    console.log(response.data.shipments[0].status)
}).catch((err) => {
    console.log(err)
})