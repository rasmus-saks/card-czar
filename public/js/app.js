(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCMainCtrl", function AppCtrl($scope, $http, socket) {
    //operation initiated when controller is constructed
    var ccmain = this;
    ccmain.hello = "Hello,";
    socket.on('init', function (data) {
      ccmain.name = data.name;
      ccmain.users = data.users;
      ccmain.lobbycode = data.lobbycode;
    });
    ccmain.selectCard = function (cardid) {
      socket.emit('send:cardSelection', {
        selection: cardid
      });
    };

  });
})();
