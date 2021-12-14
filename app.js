const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const marked = require("marked");
const sanitizeHTML = require("sanitize-html");
const csrf = require("csurf");
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
  // make markdown available from templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(marked.parse(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "i",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "\r",
        "\n",
      ],
      allowedAttributes: {},
    });
  };

  // console.log("Test - req.session.user: ~",req.session.user);
  // make error and success flash messages to templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // make current user id available on the req object
  if (req.session.user) req.visitorId = req.session.user._id;
  else req.visitorId = 0;

  // make user session data from within view templates
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(csrf())

app.use(function(req, res, next) {
  // console.log(req.csrfToken());
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

app.use(function(err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash('errors', "Cross site request forgery detected.")
      req.session.save(() => res.redirect('/'))
    } else {
      res.render("404")
    }
  }
})

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.use(function(socket, next) {
  sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
  if (socket.request.session.user) {
    let user = socket.request.session.user

    socket.emit('welcome', {username: user.username, avatar: user.avatar})

    socket.on('chatMessageFromBrowser', function(data) {
      socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
    })
  }
})

module.exports = server;
