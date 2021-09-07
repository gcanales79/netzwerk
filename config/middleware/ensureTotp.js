// This is middleware for restricting routes a user with 2fa is not allowed to visit if not logged in
module.exports = function (req, res, next) {
  // If the user is logged in, continue with the request to the restricted route
  if (!req.user.twofa) {
    //console.log(req.user)
    return next();
  }

  if (req.user.twofa /*&& req.user.twofa_valid*/) {
    return next();
  }

  // If the user isn't logged in, redirect them to the login page
  return res.redirect("/verification");
};
