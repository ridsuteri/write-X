const Post = require("../models/Post");
const sendGrid = require('@sendgrid/mail')

sendGrid.setApiKey(process.env.SENDGRIDAPIKEY)
exports.viewCreateScreen = function (req, res) {
  res.render("create-post",{title: "Create Post"});
};

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function (newId) {
      // console.log(req.session.user)
      // sendGrid.send({
      //   to: req.session.user.email,
      //   from: 'ridatwork@gmail.com' ,
      //   subject: 'New Post',
      //   html: `<strong>Yay 🎉🎉 new post has been created.</strong>
      //   <div>You can view it here: http://write-x.herokuapp.com/post/${newId}</div>`
      // })

      req.flash("success", "New post successfully created");
      req.session.save(() => res.redirect(`/post/${newId}`));
    })
    .catch(function (errors) {
      // console.log(errors);
      errors.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect("/create-post"));
    });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post, title: post.title });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post, title: `Edit | ${post.title}` });
    } else {
      req.flash("errors", "You do not have permission to perform that action");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404", { title: "404" });
  }
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      // successfully updated in db
      // or user have permission, but validation errors
      if (status == "success") {
        // post was updated in db
        req.flash("success", "Post successfully updated.");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}`);
        });
      } else {
        post.errors.forEach(function (error) {
          req.flash("errors", error);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // requested id doesn't exist
      // or current visitor not the owner of post
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted.");
      req.session.save(() => res.redirect(`/profile/${req.session.user.username}`));
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    });
}

exports.search = function(req, res) {
  Post.search(req.body.searchTerm).then(posts => {
    res.json(posts)
  }).catch(() => {
    res.json([])
  })
}