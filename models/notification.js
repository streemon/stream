var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema ({
	media: {type: String, enum: ['movies', 'episodes', 'comments'], required: true},
	mediaId: {type: Number, required: true},
	_receiverId: Schema.Types.ObjectId,
	date: {type: Date, default: Date.now},
	active: {type: Boolean, default: true, required: true}
});

module.exports = mongoose.model('Notification', NotificationSchema);