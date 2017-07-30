const User = require('../schemas/User');

// find a user info from the database using their username
exports.findUser = (username) => {
  return User.findOne({ username: username });
};

// find a user from the database using their id
exports.findUserById = (id) => {
  return User.findById(id);
};

// insert a new user into the database
exports.insertUser = (user) => {
  return User.create(user);
};

// update user info in the database
exports.updateUser = (id, updates) => {
  return User.findByIdAndUpdate(id, updates);
};
