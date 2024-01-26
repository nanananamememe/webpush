"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const webPush = require('web-push');
require('dotenv').config();
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());
app.listen(80);
app.get("/",
  (req,res)=>res.send("GET request to the web-site.")
)
.get('/key', function(req,res){
  const vapidKeys = webPush.generateVAPIDKeys();
  var vapidPublicKey = process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey;
  var vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey;
  res.send({"vapidPublicKey": vapidPublicKey ,"vapidPrivateKey": vapidPrivateKey});
})
.post("/webpushtest",function(req,res){
  try {
    let keys = JSON.parse(req.body.vapidKeys);
    let sb = JSON.parse(req.body.vapidSubscription);
    var vapidPublicKey = keys.vapidPublicKey;
    var vapidPrivateKey = keys.vapidPrivateKey;
    webPush.setVapidDetails('mailto:' + process.env.VAPID_MAIL_TO, vapidPublicKey, vapidPrivateKey);
    setTimeout(async _ => {
      await webPush.sendNotification(sb, JSON.stringify({
        "title": req.body.title,
        "body": req.body.body,
        "data":{ 
          "url": req.body.url
        },
        "icon": req.body.icon
      }));
    }, 500);
  } catch (err) {
      console.log(err);
  }
  res.send("[]");
})
;
