var User = require('../models/User');

// find a user info from the database using their username
exports.findUser = function(username) {
  return User.findOne({ username: username });
};

// find a user from the database using their id
exports.findUserById = function(id) {
  return User.findById(id);
};

// insert a new user into the database
exports.insertUser = function(user) {
  return User.create(user);
};

// update user info in the database
exports.updateUser = function(id, updates) {
  return User.findByIdAndUpdate(id, updates);
};
