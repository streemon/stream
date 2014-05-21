exports.getLinks = function(req, res, next) {
	req.db.Link.find({media: req.params.media, mediaId: req.params.id}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.add = function(req, res, next) {
	var link = new req.db.Link(req.body);
	link.save(function(err) {
		if (err) next(err);
		res.json(link);
	})
}

exports.update = function (req, res, next) {
	res.json(req.body);
}

exports.del = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user && req.session.user.rights >= 2) {
		req.db.Link.findByIdAndRemove(req.params.id, function(err, obj) {
			if (err) next(err);
			res.json(200, obj);
		});
	}
	else if(req.session && req.session.auth && req.session.user) {
		req.db.Link.findOneAndRemove({ _id: req.params.id, _uploaderId: req.session.user._id}, function(err, obj) {
			if (err) next(err);
			res.json(200, obj);
		});
	}
}