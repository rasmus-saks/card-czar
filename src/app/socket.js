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
      models.Game.find({where: {join_code: code}})
        .then(function (game) {
          if (!game) throw "No game found";
          return user.setGame(game).then(function (user) {
            return game.getUsers().then(function (users) {
              socket.join(game.join_code);
              socket.emit("init", {
                player: user,
                lobbycode: game.join_code,
                users: users,
                game: game
              });
              socket.broadcast.to(code).emit("updateusers", {
                users: users
              });
              user.socketId = socket.id;
              return user.save();
            });
          });
        });
    });
    socket.on("startGame", function () {
      models.Game.find({where: {join_code: joinCode}})
        .then(function (game) {
          game.getUsers().then(function (users) {
            users[0].status = 1; //Card czar
            game.status = 1;
            for (var i = 0; i < users.length; i++) {
              let u = users[i];
              if (i != 0) u.status = 0; //Picking
              io.to(u.socketId).emit('newround', {
                player: u,
                users: users,
                game: game
              });
              util.drawCards(u, 10).then(function (cards) {
                io.to(u.socketId).emit('updatecards', {
                  cards: cards
                });
              });
            }
            users.map(u => u.save());
            game.save();
          });
        });
    });
    socket.on("pickCards", function (cards) {
      models.Game.findOne({where: {join_code: joinCode}}).then(function (game) {
        var prom = [];
        for (var i = 0; i < cards.length; i++) {
          let c = cards[i];
          prom.push(models.Card.findOne({where: {id: c.id}}).then(function (card) {
            if (!card) return;
            user.addPickedCard(card);
            user.removeHandCard(card);
          }));
        }
        Promise.all(prom)
          .then(user.getHandCards())
          .then(function (cards) {
            user.status = 2; //Waiting
            socket.emit('updatecards', {
              cards: cards
            });

            return user.save();
          })
          .then(function () {
            return game.getUsers().then(function (users) {
              for (var i = 0; i < users.length; i++) {
                let u = users[i];
                if (u.status != 1 && u.status != 0) return; //Still have players picking
              }
              //Time for the czar to pick
              for (var j = 0; j < users.length; j++) {
                let u = users[j];
                if (u.status == 1) {
                  u.status = 3; //Card czar picking
                  u.save();
                  io.to(joinCode).emit('updateusers', {
                    users: users
                  });
                  game.getPickedCards().then(function (picked) {
                    io.to(joinCode).emit('displayCards', {
                      cards: picked
                    });
                  });
                  break;
                }
              }
            });
          });
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
