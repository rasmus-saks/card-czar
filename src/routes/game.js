var express = require('express');
var router = express.Router();
var util = require("../app/util");
var models = require("../models");

router.use(function (req, res, next) {
  if (!req.user) {
    res.redirect("/");
    return;
  }
  next();
});

router.get("/", function (req, res) {
  util.createGame(req.user).then(function (game) {
    res.redirect("/game/" + game.join_code);
  });
});

router.get("/:code", function (req, res) {
  req.code = req.params.code;
  models.Game.find({join_code: req.params.code})
    .then(function (game) {
      if (!game) {
        res.redirect("/");
        return;
      }
      res.render("game", {code: req.params.code});
    });
});

module.exports = router;
