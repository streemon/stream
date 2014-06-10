var async = require('async');

exports.getLinks = function(req, res, next) {
	req.db.Link.find({media: req.params.media, mediaId: req.params.id}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.add = function(req, res, next) {
	var links = req.body;
	var savedLinks = [];

	async.each(links, function(link, next) {
		saveLink(link, function (err, link) {
			if (err && err.name == 'ValidationError') {
				return next();
			}
			else {
				savedLinks.push(link);
				next();
			}
		});
	}, function (err) {
		if (err) next(err);

		if (savedLinks.length) res.json(200, savedLinks);
		else res.json(400, {msg: 'Error during Validation'});
	})

	function saveLink (link, next) {
		link = new req.db.Link(link);

		link.save(function(err) {
			next(err, link);
		})
	}
}

exports.update = function (req, res, next) {
	var link = req.body;
	
	req.db.Link.findOne({_id: link._id}, function (err, doc) {
		if (err) next(err);

		if (doc) {
			//dirty - use _.extend ?
			doc.url = link.url;
			doc.lang = link.lang;
			doc.subtitles = link.subtitles;

			doc.save(function(err) {
				if (err) next (err);

				res.json(200, doc);
			})
		}
		else res.json(404, {msg: "No link found"})
	})

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