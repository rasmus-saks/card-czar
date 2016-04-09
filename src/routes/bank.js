var express = require('express');
var router = express.Router();
var ipizza = require('ipizza');
var config = require("../config/config.json")[env];
ipizza.set({
  hostname: config.baseUrl.replace(/\/$/, "") // used in return URL.
  , appHandler: router //if you use Express.
  , returnRoute: '/bank'
  , logLevel: 'verbose'
  , env: env
});
ipizza.provider(
  {
    provider: 'seb'
    , gateway: 'https://www.seb.ee/cgi-bin/unet3.sh/un3min.r'
    , clientId: 'sender'
    , privateKey: './cert/pangalink_seb_user_key.pem'
    , certificate: './cert/pangalink_seb_bank_cert.pem'
    , alias: 'seb2'
  });

ipizza.provider(
  {
    provider: 'swedbank'
    , gateway: 'https://www.swedbank.ee/banklink'
    , clientId: 'sender'
    , privateKey: './cert/pangalink_swedbank_user_key.pem'
    , certificate: './cert/pangalink_swedbank_bank_cert.pem'
    , alias: 'swedbank'
  });
ipizza.on('success', function (reply, req, resp) {
  resp.setHeader('Content-Type', 'text/html; charset=utf-8');
  resp.write('Payment OK!');
  resp.end(JSON.stringify(reply, 4))
});

ipizza.on('error', function (reply, req, resp) {
  resp.setHeader('Content-Type', 'text/html; charset=utf-8');
  resp.write('Payment Error!');
  resp.end(JSON.stringify(reply, 4))
});

router.post('/pay', function (req, res) {
  // Never do this in production. Don't send payment data directly from request.
  ipizza.payment(req.body).pipe(res)
});

router.get("/", function (req, res) {
  res.render('bank');
});

router.get("*", function (req, res) {
  res.redirect("/bank");
});
router.post("*", function (req, res) {
  console.log(req.body);
  res.redirect("/bank");
});

module.exports = router;
