(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCMainCtrl", function AppCtrl($scope, $http, socket) {
    //operation initiated when controller is constructed
    socket.emit('join', lobbycode);
    var ccmain = this;

    ccmain.hello = "Hello,";
    socket.on('init', function (data) {
      console.log("init");
      console.log(data);
      ccmain.player = data.player;
      ccmain.users = data.users;
      ccmain.lobbycode = data.lobbycode;
      ccmain.game = data.game;
    });
    socket.on('newround', function (data) {
      console.log("newround");
      console.log(data);
      ccmain.player = data.player;
      ccmain.users = data.users;
      ccmain.game = data.game;
    });
    socket.on('updateplayers', function (data) {
      console.log("updateplayers");
      console.log(data);
      ccmain.player = data.player;
    });
    socket.on('updateusers', function (data) {
      console.log("updateusers");
      console.log(data);
      ccmain.users = data.users;
    });
    socket.on('updatecards', function(data) {
      ccmain.cards = data.cards;
    });

    ccmain.selectCards = function (cards) {
      socket.emit('pickCards', {
        cards: cards
      });
    };
    ccmain.startgame = function () {
      socket.emit('startGame');
    };

  });
  app.controller("CCDeckBrowser", function ($scope, $http, Deck, Card) {
    this.decks = Deck.query(function () {
      for (var i = 0; i < this.decks.length; i++) {
        var deck = this.decks[i];
        deck.cards = Card.query({deck: deck.id});
      }
    }.bind(this));

    hash = document.URL.substr(document.URL.indexOf('#') + 1);
    if (hash === "black") {
      this.filter = {isBlack: true};
    } else if (hash === "white") {
      this.filter = {isBlack: false};
    } else {
      this.filter = {};
    }

    $scope.$watch("db.filter", function (value) {
      console.log(0);
      if (typeof value.isBlack === 'undefined' || value.isBlack === null ) {
        console.log(1);
        window.location.hash = "all";
      } else if (value.isBlack) {
        console.log(2);
        window.location.hash = "black"
      } else {
        console.log(3);
        window.location.hash = "white"
      }
    });
  });
})();
