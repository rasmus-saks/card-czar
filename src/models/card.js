'use strict';
module.exports = function(sequelize, DataTypes) {
  var Card = sequelize.define('Card', {
    isBlack: DataTypes.BOOLEAN,
    chooseNum: DataTypes.INTEGER,
    text: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Card.belongsToMany(models.User, {through: "HandCards"});
        Card.belongsToMany(models.User, {through: "PickedCards"});
        Card.belongsToMany(models.Game, {through: "PlayedCards"});
      }
    }
  });
  return Card;
};
