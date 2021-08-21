const postsCollecetion = require("../db").db().collection("posts");

let Post = function(data) {
    this.data = data;
    this.errors = [];
};

Post.prototype.cleanUp = function() {
    if (typeof this.data.title != "string") {
        this.data.title = "";
    }
    if (typeof this.data.location != "string") {
        this.data.location = "";
    }

    //   reject garbage properties
    this.data = {
        title: this.data.title.trim(),
        location: this.data.location.trim(),
        date: this.data.date,
        description: this.data.description,
        createdDate: new Date(),
    };
};

Post.prototype.validate = function() {
    if (this.data.title == "") {
        this.errors.push("Please provide Title");
    }
    if (this.data.location == "") {
        this.errors.push("Please provide Location");
    }
    if (this.data.date == "") {
        this.errors.push("Please provide Date");
    }
    if (this.data.description == "") {
        this.errors.push("Please provide a short Description");
    }
};

Post.prototype.create = function() {
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

Post.prototype.viewAll = function() {
    return new Promise(async function(resolve, reject) {
        let post = await postsCollecetion.find({}).toArray();
        console.log(post);
        if (post) {
            resolve(post);
        } else {
            reject();
        }
    });
};

module.exports = Post;