var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema ({
	media: {type: String, enum: ['movies', 'episodes'], required: true},
	mediaId: {type: Number, required: true},
	_receiverId: Schema.Types.ObjectId,
	active: Number
});

module.exports = mongoose.model('Notification', NotificationSchema);