const Follow = require('../models/follow');

exports.addFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorId);
    follow.create().then(()=> {
        req.flash('success', `You are now following ${req.params.username}`);
        req.session.save(()=> res.redirect(`/profile/${req.params.username}`));
    }).catch(function(error) {
        errors.forEach(function(error) {
            req.flash('errors', error);
        });
        req.session.save(()=> res.redirect('/'));
    });
};

exports.removeFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorId)
    follow.delete().then(() => {
      req.flash("success", `Unfollowed ${req.params.username}`)
      req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch((errors) => {
      errors.forEach(error => {
        req.flash("errors", error)
      })
      req.session.save(() => res.redirect('/'))
    })
  }