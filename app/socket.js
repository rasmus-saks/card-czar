var socket_io = require('socket.io');

function Socket(server) {
  var io = socket_io(server);
  io.on('connection', function (socket) {

  });
  return io;

}
module.exports = Socket;