var async = require('async');
var querystring = require('querystring');
var crypto = require('crypto');
var Mailjet = require('mailjet-sendemail');
var mailjet = new Mailjet('8e916c64f97b1464b27cf6505fddb999', 'f4f105cdd3e9448e180fd412c7b30bae');

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

exports.resetPassword = function (req, res, next) {
	if (req.body.token && req.body.newPassword) {
		//check token && expiry date
		req.db.Token.findOne({token: req.body.token, expiry: {$gt: Date.now()}}, function (err, doc) {
			if (err) return next(err)

			if (doc) {
				//save new password
				var password = hashPassword (req.body.newPassword);

				//removes token
				doc.remove(function() {
					req.db.User.findOneAndUpdate({email: doc.email}, {$set: {password: password}}, function (err, user) {
						if (err) return next(err);

						if (user) {
							//email confirmation		
							mailjet.sendContent('contact@shostream.com',
							[doc.email],
							'ShoStream - Your password has been reset !',
							'html',
							'Hello ! <br/><br/> Your password has been reset <br/><br/> Contact us at contact@shostream.com, if you think this is a mistake!")'
							)

							return res.json(200, {msg: "ALERT_PASSWORDRESET"})
						}
						else return next("ALERT_USERNOTFOUND");
					})
				})
			}
			else {
				return next("ALERT_TOKENEXPIRED")
			}
		})



	}
	else if(req.params.email) {
		//generate token
		generateToken(function (token) {
			console.log(token)

			//save token in db
			new req.db.Token({token: token, email: req.params.email}).save(function (err, doc) {
				if (err) return next(err);

				//email token url
				mailjet.sendContent('contact@shostream.com',
					[req.params.email],
					'ShoStream - Reset your password !',
					'html',
					'Hello ! <br/><br/> Reset your password at  <a href="http://shostream.com/settings/resetpassword/' + token + '">http://shostream.com/settings/resetpassword/' + token + '</a> <br/><br/> Do not click anything if you did not request this !'
				)

				res.json(200, {msg: "ALERT_TOKENSENT"})
			})
		})

	}
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
					return res.json(400, {msg: "ALERT_WRONGCREDENTIALS"});
				}
			})
		}
		else {
			return res.json(400, {msg: "ALERT_NOPASSWORD"});
		}
	}
	else return res.json(400, {msg: "ALERT_NOUSERNAME"});
};

exports.signup = function(req, res, next) {
	if (req.body.username && req.body.email) {
		if (req.body.password) {
			var userData = {username: req.body.username, email: req.body.email, password: hashPassword(req.body.password), settings: {language: req.body.language || req.headers["accept-language"].substring(0,2)}};
						
			req.db.User.create(userData, function(err, doc) {
				if (err) {
					if (err.code == 11000) res.json(400, {errors: {email: {message: "ALERT_ALREADYINUSE"}}});
					else res.json(400, err)
				}
				else if (doc) {
					mailjet.sendContent('contact@shostream.com',
				     [doc.email],
				     'Welcome on ShoStream !',
				     'text',
				     'Hello '+ doc.username +" ! \n\n You just signed up on ShoStream and this is great :) \n\n Have fun !")
					req.log = {action: 'signup', mediaId: doc._id, media: 'user'};
					authorizeUser(req, res, doc);
				}
			});
		}
		else {
			return res.json(400, {msg: "ALERT_NOPASSWORD"});
		}
	}
	else return res.json(400, {msg: "ALERT_NOUSERNAME"});
					
};

exports.logout = function(req, res) {
	if (req.session && req.session.user) {
		req.log = {action: 'logout', media: 'user', mediaId: req.session._id};
		req.session = null;

		exports.addLog(req, function (err) {
			if (err) next(err);

			return res.json(200, {msg: 'ALERT_LOGGEDOUT', user: {auth: false}});
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
