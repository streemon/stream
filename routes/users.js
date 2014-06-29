exports.getUsers = function(req, res, next) {
	req.db.User.find({}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.getUserById = function(req, res, next) {
	req.db.User.findById(req.params.id, '_id username avatar spoilzrId', function (err, obj) {
		if (err) next(err);
		if (!obj) return res.json(404, {msg: 'User not found'});

		res.json(200, obj);
	})
}

exports.getUserByUsername = function(req, res, next) {
	req.db.User.findOne({username: req.params.username}, '_id username avatar spoilzrId', function (err, obj) {
		if (err) next(err);
		if (!obj) return res.json(404, {msg: 'User not found'});

		res.json(200, obj);
	})
}

exports.updateSettings = function(req, res, next) {
	var form = req.body;
	var settings = form.settings;
	if (!settings) res.json(400, {msg: 'No settings given'});

	if (req.session.user && req.session.auth) {
		req.db.User.update({_id: req.session.user._id}, {$set: {settings: settings}}, function (err, numberAffected) {
			res.json(200, {msg: 'Settings updated !', affected: numberAffected})
		})
	}
	else {
		res.json(400, {msg: 'Not connected'})
	}
}