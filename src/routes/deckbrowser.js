var express = require('express');
var en = require('../locale/en.json');
var router = express.Router();

router.get("*", function (req, res) {
  res.render('deckbrowser');
});

module.exports = router;
