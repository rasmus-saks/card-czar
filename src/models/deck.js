'use strict';
module.exports = function (sequelize, DataTypes) {
  var Deck = sequelize.define('Deck', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        Deck.hasMany(models.Card);
      }
    }
  });
  return Deck;
};
