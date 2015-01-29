var async = require('async');
var querystring = require('querystring');
var crypto = require('crypto');

function hashPassword (password) {
	if (password) {
		//first md5
		password = crypto.createHash("md5").update(password).digest("hex");
		//then sha1
		password = crypto.createHash("sha1").update("è!" + password, "utf8").digest("hex");
		return password;
	}
	else return false;
}

function generateToken (next) {
	crypto.randomBytes(48, function(ex, buf) {
	  var token = buf.toString('hex');
	  next(token);
	});
}

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

function authorizeUser (req, res, user) {
	exports.addLog(req, function (err) {
		if (err) console.log(err);

		req.session.auth = true;
		req.session.user = user;
		req.session.userPublic = {auth: req.session.auth, _id: user._id, username: user.username, avatar: user.avatar, settings: user.settings, rights: user.rights, lastActivity: user.lastActivity};

		return res.json(200, {msg: "Authorized", user: req.session.userPublic});
	})
}

exports.login = function (req, res, next) {

	if (req.body.username) {
		if (req.body.password) {
			req.db.User.findOneAndUpdate({username: req.body.username, password: hashPassword(req.body.password)}, {lastActivity: new Date()}, function (err, doc) {
				if (err) next(err);

				if (doc) {
					req.log = {action: 'login',  mediaId: doc._id, media: 'user'};
					authorizeUser(req, res, doc);
				}
				else { 
					return res.json(400, {msg: "Wrong credentials"});
				}
			})
		}
		else {
			return res.json(400, {msg: "Password not provided"});
		}
	}
	else return res.json(400, {msg: "Username not provided"});
};

exports.signup = function(req, res, next) {
	if (req.body.username && req.body.email) {
		if (req.body.password) {
			var userData = {username: req.body.username, email: req.body.email, password: hashPassword(req.body.password), settings: {language: req.headers["accept-language"].substring(0,2)}};
						
			req.db.User.create(userData, function(err, doc) {
				if (err) {
					if (err.name == "ValidationError") res.json(400, {msg: "Wrong email"});
					else if (err.code == 11000) res.json(400, {msg: "Email or username already in use"});
					else res.json(400, err)
				}
				else if (doc) {
					req.log = {action: 'signup', mediaId: doc._id, media: 'user'};
					authorizeUser(req, res, doc);
				}
			});
		}
		else {
			return res.json(400, {msg: "Password not provided"});
		}
	}
	else return res.json(400, {msg: "Username/email not provided"});
					
};

exports.logout = function(req, res) {
	if (req.session && req.session.user) {
		req.log = {action: 'logout', media: 'user', mediaId: req.session._id};
		req.session = null;

		exports.addLog(req, function (err) {
			if (err) next(err);

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
