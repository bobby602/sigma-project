var createError = require('http-errors');
var express = require('express');
var path = require('path');
var app = express();
const dotenv = require('dotenv')

var cors = require("cors");
var loginRouter = require('./routes/login');
var lineRouter = require('./routes/line');
var productListRouter = require('./routes/productList');

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));


app.use('/', loginRouter);
app.use('/line', lineRouter);
app.use('/productList', productListRouter);


// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    next(createError(404));
  });
//   app.listen(9001, () => {
//     console.log('Application listening on port 9000!');
// });  

  module.exports = app;