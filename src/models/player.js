'use strict';
module.exports = function (sequelize, DataTypes) {
  var Player = sequelize.define('Player', {
    status: {type: DataTypes.INTEGER, defaultValue: 0},
    points: {type: DataTypes.INTEGER, defaultValue: 0}
  }, {
    classMethods: {
      associate: function (models) {
        Player.belongsTo(models.Game, {constraints: false});
        Player.belongsTo(models.User, {constraints: false});
        Player.belongsToMany(models.Card, {as: "HandCards", through: "HandCards"});
        Player.belongsToMany(models.Card, {as: "PickedCards", through: "PickedCards"});
      }
    }
  });
  return Player;
};
