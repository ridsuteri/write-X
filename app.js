const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const app = express();

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
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
