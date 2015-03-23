var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListSchema = new Schema ({
	items: [{
		media: {type: String, enum: ['movies', 'shows']},
		mediaId: {type: Number, required: true}
	}],
	title: {type: String, required: true},
	views: {type: Number, required: true, default: 1},
	date: {type: Date, default: Date.now},
	media: {type: String, enum: ['movies', 'shows', 'episodes']},
	_authorId: {type: Schema.Types.ObjectId, index: true}
});

module.exports = mongoose.model('List', ListSchema);