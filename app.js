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
var joinOk = require('./routes/joinOk');
var login = require('./routes/login');
var logout = require('./routes/logout');
var chatting = require('./routes/chatting');
var imgWindow = require('./routes/imgWindow');
var addFriend = require('./routes/addFriend');
var manageProfile = require('./routes/manageProfile');
var manageChatting = require('./routes/manageChatting');
var manageFriend = require('./routes/manageFriend');
var changeProfile = require('./routes/changeProfile');
var exitChatting = require('./routes/exitChatting');
var block = require('./routes/block');
var stopBlock = require('./routes/stopBlock');
var session = require('express-session');
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 6,
	host: 'localhost',
	user: 'root',
	database: 'ict',
	password: 'softwareproject'
});

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
app.use('/login', login);
app.use('/logout',logout);
app.use('/join',join);
app.use('/joinOk',joinOk);
app.use('/chatting',chatting);
app.use('/addFriend',addFriend);
app.use('/manageProfile',manageProfile);
app.use('/manageChatting',manageChatting);
app.use('/manageFriend',manageFriend);
app.use('/changeProfile',changeProfile);
app.use('/block',block);
app.use('/imgWindow',imgWindow);
app.use('/exitChatting',exitChatting);
app.use('/stopBlock',stopBlock);
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

io.sockets.on('connection' ,function(socket){
	var room_id;
	console.log("enter chatting"); //서버에 연결되면 "enter chatting" 로그 찍어냄
	socket.on('joinRoom',function(data){
		room_id = data;
		socket.join(room_id); //룸입장
		console.log('채팅방 입장',io.sockets.adapter.rooms);
	});
	//채팅방 나가기
	socket.on('leaveRoom',function(msg){
		socket.leave(room_id); //룸퇴장
		pool.getConnection(function(err,connection){
			console.log("메시지",msg);
			connection.query('select * from chat_room where chat_id=?',msg.chat_id, function(err,rows3){
				console.log('rows3',rows3);
				if(err) console.log('err',err);
				if(rows3.length == 1){
					connection.query('delete from chat_msg where chat_id=?',msg.chat_id,function(err,rows4){
						console.log('rows4',rows4);
						if(err) console.log('err',err);
					});
					connection.query('delete from chat_room where chat_id=? and c_id=?',[msg.chat_id,msg.c_id],function(err,rows2){
						console.log('approws',rows2);
						if(err) console.log('err', err);
						io.sockets.in(room_id).emit('chat message', msg);
					});
				}else{
					connection.query('delete from chat_room where chat_id=? and c_id=?',[msg.chat_id,msg.c_id],function(err,rows2){
						console.log('approws',rows2);
						if(err) console.log('err', err);
						io.sockets.in(room_id).emit('chat message', msg);
					});
				}
			});
			connection.release();
		});
		console.log('채팅방을 나갔습니다.', io.sockets.adapter.rooms);
	});
	socket.on('new message', function(msg){
		//채팅 메시지 DB에 저장
		var data = [msg.roomId, msg.id, msg.name, msg.c_img, msg.message, msg.img, msg.time,1];
		pool.getConnection(function(err,connection){
			connection.query('insert into chat_msg(chat_id, c_id, c_name, c_img, chat_msg, chat_img, chat_time, chat_read) values(?,?,?,?,?,?,?,?)',data,function(err,rows){
				console.log('approws',data);
				if(err) console.err('err', err);
				io.sockets.in(room_id).emit('chat message', msg);
			});
			connection.release();
		});
		//io.sockets.in(room_id).emit('chat message', msg);//전체에게 메시지 전송
		console.log('new message: ' + msg.name + " : " +  msg.img + " , " + msg.message);
	});
});

module.exports = app;
