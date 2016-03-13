var socket_io = require('socket.io');

function Socket(server) {
  var io = socket_io(server);
  io.on('connection', function (socket) {
    socket.emit("init", {
      name: "Name",
      users: [{name: "User1"}, {name: "User2"}],
      lobbycode: "123ABC"
    });
  });
  return io;

}
module.exports = Socket;
