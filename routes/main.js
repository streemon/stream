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

exports.addLog = function (req, next) {
	var log = req.log;
	if (req.session && req.session.user && req.session.auth) log._authorId = req.session.user._id;
	log = new req.db.Log(log);
	log.save(function (err) {
		req.log = null;
		next(err);
	});
}

exports.login = function (req, res, next) {
	function authorizeUser (session) {
		var userPublic = {auth: session.auth, _id: session.user._id, username: session.user.username, avatar: session.user.avatar, settings: session.user.settings, rights: session.user.rights, lastActivity: session.user.lastActivity};

		return res.json(200, {msg: "Authorized", user: userPublic});
	}

	if (req.body.username) {
		var spoilzrClient = new spoilzr();

		if (req.body.password) {
			spoilzrClient.post('login', {form: {username: req.body.username, password: req.body.password}}, function (err, data, response) {
				if (err || data.statusCode != 200) return res.json(400, {msg: "Spoilzr error"});

				var userData = JSON.parse(response).user;

				req.db.User.findOneAndUpdate({spoilzrId: userData.spoilzrId}, {token: userData.token, avatar: userData.avatar, lastActivity: new Date()}, function (err, doc) {
					if (err) next(err);
					
					if (doc) {
						req.session.auth = true;
						req.session.user = doc;
						req.session.userPublic = {_id: doc._id, username: doc.username, avatar: doc.avatar};

						req.log = {action: 'login', media: 'self'};

						exports.addLog(req, function (err) {
							if (err) next(err);

							authorizeUser(req.session);
						});
					}
					else {
						//if no account exists we create one
						req.db.User.create(userData, function(err, doc) {
							if (err) next(err);

							req.session.auth = true;
							req.session.user = doc;
							req.session.userPublic = {_id: doc._id, username: doc.username, avatar: doc.avatar};

							req.log = {action: 'signup', media: 'self'};

							exports.addLog(req, function (err) {
								if (err) next(err);

								authorizeUser(req.session);
							});
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
			req.log = {action: 'search', media: req.params.media, query: req.params.q};

			exports.addLog(req, function (err) {
				if (err) next(err);

				var results = JSON.parse(data.body);
				res.json(200, results);
			});
		}
	})
}

exports.returnMediaById = function (req, next) {
	var spoilzrClient = new spoilzr();
	var mediaType = req.params.media || "movies";
	var url = mediaType + '/' + req.params.id;
	var form = {};
	
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;
	if (req.query) url += '?' + querystring.stringify(req.query);

	spoilzrClient.get(url, form, function (err, data) {
		if (err) next(err);

		var media = JSON.parse(data.body);

		if (data.statusCode == 200) {
			req.log = {action: 'view', media: mediaType, mediaId: req.params.id};

			exports.addLog(req, function (err) {
				if (err) next(err);

				next(err, media);
			});
		}
		else return next(data.statusCode, media);
	})
}

exports.getShowById = exports.getMovieById = function (req, res, next) {
	exports.returnMediaById(req, function (err, media) {
		if (err) {
			if (err == 404) return res.json(404, media)
			else next(err);
		}

		return res.json(200, media);
	});
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
		req.log = {action: 'logout', media: 'self'};
		
		exports.addLog(req, function (err) {
			if (err) next(err);

			req.session = null;
			return res.json(200, {msg: 'Successfully logged out !', user: {auth: false}});
		});
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
