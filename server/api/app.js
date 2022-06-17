var createError = require('http-errors');
var express = require('express');
var path = require('path');
var app = express();
const line = require('@line/bot-sdk');
const dotenv = require('dotenv')

var cors = require("cors");
var loginRouter = require('./routes/login');
var lineRouter = require('./routes/line');

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));


// app.use('/', loginRouter);
app.use('/line', lineRouter);
// app.use('/users', usersRouter);


// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');


const config = {
  channelAccessToken:'4UJs23LOXx3uDm/0mLDdn4AQ3mNKsDOLBp8ETcT1os+n99ILmcTKlAy4fIxcF+9WdmaZuePnGtTszUlWRzmq/2yn9Ot6ffLZ4d7cEqYx09ayNZGYkIe3RjUqVXz6La4Nqge8bLKhY8/OUt/uTNYCqAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '08441ded22229e8f9c383124d701c7fa'
}

// create LINE SDK client
const client = new line.Client(config);
const router = express.Router();


// create Express app
// about Express itself: https://expressjs.com/

router.get('/', function(req,res){
      res.json({data:'test'});
      

});
// register a webhook handler with middleware
// about the middleware, please refer to doc
router.post('/callback', (req, res) => {
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

app.use(function(req, res, next) {
    next(createError(404));
  });
//   app.listen(9001, () => {
//     console.log('Application listening on port 9000!');
// });  

  module.exports = app;