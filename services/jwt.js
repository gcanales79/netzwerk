const jwt = require("jwt-simple");
require("dotenv").config();
const moment = require("moment");

const SECRET_KEY = process.env.SECRET_KEY;

exports.createAccessToken = function (user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    createToken: moment().unix(),
    exp: moment().add(3, "hours").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function (user) {
  const payload = {
    id: user.id,
    exp: moment().add(30, "days").unix(),
  };
  return jwt.encode(payload, SECRET_KEY);
};

exports.decodeToken = function (token) {
  return jwt.decode(token, SECRET_KEY, true);
};
