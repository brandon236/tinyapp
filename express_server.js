const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

//app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(16).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


const findEmail = function (email) {
  for (const item in users) {
    if (users[item]['email'] === email) {
      return true;
    }
  }
  return false;
}

//Finds both the email and password for a specified used
const findEmailAndPassword = function (email, password) {
  for (const item in users) {
    if (users[item]['email'] === email) {
      if (bcrypt.compareSync(password, users[item]['password'])) {
        return true;
      }
    }
  }
  return false;
}

//The output will be in the same format as the original urlDatabase
const urlsForUser = function (id) {
  const tempURLS = {};
  for (item in urlDatabase) {
    if (urlDatabase[item]['userID'] === id) {
      tempURLS[item] = urlDatabase[item]['longURL'];
    }
  }
  return tempURLS;
}


const getUserByEmail = function(email, database) {
  for (item in database) {
    if (database[item]['email'] === email) {
      return database[item]['id']
    }
  }
  return false;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    let userEmail = userObject["email"];
  } else {
    let userEmail = undefined;
  }
  let templateVars = { user_id: userEmail, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/set", (req, res) => {
 const a = 1;
 res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
 res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let useEmail = undefined;
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  const userURLS = urlsForUser(req.session.user_id);
  let templateVars = { user_id: userEmail, urls: userURLS };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userEmail = undefined;
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
    res.redirect('/login');
  }
  let templateVars = { user_id: userEmail };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.user_id)) {
    res.redirect('/urls');
  }
  let useEmail = undefined;
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { user_id: userEmail, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let useEmail = undefined;
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { user_id: userEmail }
  res.render("register_user", templateVars);
});

app.get("/login", (req, res) => {
  let useEmail = undefined;
  if (users[req.session.user_id] !== undefined) {
    const userObject = users[req.session.user_id]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { user_id: userEmail }
  res.render("login_user", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.user_id)) {
    res.redirect('/urls');
  }
  const newURL = { longURL: req.body.newURL, userID: req.session.user_id };
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = { longURL: req.body['longURL'], userID: req.session.user_id };
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.user_id)) {
    res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (newEmail === "" || newPassword === "") {
    return res.status(403).send("The email or password fields are empty");
  }
  if (!findEmailAndPassword(newEmail, newPassword)) {
    return res.status(403).send("The email or password is not correct");
  }
  //res.cookie('user_id', findID(newEmail));
    req.session.user_id = getUserByEmail(newEmail, users);
  
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("The email or password fields are empty");
  }
  if (findEmail(req.body.email)) {
    return res.status(400).send("The email is already in use");
  }
  const newID = generateRandomString()
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  }
  //res.cookie('user_id', newID);
  req.session.user_id = newID;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
