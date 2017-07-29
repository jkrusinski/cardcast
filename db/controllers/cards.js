var Card = require('../models/Card.js');

// find all of the user's cards in the database using their id
exports.findAll = function(id, deckId) {
  return Card.find({user: id}).where({deck: deckId});
};

// insert a new card into the database
exports.insertOne = function(card) {
  return Card.create(card);
};

// find a card in the database using the card id
exports.findOne = function(id) {
  return Card.findOne({_id: id});
};

// update the card info in the database
exports.updateCard = function(card) {
  return Card.update(
    { _id: card.id },
    { $set: {
      title: card.title,
      card: card.card,
      note: card.note,
      color: card.color,
      font: card.font }
    }
  );
};

// delete a card from the database
exports.deleteCard = function(id) {
  return Card.remove({_id: id});
};

// delete all cards from a given decks
exports.deleteAllCards = function (deckId) {
  return Card.remove({deck: deckId});
};
