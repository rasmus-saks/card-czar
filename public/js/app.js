(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCMainCtrl", function AppCtrl($scope, $http, socket) {
    //operation initiated when controller is constructed
    socket.emit('join', lobbycode);
    var ccmain = this;

    ccmain.hello = "Hello,";
    socket.on('init', function (data) {
      console.log("init");
    });
    socket.on('status', function (data) {
      console.log("status");
      console.log(data);
      if (data.player)
        ccmain.player = data.player;
      if (data.users)
        ccmain.users = data.users;
      if (data.lobbycode)
        ccmain.lobbycode = data.lobbycode;
      if (data.game)
        ccmain.game = data.game;
      if (data.cards)
        ccmain.cards = data.cards;
      console.log(ccmain);
    });
    socket.on('newround', function (data) {
      console.log("newround");
    });
    socket.on('updateplayers', function (data) {
      console.log("updateplayers");

    });
    socket.on('updateusers', function (data) {
      console.log("updateusers");
      console.log(data);
    });
    socket.on('updatecards', function (data) {
      console.log("updatecards");
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
      if (typeof value.isBlack === 'undefined' || value.isBlack === null) {
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
