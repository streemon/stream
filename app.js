
/**
 * Module dependencies
 */
var express = require('express'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path');

var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));

// development only
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
					message: err.message,
					error: err
			});
	});
}

// production only
if (app.get('env') === 'production') {
	// TODO
};

/**
 * Routes
 */

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
