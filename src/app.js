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
global.env = process.env.NODE_ENV || 'development';
var config = require('./config/config.json')[env];
var sequelize = models.sequelize;
var passport = require('passport');


sequelize.authenticate().then(function () {
  console.log("Connected to MySQL");
  //Force sync schema
  return sequelize.sync({force: false});
});

var app = express();

app.set('views', path.join(__dirname, '../views'));
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
      .use(nib());
  }
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use("/bower_components", express.static(path.join(__dirname, '../bower_components')));
app.use(flash());
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: 'x9fgj9aoi8848w0kokc08ws0s'
}));

app.use(passport.initialize());
app.use(passport.session());

//Initialize passport strategies
require("./app/passport.js")(passport);

app.use(function (req, res, next) {
  //Get language file
  if (req.query.lang) {
    try {
      req.lang = require("./locale/" + req.query.lang + ".json");
      next();
      return;
    } catch (ignored) {

    }
  }
  req.lang = require("./locale/en.json");
  //Load into jade
  res.locals.lang = req.lang;
  next();
});

app.use("/game", require("./routes/game"));
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/index"));


module.exports = app;
