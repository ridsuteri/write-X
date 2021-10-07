const postsCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectId;
const User = require("./User");

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
      postsCollection
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

Post.reusablePostQuery = function (uniqueOperations) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: { $arrayElemAt: ["$authorDocument", 0] },
        },
      },
    ]);

    let posts = await postsCollection.aggregate(aggOperations).toArray();

    // clean up author property in each post object
    posts = posts.map(function (post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findSingleById = function (id) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery([
      { $match: { _id: new ObjectID(id) } },
    ]);

    if (posts.length) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

module.exports = Post;
