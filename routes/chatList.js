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
				//친구가 없을 땐 내 채팅방 정보만 보냄
				if(cnt == 0){			
					connection.query('select * from chat_room where c_id = ?',id,function(err,rows7){
						if(err) console.err('err', err);
						console.log('rows7',rows7);
						//채팅방이 있엉
						if(rows7.length !== 0){
							//로그인한 사람이 가지고있는 채팅방에서 가장 최근 메시지를 출력하는 부분
							connection.query('select * from chat_msg where chat_id in(select chat_id from chat_room where c_id = "'+id+'") and msg_id in(select max(msg_id) max from chat_msg group by chat_id) order by msg_id desc', function(err,rows8){
								console.log('마지막 채팅rows8',rows8);
								if(err) console.err('err', err);
								//채팅방있고 메시지 있고
								if(rows8.length !== 0){
									//내가 가진 채팅방과 나를 제외한 사람이 가진 채팅방의 공통부분 찾기
									var sql5 = 'select * from chat_room where chat_id in('
									var tempArray4 = new Array();
									var tempArray6 = new Array();
									//마지막 메시지 갯수만큼 추가함(채팅방아이디를)
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
										tempArray6[u] = connection.escape(rows8[u].chat_id);
										if(tempArray6[u] !== ""){
											sql5 += ',';
										}
										sql5 += tempArray6[u];
									}
									sql5 += ')';
									console.log("sql51",sql5);
									connection.query(sql5,function(err,rowsx){
										console.log("1rowsx",rowsx);
										if(err) console.err('err',err);
										
										//같은 채팅방을 가지고 있는 회원의 정보를 출력
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
										for(var y=0; y<rowsx.length; y++){
											tempArray5[y] = connection.escape(rowsx[y].c_id);
											if(tempArray5[y] !== ""){
												sql6 += ',';
											}
											sql6 += tempArray5[y];
										}
										sql6 += ')';
										connection.query(sql6,function(err,rowsxx){
											if(err) console.log('err',err);
											console.log('rowsxx',rowsxx);
											//친구 내용 뽑는 부분
											connection.query('select * from friend where c_id=?',id,function(err,rows2){
												console.log("1rows2",rows2);
												res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
											});
										});
									});
								}else{
									//채팅방은 있는데 메시지가 없을 때
									//내가 가지고 있는 채팅방을 가지고있는 다른 사람 겁색
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
										console.log('2rowsx',rowsx);
										//마지막으로 채팅 올린 사람의 정보 뽑는 부분
										connection.query('select * from customer_info where c_id = ?',rowsx[0].c_id, function(err,rowsxx){
											if(err) console.log('err',err);
											console.log('rowsxx',rowsxx);
											//친구 내용 뽑는 부분
											connection.query('select * from friend where c_id=?',id,function(err,rows2){
												console.log("1rows2",rows2);
												var rows8 = [{chat_time:'',chat_msg:'',chat_img:''}];
												res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});	
											});
										});
									});
								}
							});
						//채팅방이 없을 때
						}else{
							var rows8 = [{chat_time:'',chat_msg:'',chat_img:''}];
							var rows2 = [];
							var rowsx = [];
							var rowsxx = [];
							res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});				
						}
					});
				//친구가 있을 때
				}else{
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
									//채팅방을 찾음 내가 가지고 있는 채팅방과 나를 제외한 사람이 가지고 있는 채팅방의 공통 부분을 찾음
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
											tempArray4[u] = connection.escape(rows8[u].chat_id);
											if(tempArray4[u] !== ""){
												sql5 += ',';
											}
											sql5 += tempArray4[u];
										}
										sql5 += ')';
										console.log("sql52",sql5);
										connection.query(sql5,function(err,rowsx){
											console.log("3rowsx",rowsx);
											if(err) console.err('err',err);
											
											var sql6 = 'select * from customer_info where c_id in('
											var tempArray5 = new Array();
											//만약 마지막 채팅 내용이 있다면
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
												for(var y=0; y<rowsx.length; y++){
													tempArray5[y] = connection.escape(rowsx[y].c_id);
													if(tempArray5[y] !== ""){
														sql6 += ',';
													}
													sql6 += tempArray5[y];
												}
												sql6 += ')';
												console.log("마지막 채팅내용",sql6);
												connection.query(sql6,function(err,rowsxx){
													if(err) console.log('err',err);
													console.log('rowsxx',rowsxx);
													res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
												});
											//채팅 내용이 없다면
											}else{
												//메시지를 올린 사람이 없기 떄문에 room이 없음 그래서 chat_id를 분할하여 상대방 정보알아내기
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
											console.log('4rowsx',rowsx);
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





