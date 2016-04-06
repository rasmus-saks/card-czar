'use strict';
module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
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
