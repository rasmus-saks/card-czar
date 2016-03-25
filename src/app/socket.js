var socket_io = require('socket.io');
var passportSocketIo = require("passport.socketio");
var models = require("../models");
function Socket(options) {
  var io = socket_io(options.server);
  io.use(passportSocketIo.authorize({
    secret: 'x9fgj9aoi8848w0kokc08ws0s',
    store: options.store
  }));
  io.on('connection', function (socket) {
    var user = socket.request.user;
    socket.on("join", function (code) {
      models.Game.find({join_code: code})
        .then(function (game) {
          if (!game) throw "No game found";
          user.setGame(game);
          socket.join(game.join_code);
          socket.emit("init", {
            player: user,
            lobbycode: game.join_code
          });
          return user.save();
        });
    });
  });
  return io;

}
module.exports = Socket;
