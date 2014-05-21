exports.getUsers = function(req, res, next) {
	req.db.User.find({}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.getUser = function(req, res, next) {
	req.db.User.findById(req.params.id, function (err, obj) {
		if (err) next(err);
		if (!obj) next(new Error('User is not found'));

		res.json(200, obj);
	})
}

exports.add = function(req, res, next) {
	var user = new req.db.User(req.body);
	console.log(req.body);
	user.save(function(err) {
		if (err) next(err);
		res.json(user);
	})
}