var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },

  password: String
});

// save the password as a hash
userSchema.pre('save', function(next) {
  // make sure hash happens only when password is changed/created
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, null, null, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    next();
  });
});

// hash the potential password and see if there is a match
// this will be a method on the model
userSchema.methods.comparePassword = function(password) {
  return new Promise((fulfill, reject) => {
    bcrypt.compare(password, this.password, (err, res) => {
      if (err) {
        return reject(err);
      }

      fulfill(res);
    });
  });
};

module.exports = mongoose.model('user', userSchema);
