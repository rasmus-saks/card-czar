/*global angular lobbycode*/
(function () {
  var app = angular.module('CardCzar', ['CardCzar.filters', 'CardCzar.services']);
  app.controller("CCGame", function AppCtrl($scope, $http, socket) {
    //operation initiated when controller is constructed
    socket.emit('join', lobbycode);
    var ccmain = this;

    ccmain.cards = [];
    ccmain.players = [];
    ccmain.player = {};
    ccmain.game = {};
    socket.on('init', function () {
    });
    socket.on('status', function (data) {
      if (data.player)
        ccmain.player = data.player;
      if (data.players)
        ccmain.players = data.players;
      if (data.lobbycode)
        ccmain.lobbycode = data.lobbycode;
      if (data.game)
        ccmain.game = data.game;
      if (data.cards)
        ccmain.cards = data.cards;
    });

    ccmain.selectCards = function () {
      if (!ccmain.readyToSubmit()) return;
      var cards = ccmain.getSelected();
      socket.emit('pickCards', cards);
    };
    ccmain.startgame = function () {
      socket.emit('startGame');
    };
    ccmain.selectCard = function (card) {
      if (!ccmain.canSelectCards()) return;
      if (card.selected) {
        var sel = card.selected;
        for (var i = 0; i < ccmain.cards.length; i++) {
          var c = ccmain.cards[i];
          if (c.selected >= sel) delete c.selected;
        }
      } else {
        if (ccmain.readyToSubmit()) {
          for (var j = 0; j < ccmain.cards.length; j++) {
            var crd = ccmain.cards[j];
            crd.selected = 0;
          }
        }
        card.selected = ccmain.firstUnusedSelection();
        if (ccmain.player.status == 3) {
          for (var g = 0; g < ccmain.cards.length; g++) {
            var cr = ccmain.cards[g];
            if (cr.PickedCard.PlayerId == card.PickedCard.PlayerId) cr.selected = card.selected;
          }
        }
      }
    };
    ccmain.firstUnusedSelection = function () {
      var i = 1;
      for (var j = 0; j < ccmain.cards.length; j++) {
        var c = ccmain.cards[j];
        if (c.selected == i) i++;
      }
      return i;
    };

    ccmain.countSelected = function () {
      var sum = 0;
      for (var i = 0; i < ccmain.cards.length; i++) {
        var c = ccmain.cards[i];
        if (c.selected) sum++;
      }
      return sum;
    };

    ccmain.readyToSubmit = function () {
      return ccmain.game.BlackCard && ccmain.countSelected() == ccmain.game.BlackCard.chooseNum
        || ccmain.player.status == 3 && ccmain.countSelected() > 0;
    };

    ccmain.getSelected = function () {
      return ccmain.cards.filter(function (c) {
        return c.selected;
      }).sort(function (c) {
        return c.selected;
      });
    };

    ccmain.blackCardText = function () {
      if (!ccmain.game || !ccmain.game.BlackCard) return "";
      return ccmain.game.BlackCard.text;
    };

    ccmain.getStatusText = function (player) {
      switch (player.status) {
        case 0:
          return "picking";
        case 1:
          return "Card Czar";
        case 2:
          return "waiting";
        case 3:
          return "picking winner";
        default:
          return "unknown status " + player.status;
      }
    };

    ccmain.canSelectCards = function () {
      return [0, 3].indexOf(ccmain.player.status) !== -1;
    };
  });
  app.controller("CCDeckBrowser", function ($scope, $http, AllCards) {
    this.cards = AllCards.query();

    var hash = document.URL.substr(document.URL.indexOf('#') + 1);
    if (hash === "black") {
      this.filter = true;
    } else if (hash === "white") {
      this.filter = false;
    } else {
      this.filter = undefined;
    }

    $scope.$watch("db.filter", function (value) {
      if (typeof value === 'undefined') {
        window.location.hash = "all";
      } else if (value) {
        window.location.hash = "black";
      } else {
        window.location.hash = "white";
      }
    });
  });
  app.controller("CCMain", function ($scope, $http, User, Users, TotalGames) {
    var main = this;
    this.user = User.query(function () {
      main.loaded = true;
    });
    Users.query(function (data) {
      main.usercount = data.data;
    });
    TotalGames.query(function (data) {
      main.gamecount = data.data;
    });
  });
})();
