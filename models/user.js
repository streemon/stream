var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
	spoilzrId: Number,
	username: String,
	avatar: String,
	token: String,
	lastLogin: {type: Date, default: Date.now},
	rights: Number
});

module.exports = mongoose.model('User', UserSchema);