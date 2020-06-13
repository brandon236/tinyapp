const bcrypt = require('bcrypt');

//Finds the user ID based on a given email
const getUserByEmail = function(email, database) {
  for (const item in database) {
    if (database[item]['email'] === email) {
      return database[item]['id'];
    }
  }
  return undefined;
};

//Determines if a url exists in the database
const URLexists = function(url, database) {
  for (const item in database) {
    if (item === url) {
      return true;
    }
  }
  return false;
};


const generateRandomString = function() {
  return Math.random().toString(16).slice(2, 8);//Generates a random 6 digit string
};

//Determines if a given email is in the database
const findEmail = function(email, database) {
  for (const item in database) {
    if (database[item]['email'] === email) {
      return true;
    }
  }
  return false;
};

//Determines if an email and password combination are in the database
const findEmailAndPassword = function(email, password, database) {
  for (const item in database) {
    if (database[item]['email'] === email) {
      if (bcrypt.compareSync(password, database[item]['password'])) {
        return true;
      }
    }
  }
  return false;
};

//Finds the URLs only belonging to the user. The output will be in the same format as the original urlDatabase
const urlsForUser = function(id, database) {
  const tempURLS = {};
  for (const item in database) {
    if (database[item]['userID'] === id) {
      tempURLS[item] = database[item]['longURL'];
    }
  }
  return tempURLS;
};


module.exports  = { getUserByEmail, URLexists, generateRandomString, findEmail, findEmailAndPassword, urlsForUser };
