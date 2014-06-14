var LIMIT = 10;
var SKIP = 0;

exports.getComments = function(req, res, next) {
	var limit = req.query.limit || LIMIT;
	var skip = req.query.skip || SKIP;
	
	req.db.Comment.find(
		{media: req.params.media, mediaId: req.params.id},
		null,
		{limit: limit, skip: skip, sort: {date: -1}},
		function(err, list){
			if (err) next(err);

			res.json(200, list);
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
		function(err, list){
			if (err) next(err);
			res.json(200, list);
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
		if (err) next(err);
		res.json(200, comment);
	})
}

exports.update = function (req, res, next) {
	res.json(req.body);
}

exports.del = function (req, res, next) {
	res.json(req.body);
}