const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const app = express();

app.use(flash());

let sessionOptions = session({
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
});
app.use(sessionOptions);

app.use(function (req, res, next) {
  // console.log("Test - req.session.user: ~",req.session.user);
  // make error and success flash messages to templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // make current user id available on the req object
  if (req.session.user) 
    req.visitorId = req.session.user._id;
  else
    req.visitorId = 0;

  // make user session data from within view templates
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
