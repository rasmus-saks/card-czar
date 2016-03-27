'use strict';
var socket_io = require('socket.io');
var passportSocketIo = require("passport.socketio");
var models = require("../models");
var util = require("../app/util");
function Socket(options) {
  var io = socket_io(options.server);
  io.use(passportSocketIo.authorize({
    secret: 'x9fgj9aoi8848w0kokc08ws0s',
    store: options.store
  }));
  io.on('connection', function (socket) {
    var user = socket.request.user;
    var joinCode;
    socket.on("join", function (code) {
      code = code.toLowerCase();
      joinCode = code;
      models.Game.find({where: {join_code: code}, include: [{all: true}]})
        .then(function (game) {
          if (!game) throw "No game found";
          user.reload().then(function (user) {
            user.getPlayers({include: [{all: true}]}).then(function (players) {
              if (!players || !players.some(p => p.Game.id == game.id)) {
                return user.createPlayer();
              }
              return Promise.resolve(players.find(p => p.Game.id == game.id));
            }).then(function (player) {
              return player.setGame(game, {include: [{all: true}]}).then(function (player) {
                return game.getPlayers({include: [{all: true}]}).then(function (players) {
                  return player.getHandCards().then(function (handCards) {
                    players = players.map(p => p.User);
                    if (user.sessionId) {
                      io.to(user.sessionId).disconnect();
                    }
                    socket.join(game.join_code);
                    socket.emit('status', {
                      player: user,
                      lobbycode: game.join_code,
                      users: players,
                      game: game,
                      cards: handCards
                    });
                    socket.broadcast.to(code).emit("status", {
                      users: players
                    });
                    user.socketId = socket.id;
                    return user.save();
                  });
                });
              });
            });
          });
        }).catch(function (err) {
        socket.emit("error", err);
      });
    });
    socket.on("startGame", function () {
      models.Game.find({where: {join_code: joinCode}})
        .then(function (game) {
          if (game.status !== 0) {
            throw "Game has already started";
          }
          game.getPlayers({include: [{all: true}]}).then(function (players) {
            players[0].status = 1; //Card czar
            game.status = 1;
            util.chooseBlackCard(game).then(function (game) {
              function drawCards(u) {
                return util.drawCards(u, 10).then(function (cards) {
                  io.to(u.User.socketId).emit('status', {
                    cards: cards
                  });
                });
              }
              var proms = Promise.resolve();
              for (var i = 0; i < players.length; i++) {
                let u = players[i];
                if (i !== 0) u.status = 0; //Picking
                io.to(u.User.socketId).emit('status', {
                  player: u,
                  users: players.map(p => p.User),
                  game: game
                });
                proms.then(drawCards(u));
              }
              return proms;
            }).then(function() {
              players.map(u => u.save());
              game.save();
            });
          });
        }).catch(function (err) {
        socket.emit("error", err);
      });
    });
    socket.on("pickCards", function (cards) {
      user.reload().then(function (user) {
        models.Game.findOne({where: {join_code: joinCode}}).then(function (game) {
          var prom = [];

          function addCard(c) {
            prom.push(models.Card.findOne({where: {id: c.id}}).then(function (card) {
              if (!card) return;
              user.addPickedCard(card);
              user.removeHandCard(card);
            }));
          }

          for (var i = 0; i < cards.length; i++) {
            let c = cards[i];
            addCard(user, c);
          }
          Promise.all(prom)
            .then(user.getHandCards())
            .then(function (cards) {
              user.status = 2; //Waiting
              socket.emit('status', {
                cards: cards
              });

              return user.save();
            })
            .then(function () {
              return game.getUsers().then(function (users) {
                for (var i = 0; i < users.length; i++) {
                  let u = users[i];
                  if (u.status != 1 && u.status !== 0) return; //Still have players picking
                }
                function emitPicks() {
                  io.to(joinCode).emit('status', {
                    users: users
                  });
                  game.getPickedCards().then(function (picked) {
                    io.to(joinCode).emit('status', {
                      shownCards: picked
                    });
                  });
                }
                //Time for the czar to pick
                for (var j = 0; j < users.length; j++) {
                  let u = users[j];
                  if (u.status == 1) {
                    u.status = 3; //Card czar picking
                    u.save();
                    emitPicks();
                    break;
                  }
                }
              });
            });
        });
      }).catch(function (err) {
        socket.emit("error", err);
      });
    });
    socket.on('selectWinner', function (winner) {

    });
    socket.on("disconnect", function () {
      user.socketId = null;
      user.save();
    });
  });
  return io;
}
module.exports = Socket;
