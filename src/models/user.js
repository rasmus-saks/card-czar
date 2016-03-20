'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    status: {type: DataTypes.INTEGER, allowNull: true},
    points: {type: DataTypes.INTEGER, defaultValue: 0},
    name: {type: DataTypes.STRING, allowNull: false}
  }, {
    classMethods: {
      associate: function(models) {
        User.hasOne(models.Game);
        User.hasMany(models.RemoteLogin);
        User.belongsToMany(models.Card, {as: "HandCard", through: "HandCards"});
        User.belongsToMany(models.Card, {as: "PickedCard", through: "PickedCards"});
      }
    }
  });
  return User;
};
