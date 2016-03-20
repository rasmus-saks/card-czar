var express = require('express');
var router = express.Router();
var models = require("../models");

router.use(function (req, res, next) {
  res.success = function (data) {
    res.json({
      data: data
    });
  };
  res.fail = function (err) {
    res.json({
      error: err
    })
  };
  next();
});

router.get("/users", function (req, res) {
  models.sequelize.query("SELECT COUNT(*) AS c FROM users").then(function (count) {
    res.success(count[0][0].c);
  }).catch(function (err) {
    res.fail(err);
  });
});

router.get("/totalgames", function (req, res) {
  models.Game.count().then(function (count) {
    res.success(count);
  }).catch(function (err) {
    res.fail(err);
  });
});

module.exports = router;
