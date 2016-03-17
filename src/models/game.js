'use strict';
module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define('Game', {
    status: DataTypes.INTEGER,
    join_code: DataTypes.STRING(4)
  }, {
    classMethods: {
      associate: function(models) {
        Game.belongsTo(models.User);
        Game.hasOne(models.User, {as: 'Host', constraints: false});
        Game.hasMany(models.Card, {as: 'PlayedCard'});
      }
    }
  });
  return Game;
};
