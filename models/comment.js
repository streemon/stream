var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema ({
	media: String,
	mediaId: Number,
	_authorId: {type: Schema.Types.ObjectId, required: true},
	date: {type: Date, default: Date.now},
	comment: {type: String, required: true}
});

module.exports = mongoose.model('Comment', CommentSchema);