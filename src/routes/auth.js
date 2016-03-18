var express = require('express');
var router = express.Router();
var passport = require('passport');
var providers = {facebook: {}, google: {scope: ["profile"]}};
for (var provider in providers) {
  if (!providers.hasOwnProperty(provider)) continue;
  router.get("/" + provider, passport.authenticate(provider, providers[provider]));
  router.get("/" + provider + "/callback", passport.authenticate(provider, {
    successRedirect: '/',
    failureRedirect: '/auth'
  }));
}

router.get("*", function (req, res) {
  console.log(req.user);
  res.render("login");
});

module.exports = router;
