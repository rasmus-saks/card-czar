var url = require("../../src/config/config.json").development.baseUrl;
module.exports = {
  'Landing': function (browser) {
    browser
      .url(url)
      .waitForElementVisible(".intro", 1000)
      .assert.elementPresent("input#lobbycode") //Lobby code input
      .assert.elementPresent("a#joinlobby") //Join lobby from lobby code
      .assert.elementPresent("#createLobby > a[href='/game/']") //Create lobby
      .assert.containsText("footer > .container > p", "Made by Al William Tammsaar, Rasmus Saks and Janek Timmas")
      .end()
  },
  'Join lobby redirect to login': function (browser) {
    browser
      .url(url)
      .waitForElementVisible(".intro", 1000)
      .setValue("input#lobbycode", "ABCDE")
      .click("a#joinlobby")
      .waitForElementVisible(".login", 1000)
      .end();
  }
};
