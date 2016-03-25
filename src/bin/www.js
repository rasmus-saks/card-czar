var app = require("../app");
var port = process.env.PORT || '8081';
var util = require('util');
var chalk = require('chalk');
app.set('port', port);

util.log(chalk.magenta("Server is now listening on port " + port));
