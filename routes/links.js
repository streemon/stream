var async = require('async');
var main = require('./main');
var LIMIT = 50;
var SKIP = 0;

exports.getLinks = function(req, res, next) {
	req.db.Link.find({media: req.params.media, mediaId: req.params.id}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.getAllLinks = function(req, res, next) {
	var limit = req.query.limit || LIMIT;
	var skip = req.query.skip || SKIP;
	
	req.db.Comment.find(
		{},
		null,
		{limit: limit, skip: skip, sort: {date: -1}},
		function(err, list){
			if (err) next(err);
			res.json(200, list);
		}
	)
}

exports.getUserLinks = function(req, res, next) {
	if(req.session.user.rights >= 2) {
		var _uploaderId = req.params.id || req.session.user._id;
	}
	else  {
		var _uploaderId = req.session.user._id;
	}

	var skip = req.query.skip || SKIP;

	req.db.Link.find({_uploaderId: _uploaderId}, null, {skip: skip, limit: LIMIT, sort: {_id: -1}}, function(err, links){
		if (err) next(err);
		res.json(200, links);
	})
}

exports.flag = function (req, res, next) {
	req.db.Link.findById(req.params.id, function (err, link) {
		if (err) next (err);

		if (link) {
			var flag = {_flaggerId: req.session.user._id};

			//checks if same flag doesn't already exist
			if (link.flags && link.flags.indexOf(flag) == -1) {
				link.flags.push(flag);
				link.save();
				res.json(200, link);
			}
			else res.json(403, {msg: "Already flagged"});
		}
		else res.json(404, {msg: "Not found"});
	})
}

exports.getFlaggedLinks = function (req, res, next) {
	req.db.Link.find({flags: {$not: {$size: 0}, $exists: true}}, function (err, links) {
		if (err) next(err);
		
		res.json(200, links);
	})
}

exports.add = function(req, res, next) {
	var links = req.body;
	var savedLinks = [];
	var errors = [];

	async.each(links, function(link, next) {
		link._uploaderId = req.session.user._id;

		saveLink(link, function (err, link) {
			if (err) {
				errors.push({link: link, err: err.message});
				return next();
			}
			else {
				savedLinks.push(link);
				return next();
			}
		});
	}, function (err) {
		if (err) next(err);

		if (savedLinks.length > 0) {
			main.notifyFollowers(req, savedLinks[0].mediaId, savedLinks[0].media);
			res.json(200, savedLinks);
		}
		else res.json(400, {msg: 'Error during insertion', errors: errors});
	})

	function saveLink (link, next) {
		//check if link is ok first
		checkLink(link, function (err) {
			if (err) return next(err, link);

			link = new req.db.Link(link);

			link.save(function(err) {
				return next(err, link);
			})
		})
	}

	function checkLink (link, next) {
		//check if link is empty
		if (link.url == '') return next(new Error('Empty link'));

		//check if link exists (TODO: make changes to url w/ regex)
		req.db.Link.findOne({url: link.url}, function (err, doc) {
			if (err) return next (err);

			if (doc) return next(new Error('Link already in DB'));
			else return next(null);
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

			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No link found"});
		});
	}
	else if(req.session && req.session.auth && req.session.user) {
		req.db.Link.findOneAndRemove({ _id: req.params.id, _uploaderId: req.session.user._id}, function(err, obj) {
			if (err) next(err);

			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No link found"});
		});
	}
}