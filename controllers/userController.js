const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require('../models/Follow')
const sendGrid = require('@sendgrid/mail')

sendGrid.setApiKey(process.env.SENDGRIDAPIKEY)

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to access that page");
    req.session.save(function () {
      res.redirect("/");
    });
  }
};

exports.sharedProfileData = async function(req, res, next) {
  let isVisitorsProfile = false
  let isFollowing = false
  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
    isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
  }

  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing

  // retrieve post, follower, and following counts
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id)
  let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])

  req.postCount = postCount
  req.followerCount = followerCount
  req.followingCount = followingCount
  next()
}

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        email: user.data.email,
        avatar: user.avatar,
        _id: user.data._id,
      };
      // console.log(req.session.user.email);
      sendGrid.send({
          to: req.session.user.email,
          from: 'ridatwork@gmail.com' ,
          subject: 'Welcome to Write-X',
          html: `<h2>Hola 👋👋 <strong>${req.session.user.username}</strong></h2>
          <h4>Welcome to Write-X, the place to write and share your stories.</h4>
          <h5>We hope you enjoy your time here.</h5>
          <h5> You can start creating the post <a href="http://writex.herokuapp.com/create-post">here</a>  </h5>
          <h6>Request a feature or report a bug <a href="mailto:ridatwork@gmail.com">@ridatwork@gmail.com </a> </h6>
          
          `
        })
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch((regErrors) => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      // console.log(user.data);
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        email: user.data.email,
        _id: user.data._id,
      };
      req.session.save(function () {
        res.redirect("/");
      });
      // res.send(result);
    })
    .catch(function (e) {
      req.flash("errors", e);
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
  // res.send("Successfully Logged out")
};

exports.home = async function (req, res) {
  if (req.session.user) {
    // fetch feed of posts for current user
    let posts = await Post.getFeed(req.session.user._id)
    res.render("home-dashboard", {posts: posts, title: "Feed"});
  } else {
    res.render("home-guest", {
      regErrors: req.flash("regErrors"),
    });
  }
};

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument;
      // console.log(req.profileUser);
      next();
    })
    .catch(function () {
      // console.log(req.params.username);
      res.render("404");
    });
};

exports.profilePostsScreen = function (req, res, next) {
  // posts by author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      res.render("profile", {
        currentPage: "posts",
        title:` Profile for ${req.profileUser.username}`,
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
      });
    })
    .catch(function () {
      res.render("404");
    });
};

exports.profileFollowersScreen = async function(req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render('profile-followers', {
      currentPage: "followers",
      title:` Followers of ${req.profileUser.username}`,
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
  } catch {
    res.render("404")
  }
}

exports.profileFollowingScreen = async function(req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id)
    res.render('profile-following', {
      currentPage: "following",
      title:` Followings of ${req.profileUser.username}`,
      following: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
  } catch {
    res.render("404")
  }
}

exports.doesUsernameExist = function(req, res) {
  User.findByUsername(req.body.username).then(function() {
    res.json(true)
  }).catch(function() {
    res.json(false)
  })
}

exports.doesEmailExist = async function(req, res) {
  let emailBool = await User.doesEmailExist(req.body.email)
  res.json(emailBool)
}