var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
	username: {type: String, index: { unique: true }, required: true},
	email: {type: String, unique: true, required: true, validate: /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,30}/},
	password: {type: String, required: true},
	avatar: String,
	token: String,
	settings: {
		language: {type: String, default: 'en', enum: ['en', 'fr', 'de', 'nl', 'es'], required: true},
		subtitles: [String]
	},
	subscriptions: [
		{
			media: String,
			mediaId: Number
		}
	],
	lastActivity: {type: Date, default: Date.now},
	rights: {type: Number, default: 0}
});

module.exports = mongoose.model('User', UserSchema);