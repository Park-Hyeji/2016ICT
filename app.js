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
var session = require('express-session');
var mysql = require('mysql');

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

/*
//mysql 연결
var connection = mysql.createConnection({
	user: 'root',
	password: 'softwareproject',
	database: 'ict'
});

connection.connect(function(err){
	if(err){
		console.error('mysql connection error');
		console.error(err);
		throw err;
	}else{
		console.log('db connection success');
	}
});
*/

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
	socket.on('leaveRoom',function(){
		socket.leave(room_id); //룸퇴장
		console.log('채팅방을 나갔습니다.', io.sockets.adapter.rooms);
	});
	socket.on('new message', function(msg){
		io.sockets.in(room_id).emit('chat message', msg);//전체에게 메시지 전송
		console.log('new message: ' + msg.name + " : " +  msg.img + " , " + msg.message);
	});
});

/*
//customer database에 데이터 값 넣는 부분
app.post('/joinOk',function(req,res){
	var customer = {'id':req.body.id,
					'name':req.body.name,
					'pwd':req.body.pwd,
					'phone':req.body.phone,
					'email':req.body.email};
	var query = connection.query('insert into customer set ?',customer,function(err,result){
		if(err){
			console.error(err);
			throw err;
		}
		console.log(query);
		res.send("<script>alert(회원가입이 완료되었습니다.); history.back();</script>");
	});
});
connection.end();
*/
module.exports = app;
