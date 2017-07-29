var Deck = require('../schemas/Deck.js');

// find all of the user's decks in the database using their id
exports.findAll = function(id) {
  return Deck.find({user: id});
};

// insert a new deck into the database
exports.insertOne = function(deck) {
  return Deck.create(deck);
};

// find a deck in the database using the card id
exports.findOne = function(id) {
  return Deck.findOne({_id: id});
};

// update the card info in the database
exports.updateDeck = function(deck) {
  return Deck.update({_id: deck.id}, {$set: {title: deck.title, description: deck.description}});
};

// delete a card from the database
exports.deleteDeck = function(id) {
  return Deck.remove({_id: id});
};
