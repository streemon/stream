var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema ({
	action: String,
	media: String,
	mediaId: Number,
	query: String,
	_authorId: {type: Schema.Types.ObjectId},
	date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Log', LogSchema);