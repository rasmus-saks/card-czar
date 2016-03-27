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
  .factory('Deck', ['$resource', function ($resource) {
    return $resource("/api/decks", {}, {
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
  });
