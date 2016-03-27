angular.module('CardCzar.services', ['ngResource']).value('version', '0.1')
  .factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  })
  .factory('AllCards', ['$resource', function ($resource) {
    return $resource("/api/allCards", {}, {
      query: {method: 'GET', isArray: true}
    });
  }])
  .factory('Card', ['$resource', function ($resource) {
    return $resource("/api/cards", {}, {
      query: {method: 'GET', isArray: true}
    });
  }])
  .factory('User', function ($resource) {
    return $resource("/api/user", {}, {
      query: {method: 'GET'}
    });
  })
  .factory('Users', function ($resource) {
    return $resource("/api/users", {}, {
      query: {method: 'GET'}
    });
  })
  .factory('TotalGames', function ($resource) {
    return $resource("/api/totalgames", {}, {
      query: {method: 'GET'}
    });
  });
