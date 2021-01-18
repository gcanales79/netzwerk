const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = process.env.SECRET_KEY;

exports.ensureAuth = (req, res, next) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  
  if (!accessToken || accessToken === "null" || accessToken==="undefined") {
    return null;
  }

  return willExpire(accessToken) ? null : accessToken;

  function willExpire(token) {
    const seconds = 60;
    const metaToken = jwtDecode(token);
    //console.log(metaToken)
    const { exp } = metaToken;
    //const expCaducado=exp-1000000000;
    const now = (Date.now() + seconds) / 1000;
    return now > exp;
  }



  /*if (!req.headers.authorization) {
   /* return res
      .status(403)
      .send({ message: "La peticion no tiene cabecera de Autenticacion" });
      return res.redirect("/login")
  }

  const token = req.headers.authorization.replace(/['"]+/g, "");*/

  try {
    var payload = jwt.decode(token, SECRET_KEY);

    if (payload.exp <= moment.unix()) {
      //return res.status(404).send({ message: "El token ha expirado" });
      return res.redirect("/login")
    }
  } catch (ex) {
    //console.log(ex);
    //return res.status(404).send({ message: "Token inválido." });
    return res.redirect("/login")
  }

  req.user=payload;
  next();
};