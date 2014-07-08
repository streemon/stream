var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinkSchema = new Schema ({
	media: {type: String, enum: ['movies', 'episodes']},
	mediaId: {type: Number, required: true},
	url: {type: String, validate: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ },
	iframe: String,
	language: String,
	subtitles: String,
	host: String,
	views: {type: Number, required: true, default: 1},
	data: {type: Date, default: Date.now},
	flags: [{_flaggerId: Schema.Types.ObjectId, reason: String}],
	_uploaderId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Link', LinkSchema);