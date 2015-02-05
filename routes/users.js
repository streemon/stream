var fs = require('fs');

exports.getUsers = function(req, res, next) {
	req.db.User.find({}, function(err, list){
		if (err) next(err);
		res.json(200, list);
	})
}

exports.getUserById = function(req, res, next) {
	req.db.User.findById(req.params.id, '_id username avatar', function (err, obj) {
		if (err) next(err);
		if (!obj) return res.json(404, {msg: 'User not found'});

		res.json(200, obj);
	})
}

exports.getUserByUsername = function(req, res, next) {
	req.db.User.findOne({username: req.params.username}, '_id username avatar', function (err, obj) {
		if (err) next(err);
		if (!obj) return res.json(404, {msg: 'User not found'});

		res.json(200, obj);
	})
}

exports.updateSettings = function(req, res, next) {
	var form = req.body;
	var settings = form.settings;
	if (!settings) res.json(400, {msg: 'No settings given'});

	if (req.session.user && req.session.auth) {
		req.db.User.update({_id: req.session.user._id}, {$set: {settings: settings}}, function (err, numberAffected) {
			req.session.user.settings = settings;
			res.json(200, {msg: 'Settings updated !', affected: numberAffected})
		})
	}
	else {
		res.json(400, {msg: 'Not connected'})
	}
}

exports.upload = function(req, res, next) {
	var avatar = req.body.avatar;
	var regex = /^data:image\/(\w{3,4});base64,/
	var fileFormat = regex.exec(avatar);

	if (fileFormat[1]) {
		fileFormat = fileFormat[1];
		var base64Data = avatar.replace(regex, "");
		var fileName = req.session.user._id + "." + Date.now() + "." + fileFormat
		var folderPath = "./public/img/profiles/"
		var hardPath =  folderPath + fileName
		var path = "img/profiles/" + fileName

		if (req.session.user && req.session.auth) {
			//save new avatar
			fs.writeFile(hardPath, base64Data, 'base64', function(err) {
				if (err) console.log(err);
				else {
					//deletes old avatars
					fs.readdir(folderPath, function (error, files)
					{
					    if (error) throw error;
					    var reg = new RegExp("^" + req.session.user._id);

					    files.filter(function (listedName)
					    {	
					    	var match = reg.test(listedName);
					    	return match && listedName != fileName;
					    })
					    .forEach(function(a) { fs.unlink(folderPath + a)});
					});

					req.db.User.update({_id: req.session.user._id}, {$set: {avatar: path}}, function (err, numberAffected) {
						res.json(200, {msg: 'Avatar uploaded !', src: path, affected: numberAffected});
					})
				}
			});
		}
		else {
			res.json(400, {msg: "Not connected"})
		}
	}
}