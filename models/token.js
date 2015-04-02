var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function validateEmail (val)	{ return /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,30}/.test(val) }

var TokenSchema = new Schema ({
	email: {type: String, required: true, validate: [validateEmail, "ALERT_INVALIDEMAIL"]},
	token: {type: String, required: true, unique: true},
	expiry: {type: Date, default: Date.now() + (24 * 60 * 60 * 1000)}
});

module.exports = mongoose.model('Token', TokenSchema);