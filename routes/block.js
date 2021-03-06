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
	var block = req.query.block;
	var chat_id = req.query.chat_id;
	
	//친구 차단하기
	pool.getConnection(function(err,connection){
		console.log("Block DB CONNECT");
		connection.query('insert into block values(?,?)',[id,block], function(err,rows){
			console.log('rows',id,block);
			if(err) console.err('err', err);
			connection.query('delete from friend where c_id = ? and f_id = ?',[id,block],function(err,rows2){
				if(err) console.err('err', err);
				console.log('rows2',rows2);
				connection.query('delete from chat_room where chat_id=? and c_id=?',[chat_id,id],function(err,rows3){
					console.log('rows3',rows3);
					if(err) console.err('err', err);
					
				});
			});
			res.send('<script>alert("차단되었습니다.");history.back();</script>');
		});		
		connection.release();
	});
});

module.exports = router;
