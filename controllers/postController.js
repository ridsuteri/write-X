const Post = require("../models/Post");
exports.viewCreateScreen = function(req, res) {
    res.render("create-post");
};

exports.create = function(req, res) {
    let post = new Post(req.body);
    post
        .create()
        .then(function() {
          req.flash("success", "New event successfully added")
          req.session.save(() => res.redirect(`/view-all-posts`))
        })
        .catch(function(errors) {
          errors.forEach(error => req.flash("errors", error))
          req.session.save(() => res.redirect("/create-post"))
        });
};

exports.viewAllPosts = async function(req, res) {
   let post = new Post();
    try {
        post
            .viewAll()
            .then(function(posts) {
                res.render("view-all-posts", { posts: posts });
            })
            .catch((err) => {
                console.log(err);
            });
    } catch {
        res.render("404");
    }
};