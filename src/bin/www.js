var app = require("../app");
var http = require('http');
var port = process.env.PORT || '8081';
var util = require('util');
var chalk = require('chalk');
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
global.io = require("../app/socket")(server);
util.log(chalk.magenta("Server is now listening on port " + port));