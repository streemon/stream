var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
	boardId: Number,
	username: String,
	avatar: String,
	rights: Number
});

module.exports = mongoose.model('User', UserSchema);