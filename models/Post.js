const postsCollecetion = require("../db").db().collection("posts");

let Post = function(data) {
    this.data = data;
    this.errors = [];
};

Post.prototype.cleanUp = function() {
    if (typeof this.data.title != "string") {
        this.data.title = "";
    }

    //   reject garbage properties
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
    };
};

Post.prototype.validate = function() {
    if (this.data.title == "") {
        this.errors.push("Please provide Title");
    }
    
    if (this.data.body == "") {
        this.errors.push("Please provide the body");
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

module.exports = Post;