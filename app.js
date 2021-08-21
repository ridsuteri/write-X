const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require('connect-flash')
const dotenv = require("dotenv");

dotenv.config();
const app = express();

let sessionOptions = session({
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: this.true },
});

const port = 3000 || process.env.PORT;
const router = require("./router");

app.use(flash())
app.use(sessionOptions);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
