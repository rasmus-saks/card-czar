'use strict';
module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define('Game', {
    status: {type: DataTypes.INTEGER, defaultValue: 0},
    join_code: DataTypes.STRING(4)
  }, {
    classMethods: {
      associate: function(models) {
        Game.belongsTo(models.User, {as: 'Host', constraints: false});
        Game.hasOne(models.Card, {as: "BlackCard"});
        Game.hasMany(models.User);
      }
    }
  });
  return Game;
};
