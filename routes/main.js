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
				var userData = JSON.parse(data.body).user;

				req.db.User.findOneAndUpdate({spoilzrId: userData.spoilzrId}, {token: userData.token, avatar: userData.avatar, lastLogin: new Date()}, function (err, doc) {
					if (err) throw err;
					
					if (doc) {
						req.session.auth = true;
						req.session.user = doc;
						res.json(200, {msg: "Authorized"});
					}
					else {
						req.db.User.create(userData, function(err, doc) {
							if (err) throw err;

							req.session.auth = true;
							req.session.user = doc;
							res.json(200, doc);
						});
					}
				})
				
			});
		}
		else {
			next(new Error('password not provided'))
		}
	}
	else next(new Error('username not provided'))
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

exports.logout = function(req, res) {
  console.info('Logout USER: ' + req.session.user._id);
  req.session = null;
  res.send({
    msg: 'Logged out'
  });
};