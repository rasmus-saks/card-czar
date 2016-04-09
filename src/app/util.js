var models = require("../models");
var Promise = models.Sequelize.Promise;
function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
function stackTrace() {
  var err = new Error();
  return err.stack;
}
var util = {
  randomString: randomString,
  /**
   * Create a game
   * @param host
   */
  createGame: function (host) {
    if (!host) throw new Error("Missing host user");
    var str = randomString(4);
    //Find game with the generated join codde
    return models.Game.find({where: {join_code: str}}).then(function (game) {
      //No game with the join code, create it
      if (!game) return models.Game.create({join_code: str}, {include: [{all: true}]})
        .then(function (game) {
          return game.setHost(host).then(function () {
            return game;
          });
        });
      //Join code already exists, just recursively call this again. What could go wrong?
      return util.createGame(host);
    });
  },
  /**
   * Get all unpicked cards (either black or not)
   * @param game
   * @param black
   */
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
            return cards;
          });
      });
  },
  /**
   * Draw a number of cards
   * @param player
   * @param num
   */
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
  /**
   * Choose a random black card
   * @param game
   */
  chooseBlackCard: function (game) {
    return util.getRemainingCards(game, true).then(function (cards) {
      var card = cards[Math.floor(Math.random() * cards.length)];
      return game.setBlackCard(card).then(() => game.addPlayedCard(card)).then(() => game.save()).then(() => models.Game.findById(game.id, {include: [{all: true}]}));
    });
  },
  /**
   * Gets a lot of info about the user, game and player
   * @param user
   * @param code
   */
  getAllInfo: function (user, code) {
    //Find the existing game
    return models.Game.find({where: {join_code: code}, include: [{all: true}]})
      .then(function (game) {
        if (!game) throw "No game found";

        //Refresh the user
        return user.reload().then(function (user) {
          return user.getPlayers({include: [{all: true}]}).then(function (players) {
            //The user has not joined the game
            if (!players || !players.some(p => p.Game.id == game.id)) {
              if (game.Players.length == 10) throw "Too many players";
              return user.createPlayer({Game: game}).then(function (player) {
                return player.setGame(game);
              });
            }
            //Found the existing player
            return Promise.resolve(players.find(p => p.Game.id == game.id));
          }).then(function (player) {
            //Resolve with all the info we gathered
            return Promise.resolve([user, game, player]);
          })
        })
      });
  },
  getAllPickedCards: function (players) {
    var prom = Promise.resolve([]);
    for (var i = 0; i < players.length; i++) {
      var pl = players[i];
      addCur(pl);
    }
    function addCur(pl) {
      prom = prom.then(function (cur) {
        return pl.getPickedCards({include: [{all: true}]}).then(function (cards) {
          return cur.concat(cards.map(c => {
            c.player = pl;
            return c;
          })).sort((a, b) => {
            var x = a.PickedCard.selected;
            var y = b.PickedCard.selected;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
        });
      });
    }

    return prom;
  },
  clearAllPickedCards: function (players) {
    var prom = Promise.resolve();
    for (var i = 0; i < players.length; i++) {
      var pl = players[i];
      addCur(pl);
    }
    function addCur(pl) {
      prom = prom.then(function () {
        return pl.setPickedCards([]);
      });
    }

    return prom;
  }
};
module.exports = util;
