exports.hasRights = function (rights) {
    return function(req, res, next) {
        if(req.session && req.session.auth && req.session.user && req.session.user.rights >= rights)
            next();
        else
            next("User doesn't have sufficient rights");
    }
}

exports.login = function (req, res, next) {
	req.db.User.findOne({
		username: req.body.username
	}, 
	null, {
		safe: true
	},
	function(err, user) {
		if (err) return next(err);
		
		if (user) {
			req.session.auth = true;
			req.session.user = user;

			console.info('Login USER:' + user._id);
			res.json(200, {
				msg: 'Authorized'
			});
		} else {
			next(new Error('User not found'));
		}
	});	
};

exports.logout = function(req, res) {
  console.info('Logout USER: ' + req.session.user._id);
  req.session.destroy(function(error) {
    if (!error) {
      res.send({
        msg: 'Logged out'
      });
    }
  });
};

exports.home = function (req, res, next) {
	//TO DO, varies if logged in, can be mediaOnly-ed
	if (req.session.auth) {
		//gets last watched tv shows
		//recommended movies
	}

	//Get featured movies/tv shows from Stream

	//Get random lists from Board

}