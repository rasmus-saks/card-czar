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
  models.Game.find({where: {join_code: code}})
    .then(function (game) {
      if (!game) return res.redirect("/");
      return game.getPlayers({include: [{all: true}]}).then(function (players) {
        if (!game || game.status !== 0 && !players.some(p => p.User.id == req.user.id)) {
          res.redirect("/");
          return;
        }
        res.render("game", {code: code});
      });
    });
});

module.exports = router;
