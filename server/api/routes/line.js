const line = require('@line/bot-sdk');
const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const db = require('../database');
var path = require('path');
const app = express();
const router = express.Router();

// create LINE SDK config from env variables
const config = {
    channelAccessToken:'4UJs23LOXx3uDm/0mLDdn4AQ3mNKsDOLBp8ETcT1os+n99ILmcTKlAy4fIxcF+9WdmaZuePnGtTszUlWRzmq/2yn9Ot6ffLZ4d7cEqYx09ayNZGYkIe3RjUqVXz6La4Nqge8bLKhY8/OUt/uTNYCqAdB04t89/1O/w1cDnyilFU=',
    channelSecret: '08441ded22229e8f9c383124d701c7fa'
}

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/



router.use(express.urlencoded({extended:true}));
router.use(bodyParser.json());
// register a webhook handler with middleware
// about the middleware, please refer to doc
router.post('/callback', line.middleware(config), (req, res) => {
  console.log('test')
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }else if (event.message.type == "text" || event.message.text == "Dow"){
    const payload = {type:"text" , text :"beautiful"};
    return client.replyMessage(event.replyToken,payload);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}


module.exports = router;