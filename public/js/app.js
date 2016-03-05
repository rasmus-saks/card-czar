(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCMainCtrl", function AppCtrl($scope, $http) {
    //operation initiated when controller is constructed
    var ccmain = this;
    ccmain.hello = "Hello, World!"
  });
})();