var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinkSchema = new Schema ({
	media: {type: String, enum: ['movies', 'episodes']},
	mediaId: {type: Number, required: true},
	url: {type: String, validate: /^([a-z][a-z0-9\*\-\.]*):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$/i },
	iframe: String,
	language: String,
	subtitles: String,
	host: String,
	hostname: String,
	views: {type: Number, required: true, default: 1},
	date: {type: Date, default: Date.now},
	flags: [{_flaggerId: Schema.Types.ObjectId, reason: String}],
	_uploaderId: {type: Schema.Types.ObjectId, index: true}
});

module.exports = mongoose.model('Link', LinkSchema);