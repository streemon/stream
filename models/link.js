var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinkSchema = new Schema ({
	media: String,
	mediaId: Number,
	url: String,
	lang: String,
	subtitles: String,
	_uploaderId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Link', LinkSchema);