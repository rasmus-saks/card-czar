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
    var thePlayer;
    var joinCode;

    //Player requests to join the game
    socket.on("join", function (code) {
      code = code.toLowerCase();
      joinCode = code;
      util.getAllInfo(user, joinCode).spread(function (user, game, player) {
        thePlayer = player;
        //Join the player into the game
        return game.getPlayers({include: [{all: true}]}).then(function (players) {
          return player.getHandCards().then(function (handCards) {
            //User has an active websocket connection, disconnect it.
            if (user.sessionId) {
              io.to(user.sessionId).disconnect();
            }

            //Join the game room
            socket.join(game.join_code);
            socket.emit('status', {
              player: players.find(p => p.UserId == user.id),
              lobbycode: game.join_code,
              players: players,
              game: game,
              cards: handCards
            });
            //Game is in Card Czar picking the winner phase
            if (game.status == 2) {
              //Send the cards we are picking from instead
              util.getAllPickedCards(players).then(function (cards) {
                socket.emit('status', {
                  cards: cards
                });
              }).catch(function (err) {
                console.error(err);
              })
            }
            //Update players for everyone
            socket.broadcast.to(code).emit("status", {
              players: players
            });
            user.socketId = socket.id;
            return user.save();
          });
        });
      }).catch(function (err) {
        console.error(err);
        socket.emit("error", err);
      });
    });
    socket.on("startGame", function () {
      util.getAllInfo(user, joinCode).spread(function (user, game, player) {
        if (game.status !== 0) {
          throw "Game has already started";
        }
        game.getPlayers({include: [{all: true}]}).then(function (players) {
          players[0].status = 1; //Card czar
          game.status = 1;
          return util.chooseBlackCard(game).then(function (game) {
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
                players: players,
                game: game
              });
              proms = proms.then(drawCards(u));
            }
            return proms;
          }).then(function () {
            players.map(u => u.save());
            game.save();
          });
        });
      }).catch(function (err) {
        console.error(err);
        socket.emit("error", err);
      });
    });
    socket.on("pickCards", function (cards) {
      util.getAllInfo(user, joinCode).spread(function (user, game, player) {
        function addCard(c) {
          prom = prom.then(function () {
              return models.Card.findById(c.id).then(function (card) {
                if (!card) return;
                return player.addPickedCard(card, {selected: c.selected}).then(() => player.removeHandCard(card));
              });
            }
          );
        }

        if (player.status == 0) { //Regular player picked their cards
          var prom = Promise.resolve();

          for (var i = 0; i < cards.length; i++) {
            let c = cards[i];
            addCard(c);
          }
          prom.then(function () {
            player.getHandCards()
              .then(function (cards) {
                player.status = 2; //Waiting
                socket.emit('status', {
                  cards: cards,
                  player: player
                });
                game.status = 2;
                game.save();
                return player.save();
              })
              .then(function () {
                return game.getPlayers({include: [{all: true}]}).then(function (players) {
                  for (var i = 0; i < players.length; i++) {
                    let u = players[i];
                    if (u.status === 0) return; //Still have players picking
                  }
                  function emitPicks() {
                    io.to(joinCode).emit('status', {
                      players: players,
                      game: game
                    });
                    util.getAllPickedCards(players).then(function (picked) {
                      io.to(joinCode).emit('status', {
                        cards: picked
                      });
                    });
                  }

                  //Time for the czar to pick
                  for (var j = 0; j < players.length; j++) {
                    let u = players[j];
                    if (u.status == 1) {
                      u.status = 3; //Card czar picking
                      u.save();
                      io.to(u.User.socketId).emit('status', {
                        player: u
                      });
                      emitPicks();
                      break;
                    }
                  }
                });
              });
          });
        } else if (player.status == 3) { //Card Czar picked a winner
          return game.getPlayers({include: [{all: true}]}).then(function (players) {
            var card = cards[0];
            util.getAllPickedCards(players).then(function (cards) {
              for (var i = 0; i < cards.length; i++) {
                var c = cards[i];
                if (c.id == card.id) {
                  c.player.points += 1;
                  game.setPlayedCards([]).then(function () {
                    game.status = 1;
                    var cc = 0;
                    for (var j = 0; j < players.length; j++) {
                      var p = players[j];
                      if (p.status == 3) cc = j;
                      p.status = 0;
                    }
                    var choose = game.BlackCard.chooseNum;
                    return util.chooseBlackCard(game).then(function (game) {
                      function drawCards(u) {
                        return util.drawCards(u, choose).then(function (cards) {
                          io.to(u.User.socketId).emit('status', {
                            cards: cards
                          });
                        });
                      }

                      function sendCards(u) {
                        return u.getHandCards().then(function (cards) {
                          io.to(u.User.socketId).emit('status', {
                            cards: cards
                          });
                        });
                      }

                      var proms = Promise.resolve();
                      players[(cc + 1) % players.length].status = 1; //Card czar
                      for (var i = 0; i < players.length; i++) {
                        let u = players[i];
                        if (i !== (cc + 1) % players.length) u.status = 0; //Picking
                        io.to(u.User.socketId).emit('status', {
                          player: u,
                          players: players,
                          game: game
                        });
                        if (i != cc) {
                          proms = proms.then(drawCards(u));
                        } else {
                          proms = proms.then(sendCards(u));
                        }
                      }
                      return proms;
                    }).then(function () {
                      players.map(u => u.save());
                      util.clearAllPickedCards(players);
                      game.save();
                    });
                  });
                }
              }
            });
          });
        }
      }).catch(function (err) {
        console.error(err);
        socket.emit("error", err);
      });
    });
    socket.on("disconnect", function () {
      user.socketId = null;
      user.save();
    });
  });
  return io;
}
module.exports = Socket;
