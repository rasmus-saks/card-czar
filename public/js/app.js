(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCMainCtrl", function AppCtrl($scope, $http, socket) {
    //operation initiated when controller is constructed
    socket.emit('join', lobbycode);
    var ccmain = this;

    ccmain.hello = "Hello,";
    socket.on('init', function (data) {
      ccmain.player = data.player;
      ccmain.users = data.users;
      ccmain.lobbycode = data.lobbycode;
      ccmain.game = data.game;
    });
    socket.on('newround', function (data) {
      ccmain.player = data.player;
      ccmain.users = data.users;
      ccmain.game = data.game;
    });
    socket.on('updateplayers', function (data) {
      ccmain.player = data.player;
    });

    ccmain.selectCard = function (cardid) {
      socket.emit('send:cardSelection', {
        selection: cardid
      });
    };

  });
  app.controller("CCDeckBrowser", function($scope, $http, Deck, Card) {
    this.decks = Deck.query(function() {
      for (var i = 0; i < this.decks.length; i++) {
        var deck = this.decks[i];
        deck.cards = Card.query({deck: deck.id});
      }
    }.bind(this));
  });
})();
