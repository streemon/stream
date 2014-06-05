var spoilzr = require('spoilzr');

exports.hasRights = function (rights) {
    return function(req, res, next) {
        if(req.session && req.session.auth && req.session.user && req.session.user.rights >= rights)
            next();
        else
            next("User doesn't have sufficient rights");
    }
}

exports.login = function (req, res, next) {

	if (req.body.username) {
		var spoilzrClient = new spoilzr();

		if (req.body.password) {
			spoilzrClient.post('login', {form: {username: req.body.username, password: req.body.password}}, function (err, data, response) {
				if (err) res.json(400, {msg: "Spoilzr error"});

				var userData = JSON.parse(data.body).user;

				req.db.User.findOneAndUpdate({spoilzrId: userData.spoilzrId}, {token: userData.token, avatar: userData.avatar, lastLogin: new Date()}, function (err, doc) {
					if (err) throw err;
					
					if (doc) {
						req.session.auth = true;
						req.session.user = doc;

						var userPublic = {auth: req.session.auth, username: req.session.user.username, avatar: req.session.user.avatar};

						res.json(200, {msg: "Authorized", user: userPublic});
					}
					else {
						req.db.User.create(userData, function(err, doc) {
							if (err) throw err;

							req.session.auth = true;
							req.session.user = doc;

							var userPublic = {auth: req.session.auth, username: req.session.user.username, avatar: req.session.user.avatar};

							res.json(200, {msg: "Authorized", user: userPublic});
						});
					}
				})
				
			});
		}
		else {
			res.json(400, {msg: "Password not provided"});
		}
	}
	else res.json(400, {msg: "Username not provided"});
};

exports.home = function (req, res, next) {
	if (req.session.auth && req.session.user) {
		var userPublic = {auth: req.session.auth, username: req.session.user.username, avatar: req.session.user.avatar};
	}
	else {
		var userPublic = {auth: false};
	}
	res.json(200, userPublic);
}

exports.lists = function (req, res, next) {
	var spoilzrClient = new spoilzr();
	var form = {};

	if (req.query.media) form.media = req.query.media
	if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

	spoilzrClient.get('lists', form, function (err, doc) {
		if (err) throw err;

		res.json(200, doc);
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

exports.logout = function(req, res) {
  console.info('Logout USER: ' + req.session.user._id);
  req.session = null;
  res.json(200, {msg: 'Successfully logged out !', user: {auth: false}});
};
