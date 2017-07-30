var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deckSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  description: String
});

module.exports = mongoose.model('deck', deckSchema);
