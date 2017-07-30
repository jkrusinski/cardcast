var express = require('express');
var router = express.Router();
var cards = require('../../db/models/cards.js');
var helpers = require('../helpers');

// helpers.isAuth is checking if req is authenticated

// handle get request to '/api/cards/' by using findAll function from cards
router.get('/', helpers.isAuth, function(req, res, next) {
  // req has a user object given by passport
  cards.findAll(req.user._id, req.body.id)
    .then(function(resp) {
      res.send(resp);
    })
    .catch(function(err) {
      console.error(err);
    });

});

// handle post request to '/api/cards' by using insertOne function from cards
router.post('/', helpers.isAuth, function(req, res) {
  // add user id to the card info to specify whose card it is
  var cardInfo = {
    title: req.body.title,
    card: req.body.card,
    deck: req.body.deck,
    user: req.user._id,
    note: req.body.note,
    color: req.body.color,
    font: req.body.font
  };

  cards.insertOne(cardInfo)
    .then(function(resp) {
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.error(err);
    });
});

// handle post request to '/api/cards/:id' by using deleteCard function from cards
router.post('/:id', helpers.isAuth, function(req, res, next) {
  cards.deleteCard(req.body._id)
    .then(function(resp) {
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.error(err);
    });

});

// handle get request to '/api/cards/:id' by using findOne function from cards
router.get('/:id', helpers.isAuth, function(req, res) {
  cards.findOne(req.params.id)
    .then(function(resp) {
      res.send(resp);
    })
    .catch(function(err) {
      console.error(err);
    });
});

// handle put request to '/api/cards/:id' by using updateCard function from cards
router.put('/:id', helpers.isAuth, function(req, res) {
  cards.updateCard(req.body)
    .then(function(resp) {
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.error(err);
    });
});

module.exports = router;
