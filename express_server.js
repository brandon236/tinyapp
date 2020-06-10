const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");


app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(16).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


let userEmail = undefined;

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
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
  if (users[req.cookies['user_id']] !== undefined) {
    const userObject = users[req.cookies['user_id']]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { username: userEmail, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies['user_id']] !== undefined) {
    const userObject = users[req.cookies['user_id']]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { username: userEmail };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.cookies['user_id']] !== undefined) {
    const userObject = users[req.cookies['user_id']]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { username: userEmail, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (users[req.cookies['user_id']] !== undefined) {
    const userObject = users[req.cookies['user_id']]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { username: userEmail }
  res.render("register_user", templateVars);
});

app.get("/login", (req, res) => {
  if (users[req.cookies['user_id']] !== undefined) {
    const userObject = users[req.cookies['user_id']]
    userEmail = userObject["email"];
  } else {
    userEmail = undefined;
  }
  let templateVars = { username: userEmail }
  res.render("login_user", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const newURL = req.body.newURL;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = req.body['longURL'];
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const newUser = req.body.username;
  res.cookie('username', newUser);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', newID);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
