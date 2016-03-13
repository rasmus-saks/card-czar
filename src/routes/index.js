var express = require('express');
var router = express.Router();

router.get("/login", function (req, res) {
  res.render('login');
});

router.get("*", function (req, res) {
  res.render('landing');
});

module.exports = router;