const express = require('express');
const router = express.Router();
const cards = require('../../db/models/cards.js');
const decks = require('../../db/models/decks.js');
const helpers = require('../helpers');

// GET /api/decks
router.get('/', helpers.isAuth, (req, res, next) => {
  decks.findAll(req.user._id)
    .then((resp) => {
      res.json(resp);
    })
    .catch((err) => {
      next(err);
    });
});

// POST /api/decks
router.post('/', helpers.isAuth, (req, res, next) => {
  const deckInfo = {
    title: req.body.title,
    description: req.body.description,
    user: req.user._id
  };

  decks.insertOne(deckInfo)
    .then((resp) => {
      res.status(201).json(resp);
    })
    .catch((err) => {
      next(err);
    });
});

// GET /api/decks/:id
router.get('/:id', helpers.isAuth, (req, res, next) => {
  Promise.all([
    decks.findOne(req.params.id),
    cards.findAll(req.user._id, req.params.id)
  ])
    .then(([deckInfo, cards]) => {
      res.json({
        deckInfo: deckInfo,
        cards: cards
      });
    })
    .catch((err) => {
      next(err);
    });
});

// PUT /api/decks/:id
router.put('/:id', helpers.isAuth, (req, res, next) => {
  decks.updateDeck(req.body)
    .then((resp) => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
});

// DELETE /api/decks/:id
router.delete('/:id', helpers.isAuth, (req, res, next) => {
  Promise.all([
    cards.deleteCardsByDeckId(req.body._id),
    decks.deleteDeck(req.body._id)
  ])
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
