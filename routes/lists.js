var main = require('./main');
var async = require('async');
var moment = require('moment');
var querystring = require('querystring');
var _ = require("underscore");

var defaultLists = [{id: "mostWatched", position: 10, args: {media: "movies", count: 12, ago: "week"}}, {id: "mostWatched", position: 20, args: {media: "shows", count: 6, ago: "day"}}, {id: "newReleases", postion: 30, args: {media: "movies", count: 6}}];
var userLists = [{id: "watchedRecently", position: 0, args: {media: "shows", count: 6}}]

exports.getListById = function (req, res, next) {
	if (_.findWhere(defaultLists, {id: req.params.id}) && req.params.media) {
		exports[req.params.id](req, res)
	}
	else if (_.findWhere(userLists, {id: req.params.id}) && req.params.media && req.session && req.session.user && req.session.auth) {
		exports[req.params.id](req, res)
	}
	else {
		req.db.List.findOne({_id: req.params.id}, function (err, doc) {
			if (err) next (err);
			
			if (doc) {
				if (req.params.media) doc.media = req.params.media;
				res.json(200, doc);
			}
			else return res.json(404, {msg: "List not found", code: 1})
		})
	}

}

exports.getLists = function (req, res, next) {
	var lists = [];
	
	if (req.session && req.session.user && req.session.auth) processLists = defaultLists.concat(userLists);
	else processLists = defaultLists;

	async.each(
		processLists, 
		function (list, callback) {
			if (!req.params.media || req.params.media == list.args.media) {
				exports[list.id](req, list.args, function(err, returnList) {
					if (err) callback(err);

					returnList.id = list.id;
					lists[list.position] = returnList;
					callback();
				})
			}
			else callback();
		}, function (err) {
			if (err) next(err);
			
			lists = lists.filter(function(e){return e}); 
			res.json(200, lists);
		}
	);
}

exports.getUserLists = function (req, res, next) {
	var listQuery = req.db.List.find({_authorId: req.params.id});

	listQuery.exec(function(err, lists){
		if (err) next(err);

		res.json(200, lists);
	})
}

exports.addList = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user) {
		list = new req.db.List({
			items: [{
				media: req.body.media,
				mediaId: req.body.mediaId
			}],
			title: req.body.title,
			_authorId: req.session.user._id
		});

		list.save(function(err) {
			if (err) return next(err)
			else res.json(200, list);
		})
	}		
}
exports.removeList = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user && req.session.user.rights >= 2) {
		req.db.List.findByIdAndRemove(req.params.id, function(err, obj) {
			if (err) next(err);

			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No list found"});
		});
	}
	else if(req.session && req.session.auth && req.session.user) {
		req.db.List.findOneAndRemove({ _id: req.params.id, _authorId: req.session.user._id}, function(err, obj) {
			if (err) next(err);

			if(obj) res.json(200, obj);
			else res.json(404, {msg: "No list found"});
		});
	}
}
exports.addListItem = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user && req.body && req.body.media && req.body.mediaId) {
		req.db.List.findOne({ _id: req.params.id, _authorId: req.session.user._id}, function(err, list) {
			if (err) next(err);

			if (list) {
				var mediaObj = {media: req.body.media, mediaId: req.body.mediaId};
				list.items.push(mediaObj);

				list.save(function(err) {
					if (err) return next(err)

					else res.json(200, list);
				})
			}
			else res.json(404, {msg: "No list found"});
		});
	}
}
exports.removeListItem = function (req, res, next) {
	if(req.session && req.session.auth && req.session.user) {
		req.db.List.findOneAndUpdate({ _id: req.params.id, _authorId: req.session.user._id}, {$pull: {"items": {_id: req.params.itemId}}}, {new: true}, function(err, list) {
			if (err) next(err);

			else res.json(200, list);
		});
	}
}

exports.watchedRecently = function (req, args, next) {
	var count = args.count || 6;
	var title = args.title || "LIST_WATCHEDRECENTLY";
	var list = {title: title, media: args.media, count: count, medias: []};

	req.db.Log.aggregate([
		{$match: {media: list.media, action: "view", _authorId: new req.db.Log({_authorId: req.session.user._id})._authorId}},
		{$group: {_id: "$mediaId"}},
		{$sort: {date: -1}},
		{$limit: count}
	], function (err, logs) {
		async.each(logs, function (log, callback) {
			req.params.id = log._id;
			req.params.media = list.media;

			main.returnMediaById(req, function (err, media) {
				if (err == 404) callback();
				else if (err) callback (err);
				else {
					list.medias[logs.indexOf(log)] = media;
					callback();
				}
			})
		}, function (err) {
			list.medias = list.medias.filter(function(e){return e}); 
			next(err, list)
		})
	})
}

exports.newReleases = function (req, res) {
	var count = 6;
	var title = "LIST_NEWRELEASES";
	var list = {title: title, url: "newReleases", count: count, media: req.params.media, items: []};

	req.db.Notification.aggregate([
		{$match: {media: list.media, _receiverId: null}},
		{$group: {_id: "$mediaId"}},
		{$sort: {date: -1}},
		{$limit: count}
	], function (err, results) {
		results.forEach(function (result) {
			var item = {media: req.params.media, mediaId: result._id};
			list.items.push(item);
		})
		res.json(200, list);
	})
}

exports.mostWatched = function (req, args, next) {
	var count = args.count || 6;
	var title = args.title || "LIST_MOSTWATCHED";
	var ago = args.ago || "week";

	var list = {title: title, count: count, ago: ago, media: args.media, medias: []};
	var dt = moment().startOf(ago)._d;

	req.db.Log.aggregate([
		{$match: {date: {$gte: dt}, media: list.media, action: "view"}},
		{$group: {_id: "$mediaId", count: {$sum: 1}}}, 
		{$sort: {count: -1}},
		{$limit: count}
	], function (err, results) {

		async.each(results, function (result, callback) {
			req.params.id = result._id;
			req.params.media = list.media;

			main.returnMediaById(req, function (err, media) {
				if (err) callback (err);
				else if (media) {
					media.views = result.count;
					list.medias[results.indexOf(result)] = media;
					callback();
				}
				else callback();
			})
		}, function (err) {
			//removes empty from list
			list.medias = list.medias.filter(function(e){return e}); 
			next(err, list)
		})
	});
}