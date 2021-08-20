const { MongoClient } = require("mongodb");
const dotenv = require('dotenv');
dotenv.config()

const connectionString = process.env.CONNECTION_STRING
const port = process.env.PORT || 3000;
MongoClient.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  module.exports = client
  const app = require('./app')
  app.listen(port)
})