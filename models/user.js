var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function validateUsername (val) { return /^[a-z0-9_-]{3,20}$/.test(val) }
function validatePassword (val) { return /^\S{4,30}$/.test(val) }
function validateEmail (val)	{ return /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,30}/.test(val) }

var UserSchema = new Schema ({
	username: {type: String, index: { unique: true }, required: true, validate: [validateUsername, "ALERT_USERNAME"]},
	email: {type: String, unique: true, required: true, validate: [validateEmail, "ALERT_INVALIDEMAIL"]},
	password: {type: String, required: true, validatePassword: [validatePassword, "ALERT_PASSWORD"]},
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