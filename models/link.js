var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinkSchema = new Schema ({
	media: {type: String, enum: ['movies', 'episodes']},
	mediaId: Number,
	url: {type: String, validate: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ },
	lang: String,
	subtitles: String,
	views: {type: Number, required: true, default: 1},
	data: {type: Date, default: Date.now},
	_uploaderId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Link', LinkSchema);