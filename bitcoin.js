require("dotenv").config();
const axios = require("axios").default;
var moment = require('moment');
const WMA = require('technicalindicators').WMA

axios
  .get("https://api.glassnode.com/v1/metrics/market/mvrv_z_score", {
    params: {
      a: "BTC",
      api_key: process.env.GLASSNODE_API_KEY,
      s:moment().subtract(15,"days").unix(),
      timestamp_format:"humanized"
    },
  })
  .then((response) => {
    console.log(response.data);
    let period=8;
    let values=[];
    for (let i=0; i<response.data.length; i++){
        values.push(response.data[i].v)
    }
    console.log(WMA.calculate({period:period,values:values}))
  })
  .catch((error) => {
    console.log(error);
  });

  axios
  .get("https://api.glassnode.com/v1/metrics/indicators/sopr_adjusted", {
    params: {
      a: "BTC",
      api_key: process.env.GLASSNODE_API_KEY,
      s:moment().subtract(15,"days").unix(),
      timestamp_format:"humanized"
    },
  })
  .then((response) => {
    console.log(response.data);
    let period=8;
    let values=[];
    for (let i=0; i<response.data.length; i++){
        values.push(response.data[i].v)
    }
    console.log(WMA.calculate({period:period,values:values}))
  })
  .catch((error) => {
    console.log(error);
  });
