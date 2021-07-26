require('dotenv').config();
var moment = require('moment-timezone')

console.log(moment().tz("Europe/Warsaw").format("YYYY-MM-DD HH:mm"));