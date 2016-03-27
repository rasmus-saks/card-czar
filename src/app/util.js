var models = require("../models");
function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
function stackTrace() {
  var err = new Error();
  return err.stack;
}
var util = {
  randomString: randomString,
  createGame: function (host) {
    if (!host) throw new Error("Missing host user");
    var str = randomString(4);
    return models.Game.find({where: {join_code: str}}).then(function (game) {
      if (!game) return models.Game.create({join_code: str}, {include: [{all: true}]})
        .then(function (game) {
          return game.setHost(host).then(function () {
            return game;
          });
        });
      return util.createGame(host);
    });
  },
  getRemainingCards: function (game, black) {
    if (!game) throw "No game";
    return game.getPlayedCards()
      .then(function (played) {
        var nin = played.map(c => c.id);
        var where = {isBlack: !!black};
        if (nin.length > 0)
          where.id = {$notIn: nin};
        return models.Card.findAll({where: where})
          .then(function (cards) {
            console.log(cards.length);
            return cards;
          });
      });
  },
  drawCard: function (user) {
    return user.getGame().then(function (game) {
      return util.getRemainingCards(game)
        .then(function (cards) {
          var card = cards[Math.floor(Math.random() * cards.length)];
          return user.addHandCard(card).then(() => user.save()).then(() => game.addPlayedCard(card)).then(() => game.save()).then(() => user.getHandCards());
        });
    });
  },
  drawCards: function (player, num) {
    return player.getGame({include: [{all: true}]}).then(function (game) {
      return util.getRemainingCards(game)
        .then(function (cards) {
          var drawn = [];
          for (var i = 0; i < num; i++) {
            var idx = Math.floor(Math.random() * cards.length);
            drawn.push(cards[idx]);
            cards.splice(idx, 1);
          }
          return Promise.all([player.addHandCards(drawn), game.addPlayedCards(drawn)]).then(() => player.save()).then(() => game.save()).then(() => player.getHandCards());
        });
    });
  },
  chooseBlackCard: function (game) {
    return util.getRemainingCards(game, true).then(function (cards) {
      var card = cards[Math.floor(Math.random() * cards.length)];
      return game.setBlackCard(card).then(() => game.addPlayedCard(card)).then(() => game.save()).then(() => models.Game.findById(game.id, {include: [{all: true}]}));
    });
  }
};
module.exports = util;
