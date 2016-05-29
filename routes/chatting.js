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
var realChatId;
var rrealChatId;

/* GET home page. */
router.get('/', function(req, res){	
	var id = req.query.id;
	var room = req.query.room;
	var roomName = room + ":" + id;
	pool.getConnection(function(err,connection){
		console.log("chatting DB CONNECT");
		connection.query('select * from customer_info where c_id = ?',id,function(err,row){
			if(err) console.err('err',err);
			console.log('row',row);
			connection.query('select * from customer_info where c_id = ?',room,function(err,c_row){
				if(err) console.err('err',err);
				console.log('c_row',c_row);
				var sql = 'select chat_id from chat_room where c_id = "' + id + '"';
				connection.query(sql,function(err,rows){
					if(err) console.err('err', err);
					console.log('rows',rows);
					if(rows.length == 0){
						//방없음
						//var data = [roomName,roomName,id];
						//var data2 = [roomName,roomName,room];
						
						var data = [id,room];
						var newSql = 'insert into chat_room (chat_id, chat_name, c_id) values("'+roomName+'","'+roomName+'","'+id+'"),("'+roomName+'","'+roomName+'","'+room+'")';
						connection.query(newSql,function(err,newRows){
							console.log("newSql",newSql);
							if(err) console.err('err',err);	
							var rows2 = [];
							res.render('chatting',{row:row, c_row:c_row, rows2:rows2});								
						});										

						
						/*
						connection.query('insert into chat_room values(?,?,?)',data2,function(err,rows3){
							console.log('rows3',rows3);
							if(err) console.err('err',err);						
						});
						connection.query('insert into chat_room values(?,?,?)',data,function(err,rows2){
							if(err) console.err('err',err);
							console.log('rows2',rows2);		
							var rows2 = [];
							res.render('chatting',{row:row, c_row:c_row, rows2:rows2});
						});	
						*/
					}else{
						//c_id 방 있음
						var sql3 = 'select * from chat_room where c_id = "' + room + '" and chat_id IN ('
						var tempArray = new Array();
						for(var i=0; i<rows.length; i++){
							tempArray[i] = connection.escape(rows[i].chat_id);
							if(i == rows.length-1){
								sql3 += tempArray[i];
							}else{
								sql3 += tempArray[i] + ",";
							}
						}
						sql3 += ')';
						console.log(sql3);
						connection.query(sql3, function(err,rowss){
							if(err) console.err('err', err);
							console.log('rowss',rowss);		
							realChatId = rowss[0].chat_id;
									
							if(realChatId !== 0){
								var sql2 = 'select * from chat_msg where chat_id = "' + realChatId + '"';
								connection.query(sql2,function(err,rows2){
									if(err) console.err('err',err);
									console.log('rows2',rows2);
									res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});
								});
							}else{
								var data = [id,room];
								var newSql = 'insert into chat_room (chat_id, chat_name, c_id) values("'+roomName+'","'+roomName+'","'+id+'"),("'+roomName+'","'+roomName+'","'+room+'")';
								connection.query(newSql,function(err,newRows){
									console.log("newSql",newSql);
									if(err) console.err('err',err);	
									var rows2 = [];
									var rowss = [];
									res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});								
								});	
							}	
						});							
					}
				});
			});
		});
		
		connection.release();
	});
});



module.exports = router;