exports.getNotifications = function(req, res, next) {
	req.db.Notification.find({_receiverId: req.session.user._id, active: true}, null, {sort: {date: -1}}, function(err, notifications){
		if (err) next(err);
		res.json(200, notifications);
	})
}

exports.viewedNotification = function(req, res, next) {
	req.db.Notification.findOneAndUpdate({_id: req.params.id, _receiverId: req.session.user._id}, {$set: {active: false}}, function(err, doc) {
		if (err) next(err);

		res.json(200, doc);
	})
}

exports.add = function(req, res, next) {
	//todo
}
