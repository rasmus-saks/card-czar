'use strict';
module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    status: {type: DataTypes.INTEGER, allowNull: true},
    points: {type: DataTypes.INTEGER, defaultValue: 0},
    name: {type: DataTypes.STRING, allowNull: false},
    socketId: {type: DataTypes.STRING}
  }, {
    classMethods: {
      associate: function (models) {
        User.hasMany(models.RemoteLogin);
        User.hasMany(models.Player);
      }
    }
  });
  return User;
};
