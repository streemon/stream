var spoilzr = require('spoilzr');
var async = require('async');
var querystring = require('querystring');

exports.hasRights = function (rights) {
    return function(req, res, next) {
        if(req.session && req.session.auth && req.session.user) {
        	if (req.session.user.rights >= rights) next();
        	else next("User ("+ req.session.user.rights +") doesn't have sufficient rights ("+ rights +")");
        }
        else {
        	next ("Forbidden - You must be logged in");
        }
    }
}

exports.login = function (req, res, next) {
	function authorizeUser (session) {
		var menu = [{href: '/settings', title: 'Settings'}, {href: '/links', title: 'My Links'}];
		if (req.session.user.rights >= 2) menu.push({href: '/moderate', title: 'Moderate'});

		var userPublic = {auth: session.auth, username: session.user.username, avatar: session.user.avatar, menu: menu};

		return res.json(200, {msg: "Authorized", user: userPublic});
	}

	if (req.body.username) {
		var spoilzrClient = new spoilzr();

		if (req.body.password) {
			spoilzrClient.post('login', {form: {username: req.body.username, password: req.body.password}}, function (err, data, response) {
				if (err || data.statusCode != 200) return res.json(400, {msg: "Spoilzr error"});

				var userData = JSON.parse(response).user;

				req.db.User.findOneAndUpdate({spoilzrId: userData.spoilzrId}, {token: userData.token, avatar: userData.avatar, lastLogin: new Date()}, function (err, doc) {
					if (err) throw err;
					
					if (doc) {
						req.session.auth = true;
						req.session.user = doc;

						authorizeUser(req.session);
					}
					else {
						req.db.User.create(userData, function(err, doc) {
							if (err) throw err;

							req.session.auth = true;
							req.session.user = doc;

							authorizeUser(req.session);
						});
					}
				})
				
			});
		}
		else {
			return res.json(400, {msg: "Password not provided"});
		}
	}
	else return res.json(400, {msg: "Username not provided"});
};

exports.home = function (req, res, next) {
	if (req.session.auth && req.session.user) {
		var userPublic = {auth: req.session.auth, username: req.session.user.username, avatar: req.session.user.avatar};
	}
	else {
		var userPublic = {auth: false};
	}
	return res.json(200, userPublic);
}

exports.lists = function (req, res, next) {
	var spoilzrClient = new spoilzr();
	var form = {};

	if (req.query.media) form.media = req.query.media
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	spoilzrClient.get('lists', form, function (err, doc) {
		if (err) throw err;

		return res.json(200, doc);
	})
}

exports.search = function (req, res, next) {
	var spoilzrClient = new spoilzr();

	var form = {};
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	spoilzrClient.get('search/' + req.params.media + '/' + req.params.q, form, function (err, data) {
		if (err) throw err;

		if (data) {
			var results = JSON.parse(data.body);
			res.json(200, results);
		}
	})
}

exports.getMovieById = function (req, res, next) {
	var spoilzrClient = new spoilzr();

	var form = {};
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	spoilzrClient.get('movies/' + req.params.id, form, function (err, data) {
		if (err) throw err;

		if (data) {
			var media = JSON.parse(data.body);
			res.json(200, media);
		}
	})
}

exports.getShowById = function (req, res, next) {
	var spoilzrClient = new spoilzr();
	var url = 'shows/' + req.params.id;
	var form = {};

	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	if (req.query) url += '?' + querystring.stringify(req.query);

	spoilzrClient.get(url, form, function (err, data) {
		if (err) throw err;

		if (data) {
			var media = JSON.parse(data.body);
			res.json(200, media);
		}
	})
}

exports.getShowByHashtag = function (req, res, next) {
	var spoilzrClient = new spoilzr();

	var form = {};
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	spoilzrClient.get('shows/!' + req.params.hashtag, form, function (err, data) {
		if (err) throw err;

		if (data) {
			var media = JSON.parse(data.body);
			res.json(200, media);
		}
	})
}

exports.logout = function(req, res) {
	if (req.session && req.session.user) {
		console.info('Logout USER: ' + req.session.user._id);
		req.session = null;
		return res.json(200, {msg: 'Successfully logged out !', user: {auth: false}});
	}
	else res.json(400, {msg: 'Already logged out'});
};

exports.notifyFollowers = function (req, mediaId, media) {
	req.db.Notification.findOne({mediaId: mediaId, media: media}, function (err, results) {
		if (err) return false;

		//if a notification already exists, the media has already been activated
		if (results) {
			return false;
		}
		else {
			req.db.User.find({subscriptions: {$elemMatch: {media: media, mediaId: mediaId}}}, function (err, subscribers) {
				if (err) return false;

				async.each(subscribers, function(subscriber, callback) {
					var notif = new req.db.Notification({media: media, mediaId: mediaId, _receiverId: subscriber._id});
					notif.save();
					callback();
				}, function (err) {
					if (err) return false;

					//record notification with empty _receiverId as proof of past activation
					var notif = new req.db.Notification({media: media, mediaId: mediaId});
					return notif.save();
				})
			})
		}
	})
}
