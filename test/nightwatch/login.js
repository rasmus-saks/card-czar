var url = require("../../src/config/config.json").development.baseUrl;
var user = require("../../src/config/config.json").development.testUser;
module.exports = {
  'Facebook': function (browser) {
    browser
      .url(url + "auth")
      //Log in to Facebook
      .click(".login a[href^='/auth/facebook']")
      .waitForElementVisible("input#email", 2000)
      .setValue("input#email", user.email)
      .setValue("input#pass", user.password)
      .submitForm("#login_form")
      .waitForElementVisible("#user", 2000)
      .assert.containsText("#user", "Test User")
      .click("#createLobby > a[href='/game/']")
      .waitForElementVisible(".users .user", 3000)
      .assert.containsText(".users .user:nth-of-type(1)", "Test User <- That's you!")
      .end();
  }
};
