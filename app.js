const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

const port = 3000 || process.env.PORT;
const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
