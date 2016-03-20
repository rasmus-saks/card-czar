var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var models = require("../models");
var config = require('../config/config.json')[env];
var Promise = models.Sequelize.Promise;

function login(req, profile, done) {
  models.RemoteLogin.findOne({
    include: [models.User],
    where: {remoteId: profile.id, remoteSource: profile.provider}
  }).then(function (user) {
    if (!user) {
      var promise = req.user ?
        Promise.resolve(req.user)
        : models.User.create({
        name: profile.displayName
      });
      return promise.then(function (usr) {
        return usr.createRemoteLogin({
          remoteSource: profile.provider,
          remoteId: profile.id
        }).then(Promise.resolve(usr));
      });
    }
    return user;
  }).then(function (user) {
    done(null, user);
  }).catch(function (err) {
    done(err);
  });
}
module.exports = function (passport) {
  passport.use(new FacebookStrategy({
      clientID: config.fbAppId,
      clientSecret: config.fbAppSecret,
      callbackURL: config.baseUrl + "auth/facebook/callback",
      passReqToCallback: true
    },
    function (req, accessToken, refreshToken, profile, done) {
      login(req, profile, done);
    }
  ));
  passport.use(new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.baseUrl + "auth/google/callback",
      passReqToCallback: true
    },
    function (req, accessToken, refreshToken, profile, done) {
      login(req, profile, done);
    }
  ));
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    models.User.findById(id).then(function (user) {
      done(null, user);
    }).catch(function (err) {
      done(err);
    });
  });
};
