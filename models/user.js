var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
	spoilzrId: {type: Number, required: true},
	username: {type: String, required: true},
	avatar: String,
	token: String,
	settings: {
		lang: String,
		subtitles: [String]
	},
	subscriptions: {
		movies: [Number],
		shows: [Number]
	}
	lastActivity: {type: Date, default: Date.now},
	rights: Number
});

module.exports = mongoose.model('User', UserSchema);