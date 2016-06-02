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
	pool.getConnection(function(err,connection){
		connection.query('select * from chat_room where c_id = ?',id,function(err,rows7){
			if(err) console.err('err', err);
			console.log('rows7',rows7);
			//채팅방이 있엉
			if(rows7.length !== 0){
				console.log("채팅방이 있어");
				connection.query('select * from chat_msg where chat_id in(select chat_id from chat_room where c_id = "'+id+'") and msg_id in(select max(msg_id) max from chat_msg group by chat_id) order by msg_id desc', function(err,rows8){
					console.log('이거 확인rows8',rows8);
					if(err) console.err('err', err);
					//채팅방있고 메시지 있고
					if(rows8.length !== 0){
						var sql5 = 'select * from chat_room where chat_id in('
						var tempArray4 = new Array();
						for(var u=0; u<rows8.length; u++){
							tempArray4[u] = connection.escape(rows8[u].chat_id);
							if(u == rows8.length-1){
								sql5 += tempArray4[u];
							}else{
								sql5 += tempArray4[u] + ",";
							}
						}
						sql5 += ') and c_id not in("'+id+'") order by field(chat_id,'
						for(var u=0; u<rows8.length; u++){
							tempArray4[u] = connection.escape(rows8[u].chat_id);
							if(u == rows8.length-1){
								sql5 += tempArray4[u];
							}else{
								sql5 += tempArray4[u] + ",";
							}
						}
						sql5 += ')';
						connection.query(sql5,function(err,rowsx){
							console.log("rowsx",rowsx);
							if(err) console.err('err',err);
							
							var sql6 = 'select * from customer_info where c_id in('
							var tempArray5 = new Array();
							for(var y=0; y<rowsx.length; y++){
								tempArray5[y] = connection.escape(rowsx[y].c_id);
								if(y == rowsx.length-1){
									sql6 += tempArray5[y];
								}else{
									sql6 += tempArray5[y] + ",";
								}
							}
							sql6 += ') order by field(c_id,'
							for(var y=0; y<rowsx.length; y++){
								tempArray5[y] = connection.escape(rowsx[y].c_id);
								if(y == rowsx.length-1){
									sql6 += tempArray5[y];
								}else{
									sql6 += tempArray5[y] + ",";
								}
							}
							sql6 += ')';
							connection.query(sql6,function(err,rowsxx){
								if(err) console.log('err',err);
								console.log('rowsxx',rowsxx);
								res.render('manageChatting',{id:id, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
							});
						});
					}else{
						//채팅방은 있는데 메시지가 없을 때
						var sql5 = 'select * from chat_room where chat_id in('
						var tempArray4 = new Array();
						for(var u=0; u<rows7.length; u++){
							tempArray4[u] = connection.escape(rows7[u].chat_id);
							if(u == rows7.length-1){
								sql5 += tempArray4[u];
							}else{
								sql5 += tempArray4[u] + ",";
							}
						}
						sql5 += ') and c_id not in("'+id+'")';
						console.log("sql5",sql5);
						connection.query(sql5,function(err,rowsx){
							if(err) console.log('err',err);
							console.log('rowsx',rowsx);
							connection.query('select * from customer_info where c_id = ?',rowsx[0].c_id, function(err,rowsxx){
								if(err) console.log('err',err);
								console.log('rowsxx',rowsxx);
								var rows8 = [{chat_time:'',chat_msg:'',chat_img:''}];
								res.render('manageChatting',{id:id, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});	
							});
						});
					}
				});
			}else{
				console.log("채팅방이 없어ㅠㅠ");
				var rows8 = [{chat_time:'',chat_msg:'',chat_img:''}];
				var rowsx = [];
				var rowsxx = [];
				res.render('manageChatting',{id:id, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});				
			}
		});
	});
});

module.exports = router;
