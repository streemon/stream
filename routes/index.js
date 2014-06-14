/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};

exports.moderate = function(req, res){
	res.render('moderate', {session: req.session});
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