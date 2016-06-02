var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');
var pool = mysql.createPool({
	connectionLimit: 6,
	host: 'localhost',
	user: 'root',
	database: 'ict',
	password: 'softwareproject'
});

/* GET home page. */
router.get('/', function(req,res,next){
	var id = req.query.id;
	var chat_id = req.query.id;
	
	console.log(req.body);
	
	pool.getConnection(function(err,connection){
		console.log("DB CONNECT");
		connection.query('delete from chat_room where c_id=? and chat_id=?',[id,], function(err,rows){
			if(err) console.log('err',err);
			console.log('rows',rows);
			res.send('<script>alert("채팅방을 나갔습니다.");history.back();</script>');
			//res.render('exitChatting','<script>alert("채팅방을 나갔습니다.");history.back();</script>');
		});		
		connection.release();
	});
});

module.exports = router;
