var express = require('express');
var router = express.Router();
var models = require("../models");

router.use(function (req, res, next) {
  res.success = function (data) {
    if (typeof data === 'object') {
      res.json(data);
      return;
    }
    res.json({
      data: data
    });
  };
  res.fail = function (err) {
    res.json({
      error: err.toString()
    });
  };
  next();
});
router.get("/user", function (req, res) {
  res.success(req.user);
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

router.get("/decks", function (req, res) {
  models.Deck.findAll().then(function (decks) {
    res.success(decks);
  }).catch(function (err) {
    res.fail(err);
  });
});

router.get("/cards", function (req, res) {
  if (req.query.deck === undefined) {
    res.fail("Missing deck ID");
    return;
  }
  models.Deck.findById(req.query.deck, {include: [models.Card]}).then(function (deck) {
    if (!deck) {
      res.fail("No deck with ID " + req.query.deck);
      return;
    }
    return deck.getCards().then(function (cards) {
      res.success(cards);
    });
  }).catch(function (err) {
    res.fail(err);
  });
});

module.exports = router;
