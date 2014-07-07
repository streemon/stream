/*
 * GET home page & partials.
 */

exports.index = function(req, res){
	var moderator = false;
	if (req.session && req.session.user && req.session.user.rights >= 2) moderator = true;
	res.render('index', {moderator: moderator});
};

exports.protected = function(req, res){
	var name = req.params.name;
	res.render('protected/' + name, {session: req.session});
};

exports.userpartials = function(req, res) {
  var name = req.params.name;
  res.render('userpartials/' + name);
};

exports.partials = function(req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

//API Routing
exports.main = require('./main');
exports.users = require('./users');
exports.comments = require('./comments');
exports.links = require('./links');
exports.notifications = require('./notifications');
exports.lists = require('./lists');