const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { getUserByEmail, URLexists, generateRandomString, findEmail, findEmailAndPassword, urlsForUser } = require('./helpers.js');
const bcrypt = require('bcrypt');


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


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
};



app.get("/", (req, res) => {
  if (req.session.userId === undefined) {//Redirects to either the login or urls page based on whether the user is logged in
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});


app.get("/urls", (req, res) => {
  if (req.session.userId !== undefined) {
    const userObject = users[req.session.userId];
    let userEmail = userObject["email"];//Sets the display email for the header
    const userURLS = urlsForUser(req.session.userId, urlDatabase);
    let templateVars = { userId: userEmail, urls: userURLS };
    res.render("urls_index", templateVars);
  } else {
    return res.status(403).send("User is not logged in.");//If the user is not logged in then return an error
  }
});


app.get("/urls/new", (req, res) => {
  if (req.session.userId !== undefined) {
    const userObject = users[req.session.userId];
    let userEmail = userObject["email"];
    let templateVars = { userId: userEmail };
    res.render("urls_new", templateVars);
  } else {//If user is not logged in, redirect to the login page
    res.redirect('/login');
  }
});


app.get("/urls/:shortURL", (req, res) => {
  if (!URLexists(req.params.shortURL, urlDatabase)) {//If the URL was not found in the database, return an error
    return res.status(403).send("URL not found.");
  }
  if (req.session.userId === undefined) {//If the user is not logged in, return an error
    return res.status(403).send("User not logged in.");
  }
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.userId)) {//If the URL doesn't belong to the current user
    return res.status(403).send("URL does not belong to the user.");
  }
  const userObject = users[req.session.userId];
  let userEmail = userObject["email"];
  let templateVars = { userId: userEmail, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] };
  res.render("urls_show", templateVars);
});


//Redirects to the long URL
app.get("/u/:shortURL", (req, res) => {
  if (!URLexists(req.params.shortURL, urlDatabase)) {
    return res.status(403).send("Short URL not found.");//Returns an error if the URL doesn't exist
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.get("/u/:longURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  if (req.session.userId !== undefined) {//If the user is already logged in, then redirect them back to /urls
    res.redirect('/urls');
  } else {
    let templateVars = { userId: undefined };
    res.render("register_user", templateVars);
  }
});


app.get("/login", (req, res) => {
  if (req.session.userId !== undefined) {
    res.redirect('/urls');
  } else {
    let templateVars = { userId: undefined };
    res.render("login_user", templateVars);
  }
});


app.post("/urls", (req, res) => {
  if (req.session.userId === undefined) {
    return res.status(403).send("The user is not logged in.");//Returns an error if the user is trying to post without logging in
  }
  const short = generateRandomString();//New 6 character string for the shortened URL
  urlDatabase[short] = { longURL: req.body['longURL'], userID: req.session.userId };
  res.redirect(`/urls/${short}`);
});


app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId === undefined) {
    return res.status(403).send("The user is not logged in.");
  }
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.userId)) {//Checks whether or not the URL belongs to the user
    return res.status(403).send("The URL does not belong to the current user.");
  }
  const newURL = { longURL: req.body.newURL, userID: req.session.userId };
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if ((urlDatabase[req.params.shortURL]['userID']) !== (req.session.userId)) {
    return res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


app.post("/login", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (newEmail === "" || newPassword === "") {//Checks if either the email or password fields are empty
    return res.status(403).send("The email or password fields are empty");
  }
  if (!findEmailAndPassword(newEmail, newPassword, users)) {//Checks if the email and password combination are in the database
    return res.status(403).send("The email or password is not correct");
  }
  req.session.userId = getUserByEmail(newEmail, users);
  res.redirect(`/urls`);
});


app.post("/logout", (req, res) => {
  req.session = null;//Clears the cookie
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("The email or password fields are empty");
  }
  if (findEmail(req.body.email, users)) {//Checks to see if the email is already in the database
    return res.status(400).send("The email is already in use");
  }
  const newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);//Encrypts the password
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.userId = newID;//Sets the cookie
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
