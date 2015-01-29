var async = require('async');

var LIMIT = 10;
var SKIP = 0;

function getUser (req, id, next) {
	req.db.User.findById(id, '_id username avatar', function (err, obj) {
		next(err, obj);
	})
}


exports.getComments = function(req, res, next) {
	var limit = req.query.limit || LIMIT;
	var skip = req.query.skip || SKIP;
	
	req.db.Comment.find(
		{media: req.params.media, mediaId: req.params.id},
		null,
		{limit: limit, skip: skip, sort: {date: -1}},
		function(err, comments){
			if (err) next(err);

			var coms = [];

			async.each(comments, function (comment, callback) {
				req.db.User.findById(comment._authorId, '_id username avatar rights', function (err, author) {
					if (err) callback(err);

					var com = {comment: comment, author: author};

					coms[comments.indexOf(comment)] = com;
					callback();
				})
			}, function (err) {
				if (err) next(err);

				res.json(200, coms);
			});
		}
	)
}

exports.getAllComments = function(req, res, next) {
	var limit = req.query.limit || LIMIT;
	var skip = req.query.skip || SKIP;
	
	req.db.Comment.find(
		{},
		null,
		{limit: limit, skip: skip, sort: {date: -1}},
		function(err, comments){
			if (err) next(err);
			var coms = [];

			async.each(comments, function (comment, callback) {
				req.db.User.findById(comment._authorId, '_id username avatar rights', function (err, author) {
					if (err) callback(err);

					var com = {comment: comment, author: author};

					coms[comments.indexOf(comment)] = com;
					callback();
				})
			}, function (err) {
				if (err) next(err);

				res.json(200, coms);
			});
		}
	)
}

exports.getComment = function(req, res, next) {
	req.db.Comment.findById(req.params.id, function (err, obj) {
		if (err) next(err);
		if (!obj) next(new Error('Comment is not found'));

		res.json(200, obj);
	})
}

exports.add = function(req, res, next) {
	if(req.body) var comment = req.body;
	else return res.json(400, {msg: 'No comment given'});

	comment._authorId = req.session.user._id;
	comment = new req.db.Comment(comment);

	comment.save(function(err) {
		if (err) {
			if (err.name == 'ValidationError') res.json(500, {msg: "Invalid comment"});
			else next(err);
		} 

		res.json(200, {comment: comment, author: req.session.userPublic});
	})
}

exports.update = function (req, res, next) {
	res.json(req.body);
}

exports.del = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user && req.session.user.rights >= 2) {
		req.db.Comment.findByIdAndRemove(req.params.id, function(err, obj) {
			if (err) next(err);
			
			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No comment found"});
		});
	}
	else if(req.session && req.session.auth && req.session.user) {
		req.db.Comment.findOneAndRemove({ _id: req.params.id, _authorId: req.session.user._id}, function(err, obj) {
			if (err) next(err);

			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No comment found"});
		});
	}
}