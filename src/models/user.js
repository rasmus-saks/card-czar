'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    status: {type: DataTypes.INTEGER, allowNull: true},
    points: DataTypes.INTEGER,
    name: DataTypes.STRING
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
