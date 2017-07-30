const Deck = require('../schemas/Deck.js');

// find all of the user's decks in the database using their id
exports.findAll = (id) => {
  return Deck.find({user: id});
};

// insert a new deck into the database
exports.insertOne = (deck) => {
  return Deck.create(deck);
};

// find a deck in the database using the card id
exports.findOne = (id) => {
  return Deck.findOne({_id: id});
};

// update the card info in the database
exports.updateDeck = (id, update) => {
  return Deck.findOneAndUpdate({ _id: id }, update);
};

// deletes a deck from the database
exports.deleteDeck = (id) => {
  return Deck.remove({_id: id});
};
