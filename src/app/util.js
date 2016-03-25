var models = require("../models");
function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
var exports = {
  randomString: randomString,
  createGame: function (host) {
    if (!host) throw new Error("Missing host user");
    var str = randomString(4);
    return models.Game.find({join_code: str}).then(function(game) {
      if (!game) return models.Game.create({join_code: str});
      return exports.createGame(host);
    })
  }
};
module.exports = exports;
