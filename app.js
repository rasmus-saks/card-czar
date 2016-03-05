var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var compression = require('compression');
var stylus = require('stylus');
var nib = require('nib');
var models = require('./models');
var sequelize = models.sequelize;

sequelize.authenticate().then(function() {
  console.log("Connected to MySQL")
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(compression());
app.use(stylus.middleware({
  src: path.join(__dirname, 'public/css'),
  compress: true,
  compile: function (str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', true)
      .use(nib())
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')));
app.use(flash());
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: 'x9fgj9aoi8848w0kokc08ws0s'
}));

app.use("/game", require("./routes/game"));
app.use("/", require("./routes/index"));


module.exports = app;