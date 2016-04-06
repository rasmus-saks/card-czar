'use strict';
module.exports = function(sequelize, DataTypes) {
  var PickedCard = sequelize.define('PickedCard', {
    selected: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return PickedCard;
};
