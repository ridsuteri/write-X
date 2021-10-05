const postsCollecetion = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectId;

let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }

  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  //   reject garbage properties
  console.log(this.userid);
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("Please provide Title");
  }

  if (this.data.body == "") {
    this.errors.push("Please provide the body");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      postsCollecetion
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Something went wrong!");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Post;
