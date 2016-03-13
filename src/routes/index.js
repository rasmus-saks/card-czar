var express = require('express');
var en = require('../locale/en.json');
var router = express.Router();

router.get("/login", function (req, res) {
  res.render('login', {lang:en});
});

router.get("*", function (req, res) {
  res.render('landing', {lang:en});
});

module.exports = router;
