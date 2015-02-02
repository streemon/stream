
/**
 * Module dependencies
 */
var express = require('express'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	bodyParser = require('body-parser'),
	routes = require('./routes'),
	mongoose = require('mongoose'),
	models = require('./models'),
	http = require('http'),
	path = require('path');

var app = module.exports = express();

// Configure all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('1<1v2v1e@v1v221vv:ù^*K33'));
app.use(session({ secret: 'kaplantoeflibtthirdedition', name: 'sid'}))
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

//Connect to db
var dbUrl = 'mongodb://root:root@localhost:27017/stream';
var connection = mongoose.createConnection(dbUrl);
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
  console.info('connected to database')
});

function db (req, res, next) {
  req.db = {
    User: connection.model('User', models.User, 'users'),
    Link: connection.model('Link', models.Link, 'links'),
    Log: connection.model('Log', models.Log, 'logs'),
    Comment: connection.model('Comment', models.Comment, 'comments'),
    Notification: connection.model('Notification', models.Notification, 'notifications'),
    List: connection.model('List', models.List, 'lists')
  };
  return next();
}

/**
 * Routes
 */

//Serve App
app.get('/', routes.index);
app.get('/protected/:name', routes.main.hasRights(2), routes.protected);
app.get('/userpartials/:name', routes.main.hasRights(0), routes.userpartials);
app.get('/partials/:name', routes.partials);

//Serve API
//MAIN
app.post('/api/login', db, routes.main.login);
app.post('/api/signup', db, routes.main.signup);
app.get('/api/logout', db, routes.main.logout);

//LISTS
app.get('/api/lists/:media(movies|shows)?', db, routes.lists.getLists);
app.get('/api/lists/:id/:media(movies|shows)?', db, routes.lists.getListById);
app.delete('/api/lists/:id', routes.main.hasRights(0), db, routes.lists.removeList);
app.put('/api/lists/:id', routes.main.hasRights(0), db, routes.lists.addListItem);
app.delete('/api/lists/:id/:itemId', routes.main.hasRights(0), db, routes.lists.removeListItem);
app.get('/api/users/:id/lists', db, routes.lists.getUserLists);
app.post('/api/lists', routes.main.hasRights(0), db, routes.lists.addList);

//USERS
//app.get('/api/users', db, routes.users.getUsers);
app.get('/api/users/@:username', db,routes.users.getUserByUsername);
app.get('/api/users/:id', db,routes.users.getUserById);
//app.put('/api/account/sync', routes.main.hasRights(0), db, routes.users.sync);
app.put('/api/account', routes.main.hasRights(0), db, routes.users.updateSettings);
//app.del('/api/users/:id', db, routes.users.del);

//NOTIFICATIONS
//app.get('/api/account/notifications', routes.main.hasRights(0), db, routes.notifications.getNotifications);
//app.put('/api/account/notifications/:id', routes.main.hasRights(0), db, routes.notifications.viewedNotification);

//COMMENTS
app.get('/api/:media(movies|shows)/:id/comments', db, routes.comments.getComments);
app.get('/api/comments', routes.main.hasRights(2), db,routes.comments.getAllComments);
app.get('/api/comments/:id', db,routes.comments.getComment);
app.post('/api/comments', routes.main.hasRights(0), db, routes.comments.add);
app.put('/api/comments/:id', routes.main.hasRights(3), db, routes.comments.update);
app.delete('/api/comments/:id', routes.main.hasRights(0), db, routes.comments.del);

//LINKS
app.get('/api/:media(movies|episodes)/:id/links', db, routes.links.getLinks);
app.get('/api/account/links', routes.main.hasRights(0), db, routes.links.getUserLinks);
app.get('/api/users/:id/links', routes.main.hasRights(0), db, routes.links.getUserLinks);
app.get('/api/links/flagged', routes.main.hasRights(2), db, routes.links.getFlaggedLinks);
app.get('/api/links', routes.main.hasRights(2), db, routes.links.getAllLinks);
app.put('/api/links/:id/flag', routes.main.hasRights(0), db, routes.links.flag);
app.put('/api/links/:id/clear', routes.main.hasRights(2), db, routes.links.clear);
app.post('/api/links', routes.main.hasRights(0), db, routes.links.add);
//app.put('/api/links/:id', routes.main.hasRights(2), db, routes.links.update);
app.delete('/api/links/:id', db, routes.links.del);

//Return 404 for wrong api call
app.get('/api/*', function (req, res) { res.send(404) });
//Redirect lost user to homepage
app.get('*', routes.index);


/**
 * Start Server
 */

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);

//fun with io
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('connected', function (username) {
  	console.log(username + " is connected");
  	io.emit('connected', username);
  });
});