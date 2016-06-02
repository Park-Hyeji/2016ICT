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
router.get('/',function(req, res){
	var id = req.query.id;
	pool.getConnection(function(err,connection){
		console.log("chatList DB CONNECT");
		//로그인한 회원 정보 뽑음
		connection.query('select * from customer_info where c_id=?',id,function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			//로그인한 회원의 친구 정보 뽑음
			connection.query('select * from friend where c_id = ?',rows[0].c_id,function(err,rows3){
				if(err) console.err('err', err);
				console.log('rows3',rows3);
				var cnt = rows3.length;
				if(cnt == 0){
					//친구가 없어
					console.log("친구가 없어ㅠㅠ");
					//친구가 없을 땐 내 정보만 보냄
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
									sql5 += ') and c_id not in("'+id+'") order by field(chat_id'
									console.log("sql53",sql5);
									for(var u=0; u<rows8.length; u++){
										tempArray4[u] = connection.escape(rows8[u].chat_id);
										sql5 += ',';
										if(u == rows8.length-1){
											sql5 += tempArray4[u];
										}else{
											sql5 += tempArray4[u] + ",";
										}
									}
									sql5 += ')';
									console.log("sql51",sql5);
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
										sql6 += ') order by field(c_id'
										console.log("sql61",sql6);
										for(var y=0; y<rowsx.length; y++){
											sql6 += ',';
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
											var rows2 = [];
											res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
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
											res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});	
										});
									});
								}
							});
						}else{
							console.log("채팅방이 없어ㅠㅠ");
							var rows8 = [{chat_time:'',chat_msg:'',chat_img:''}];
							var rows2 = [];
							var rowsx = [];
							var rowsxx = [];
							res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});				
						}
					});
				}else{
					console.log("친구가 있어여");
					//친구가 있을 때
					var sql = new String(); 
					//친구 정보를 뽑음
					sql = 'select * from customer_info where c_id IN (';
					var fid = "";
					var tagArray = new Array();
					for(var i=0; i<cnt; i++){
						tagArray[i] = connection.escape(rows3[i].f_id);
						if(i == cnt-1){
							sql += tagArray[i]; 
						}else{
							sql += tagArray[i] + ","; 
						}
					}
					sql += ')';
					//로그인한 회원의 친구 상세 정보를 뽑음
					connection.query(sql, function(err,rows2){
						console.log("rows2",sql);
						if(err) console.err('err', err);
						//로그인한 회원이 가진 채팅방 뽑음
						connection.query('select * from chat_room where c_id = ?',id,function(err,rows7){
							if(err) console.err('err', err);
							console.log('rows7',rows7);	
							//채팅방이 있다면
							if(rows7.length !== 0){
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
										sql5 += ') and c_id not in("'+id+'") order by field(chat_id'
										for(var u=0; u<rows8.length; u++){
											sql5 += ',';
											tempArray4[u] = connection.escape(rows8[u].chat_id);
											if(u == rows8.length-1){
												sql5 += tempArray4[u];
											}else{
												sql5 += tempArray4[u] + ",";
											}
										}
										sql5 += ')';
										console.log("sql52",sql5);
										connection.query(sql5,function(err,rowsx){
											console.log("rowsx",rowsx);
											if(err) console.err('err',err);
											
											var sql6 = 'select * from customer_info where c_id in('
											var tempArray5 = new Array();
											if(rowsx.length !== 0){
												for(var y=0; y<rowsx.length; y++){
													tempArray5[y] = connection.escape(rowsx[y].c_id);
													if(y == rowsx.length-1){
														sql6 += tempArray5[y];
													}else{
														sql6 += tempArray5[y] + ",";
													}
												}
												sql6 += ') order by field(c_id'
												console.log("sql62",sql6);
												for(var y=0; y<rowsx.length; y++){
													sql6 += ',';
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
													res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
												});
											}else{
												var tempArray5 = new Array();
												for(var y=0; y<rows8.length; y++){
													tempArray5[y] = connection.escape(rows8[y].chat_id);
													var tempChatId = tempArray5[y].split("'");
													var blockChatId = tempChatId[1].split(":");
													if(blockChatId[0] == id){
														var realBlockChatId = blockChatId[1];
													}else{
														var realBlockChatId = blockChatId[0];
													}
												}
												console.log("realBlockChatId",realBlockChatId);
												var sql6 = 'select * from customer_info where c_id='+realBlockChatId;
												connection.query(sql6,function(err,rowsxx){
													if(err) console.log('err',err);
													console.log('rowsxx',rowsxx);
													var rowsx = rowsxx;
													res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
												});
											}
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
												res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});	
											});
										});
									}
								});
							}else{
								//채팅방이 없다면
								var rows8 = [];
								var rowsx = [];
								var rowsxx = [];
								res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});			
							}
						});
					});
				}
			});
		});
		connection.release();
	});
});

router.post('/chatting', function(req,res){
	//var id = req.body.id;
	//req.session.id = id;
	res.render('chatting',req.body);
});

module.exports = router;





