var express = require('express');
var router = express.Router();
var util = require("../app/util");
var models = require("../models");
var ensureLogin = require("connect-ensure-login").ensureLoggedIn;

router.use(ensureLogin("/auth"));

router.get("/", function (req, res) {
  util.createGame(req.user).then(function (game) {
    res.redirect("/game/" + game.join_code.toUpperCase());
  });
});

router.get("/:code", function (req, res) {
  var code = req.params.code.toLowerCase();
  models.Game.find({join_code: code})
    .then(function (game) {
      if (!game) {
        res.redirect("/");
        return;
      }
      res.render("game", {code: code});
    });
});

module.exports = router;
