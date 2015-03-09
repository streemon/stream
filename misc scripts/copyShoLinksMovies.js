/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var MovieDB = require('moviedb')("31686aca9fbc2a5134532f725a4beb2d");
var async = require ('async');

/*
	SQL FILMS: SELECT entrees.URL as url, ID_IMDB as imdbId, langue FROM entrees INNER JOIN films ON entrees.ID_support = films.ID WHERE entrees.support = "film"  AND ID_IMDB != "tt" AND ID_IMDB NOT NULL
	SQL EPISODES: SELECT entrees.URL as url, ID_tvdb as tvdbId, langue FROM entrees INNER JOIN episodes ON entrees.ID_episode = episodes.ID WHERE entrees.support = "serie" AND ID_tvdb != 0 
*/

//Connect to db
var dbUrl = 'mongodb://root:root@localhost:27017/stream';
var connection = mongoose.createConnection(dbUrl);

var linksSho = connection.model('linkMoviesSho', new mongoose.Schema({imdbId: String, url: String, tmdbId: Number, langue: String}), 'linksMoviesSho');


connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
	console.info('connected to database')

	//change for movies
	var stream = linksSho.aggregate().match({tmdbId: 0}).group({_id: "$imdbId"}).limit(50).exec(function (err, docs) {
		if (err) console.log(err);

	  //this.pause();
	  //var that = this;
	  async.each(docs, function (doc, callback) {
		if (doc._id.substring(0,2) == "tt") var imdbId = doc._id;
		else var imdbId = "tt" + doc._id;
		
		  MovieDB.find({id: imdbId, external_source: "imdb_id"}, function (err, data) {
		  	//if (data && data.tv_episode_results[0]) {

		  		if (data && data.movie_results[0] && data.movie_results[0].id) var tmdbId = data.movie_results[0].id;

		  		linksSho.update({imdbId: doc._id}, {$set: {"tmdbId": tmdbId || -1}}, {multi: true}, function (err, numberAffected, raw) {
		  			if (err) callback(err);

		  			console.log(tmdbId || -1, imdbId, numberAffected + " updated");
		  			callback();
		  		})
		  	//}
			//else callback(err);
		  	//that.resume();
		  })
	  }, function (err) {
	  	if (err) console.log(err);
	  	process.exit();
	  })
	})
});



