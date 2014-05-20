/*
 * GET home page.
 */

exports.index = function(req, res){
	if (req.params.page) res.render(req.params.page);
	else res.render('index');
};

exports.partials = function(req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};