var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var routes = require('./routes/index');
var users = require('./routes/users');
var chatList = require('./routes/chatList');
var join = require('./routes/join');
var logout = require('./routes/logout');
var chatting = require('./routes/chatting');
var imgWindow = require('./routes/imgWindow');
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//port setup
app.set('port', process.env.PORTT || 9000);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}))

app.use('/', routes);
app.use('/users', users);
app.use('/chatList', chatList);
app.use('/logout',logout);
app.use('/join',join);
app.use('/chatting',chatting);
app.use('/imgWindow',imgWindow);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + server.address().port);
});

var io = socketio.listen(server);

var count = 0;
var rooms = [];


io.sockets.on('connection' ,function(socket){
	var room;
	console.log("enter chatting");
	/*socket.on('joinroom', function(data){
		console.log("Enter room : " + data);
		socket.join(data.room);	
		socket.on('room', function(data){
			room = data.room;
			
			//방 만들기!!
			if(rooms[room] == undefined){
				console.log('room create : ' + room);
				rooms[room] = new Object();
				rooms[room].socket_ids = new Object();
				
				//입장시 1 사라지는 부분
				data = {msg: ""};
				io.sockets.in(room).emit('broadcast_msg', data);
			}
		});
		console.log('a user connected');
	});*/
	socket.on('new message', function(msg){
			console.log('new message: ' + msg.name + " : " +  msg.img + " , " + msg.message);
			io.sockets.emit('chat message', msg);
	});
});

module.exports = app;
