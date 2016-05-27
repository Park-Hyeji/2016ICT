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
router.get('/', function(req, res){	
	var id = req.query.id;
	var room = req.query.room;
	pool.getConnection(function(err,connection){
		console.log("chatting DB CONNECT");
		connection.query('select * from customer_info where c_id = ?',id,function(err,row){
			if(err) console.err('err',err);
			console.log('row',row);
			connection.query('select * from customer_info where c_id = ?',room,function(err,c_row){
				if(err) console.err('err',err);
				console.log('c_row',c_row);
				var sql = 'select count(*) cnt from chat_room where c_id = "' + id + '" and chat_id = "' + room + '"';
				connection.query(sql,function(err,rows){
					if(err) console.err('err', err);
					console.log('rows',rows);
					var cnt = rows[0].cnt;
					if(cnt == 0){
						//insert
						var data = [room,room,id];
						connection.query('insert into chat_room values(?,?,?)',data,function(err,rows2){
							if(err) console.err('err',err);
							console.log('rows2',rows2);
							var rows2 = [];
							res.render('chatting',{row:row, c_row:c_row, rows2:rows2});
						});
					}else{
						//select
						var sql2 = 'select * from chat_msg where chat_id = "' + room + '" and c_id = "' + id + '"';
						connection.query(sql2,function(err,rows2){
							if(err) console.err('err',err);
							console.log('rows2',rows2);
							res.render('chatting',{row:row, c_row:c_row, rows2:rows2});
						});
					}
				});
			});
		});
		
		connection.release();
	});
});



module.exports = router;