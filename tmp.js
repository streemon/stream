/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var MovieDB = require('moviedb')("31686aca9fbc2a5134532f725a4beb2d");
var async = require ('async');

//Connect to db
var dbUrl = 'mongodb://root:root@localhost:27017/stream';
var connection = mongoose.createConnection(dbUrl);

var linksSolar = connection.model('linkSolar', new mongoose.Schema({imdbId: String, url: String, tmdbId: Number}), 'linksSolar');


connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
	console.info('connected to database')

	
	var stream = linksSolar.aggregate().match({tmdbId: 0}).group({_id: "$imdbId"}).skip(8000).limit(200).exec(function (err, docs) {
		if (err) console.log(err);
	  //this.pause();
	  //var that = this;
	  async.each(docs, function (doc, callback) {
		  MovieDB.find({id: "tt" + doc._id, external_source: "imdb_id"}, function (err, data) {
		  	if (data && data.movie_results[0]) {
		  		linksSolar.update({imdbId: doc._id}, {$set: {"tmdbId": data.movie_results[0].id}}, {multi: true}, function (err, numberAffected, raw) {
		  			if (err) callback(err);
		  			console.log(data.movie_results[0].title, data.movie_results[0].id, doc._id, numberAffected + " updated");
		  			callback();
		  		})
		  	}
			else callback();
		  	//that.resume();
		  })
	  }, function (err) {
	  	if (err) console.log(err);
	  	process.exit();
	  })
	})
});



