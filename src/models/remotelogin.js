'use strict';
module.exports = function(sequelize, DataTypes) {
  var RemoteLogin = sequelize.define('RemoteLogin', {
    remoteSource: DataTypes.STRING,
    remoteId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        RemoteLogin.belongsTo(models.User);
      }
    }
  });
  return RemoteLogin;
};
