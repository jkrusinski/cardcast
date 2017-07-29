var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var config = require('../config');
var { newError } = require('./helpers');

// require routes
var clients = require('./routes/clients');
var users = require('./routes/users');
var cards = require('./routes/cards');
var decks = require('./routes/decks');

// make bluebird the default Promise Library
global.Promise = mongoose.Promise = require('bluebird');

// start app and connect to db
var app = express();
mongoose.connect(config[process.env.NODE_ENV || 'default'].dbHost);

// require middleware
var bodyParser = require('body-parser');
var morgan = require('morgan');
var expressSession = require('express-session');
var passport = require('passport');

// setup passport dependencies
app.use(expressSession({ secret: 'cardcast-secret-key'}));
app.use(passport.initialize());
app.use(passport.session());

// setup logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// initialize passport
require('./passport/init')(passport);

// use routes
// notice how the initialized passport object is passed to the users router
app.use('/', clients);
app.use('/api/users', users(passport));
app.use('/api/cards', cards);
app.use('/api/decks', decks);

// serve static files
app.use(express.static(path.join(__dirname, '../clients/')));

// catch 404 errors
app.use((req, res, next) => {
  next(newError('ERROR 404 Sorry can\'t find what you\'re looking for!', 404));
});

// error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  var status = err.status || 500;
  res.status(status).send(err.message);
});

if (process.env.NODE_ENV === 'test') {
  module.exports = app;
} else {
  app.listen(8000, () => {
    console.log('Server is listening on port 8000!');
  });
}
