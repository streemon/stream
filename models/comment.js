var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema ({
	media: String,
	mediaId: Number,
	_authorId: Schema.Types.ObjectId,
	date: {type: Date, default: Date.now},
	comment: String
});

module.exports = mongoose.model('Comment', CommentSchema);