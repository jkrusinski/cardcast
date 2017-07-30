const express = require('express');
const cards = require('../../db/models/cards.js');
const helpers = require('../helpers');
const router = express.Router();

// helpers.isAuth is checking if req is authenticated

// GET /api/cards
router.get('/', helpers.isAuth, (req, res, next) => {
  // req has a user object given by passport
  cards.findAll(req.user._id, req.body.id)
    .then((resp) => {
      res.send(resp);
    })
    .catch((err) => {
      next(err);
    });
});

// POST /api/cards
router.post('/', helpers.isAuth, (req, res, next) => {
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
    .then((resp) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      next(err);
    });
});

// GET /api/cards/:id
router.get('/:id', helpers.isAuth, (req, res) => {
  cards.findOne(req.params.id)
    .then((resp) => {
      res.send(resp);
    })
    .catch((err) => {
      next(err);
    });
});

// PUT /api/cards/:id
router.put('/:id', helpers.isAuth, (req, res, next) => {
  cards.updateCard(req.body)
    .then((resp) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
});

// DELETE /api/cards/:id
router.delete('/:id', helpers.isAuth, (req, res, next) => {
  cards.deleteCard(req.body._id)
    .then((resp) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
