var main = require('./main');
var async = require('async');
var moment = require('moment');
var querystring = require('querystring');
var spoilzr = require('spoilzr');
var _ = require("underscore");

var defaultLists = [{id: "mostWatched", position: 10, args: {media: "movies", count: 12, ago: "week"}}, {id: "mostWatched", position: 20, args: {media: "shows", count: 6, ago: "day"}}, {id: "newReleases", postion: 30, args: {media: "movies", count: 6}}];
var userLists = [{id: "watchedRecently", position: 0, args: {media: "shows", count: 6}}]
var spoilzrLists = []; //[{id: "suggested"},{id: "toWatch"}];

exports.getListById = function (req, res, next) {
	var id = parseInt(req.params.id);

	if (_.findWhere(defaultLists, {id: req.params.id}) && req.params.media) {
		exports[req.params.id](req, {media: req.params.media, count: 100}, function (err, returnList) {
			if (err) next(err);

			res.json(200, returnList);
		})
	}
	else if (_.findWhere(userLists, {id: req.params.id}) && req.params.media && req.session && req.session.user && req.session.auth) {
		exports[req.params.id](req, {media: req.params.media, count: 100}, function (err, returnList) {
			if (err) next(err);

			res.json(200, returnList);
		})
	}
	else {
		var spoilzrClient = new spoilzr();
		var url = 'lists/' + req.params.id + '/' + req.params.media;
		var form = {};

		if (req.session.auth && req.session.user && req.session.token) form.token = req.session.token;

		if (req.query) url += '?' + querystring.stringify(req.query);

		spoilzrClient.get(url, form, function (err, data, response) {
			if (err) next(err);

			if (response) {
				if (id) req.log = {action: 'view', media: 'lists', mediaId: id};
				else req.log = {action: 'view', media: 'lists', query: req.params.id};

				main.addLog(req, function (err) {
					if (err) next(err);

					return res.json(200, response);
				});
			}
			else return res.json(404, {msg: "List not found"})
		})
	}

}

exports.getLists = function (req, res, next) {
	var lists = [];
	
	if (req.session && req.session.user && req.session.auth) defaultLists = defaultLists.concat(userLists);

	async.each(defaultLists, function (list, callback) {
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
	});
}

exports.watchedRecently = function (req, args, next) {
	var count = args.count || 6;
	var title = args.title || "Watched Recently";
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

exports.newReleases = function (req, args, next) {
	var count = args.count || 6;
	var title = args.title || "New Releases";
	var list = {title: title, count: count, media: args.media, medias: []};

	req.db.Notification.aggregate([
		{$match: {media: list.media, _receiverId: null}},
		{$group: {_id: "$mediaId"}},
		{$sort: {date: -1}},
		{$limit: count}
	], function (err, results) {
		async.each(results, function (result, callback) {
			req.params.id = result._id;
			req.params.media = list.media;

			main.returnMediaById(req, function (err, media) {
				if (err == 404) callback();
				else if (err) callback (err);
				else {
					list.medias[results.indexOf(result)] = media;
					callback();
				}
			})
		}, function (err) {
			//removes empty from list
			list.medias = list.medias.filter(function(e){return e}); 
			next(err, list)
		})
	})
}

exports.mostWatched = function (req, args, next) {
	var count = args.count || 6;
	var title = args.title || "Most Watched";
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