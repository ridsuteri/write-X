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
          req.session.save(() => res.redirect(`/`))
        })
        .catch(function(errors) {
          errors.forEach(error => req.flash("errors", error))
          req.session.save(() => res.redirect("/create-post"))
        });
};
