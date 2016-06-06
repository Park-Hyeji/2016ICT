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
//디비 연결 부분

/* GET home page. */
router.get('/', function(req, res){	
	//로그인한 아이디와 친구(room), 채팅 방 ID (roomName)부분
	var id = req.query.id;
	var room = req.query.room;
	var roomName = room + ":" + id;

	//DB연결
	pool.getConnection(function(err,connection){
		console.log("chatting DB CONNECT");
		//내 정보 뽑기
		connection.query('select * from customer_info where c_id = ?',id,function(err,row){
			if(err) console.err('err',err);
			console.log('row',row);
			//친구 정보 뽑기
			connection.query('select * from customer_info where c_id = ?',room,function(err,c_row){
				if(err) console.err('err',err);
				console.log('c_row',c_row);
				//내가 가지고 있는 채팅방 정보 뽑기
				var sql = 'select chat_id from chat_room where c_id = "' + id + '"';
				connection.query(sql,function(err,rows){
					if(err) console.err('err', err);
					console.log('rows',rows);
					//만약 채팅방이 없다면
					if(rows.length == 0){					
						//채팅하고자 하는 친구가 차단된 친구인지 확인
						connection.query('select * from block where c_id=? and blocked_id=?',[room,id],function(err,tempBlock){
							console.log('tempBlock',tempBlock);
							if(err) console.log('err',err);
							var blockLeng = tempBlock.length;
							//차단된 친구가 아니라면
							if(blockLeng == 0){
								var data = [id,room];
								//DB에 새로운 채팅창을 넣는 부분 (채팅하고자하는 친구와 나는 같은 값은 채팅방 아이디를 갖는다.)
								var newSql = 'insert into chat_room (chat_id, chat_name, c_id) values("'+roomName+'","'+roomName+'","'+id+'"),("'+roomName+'","'+roomName+'","'+room+'")';
								connection.query(newSql,function(err,newRows){
									console.log("newSql",newSql);
									if(err) console.err('err',err);	
										//임의의 메시지값 넣는 부분 (채팅목록을 뽑는 부분에서 각 채팅창마다 마지막에 있는 메시지를 count해서 채팅목록을 만드는 데 채팅창만 만들어져있고 메시지가 안 들어가 있으면 에러가 나기 때문)
										connection.query('insert into chat_msg(chat_id,c_id,c_name,c_img,chat_msg) values(?,?,?,?,?)',[roomName,id,"","","",""],function(err,tempMsg){
											var rows2 = [];
											var rowss = [{chat_id:roomName}];
											res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});	
									});						
								});	
							//차단된 친구라면
							}else{
								var newSql = 'insert into chat_room (chat_id, chat_name, c_id) values("'+roomName+'","'+roomName+'","'+id+'")';
								connection.query(newSql,function(err,newRows){
									console.log("newSql",newSql);
									if(err) console.err('err',err);	
										//임의의 메시지값 넣는 부분 (채팅목록을 뽑는 부분에서 각 채팅창마다 마지막에 있는 메시지를 count해서 채팅목록을 만드는 데 채팅창만 만들어져있고 메시지가 안 들어가 있으면 에러가 나기 때문)
										connection.query('insert into chat_msg(chat_id,c_id,c_name,c_img,chat_msg) values(?,?,?,?,?)',[roomName,id,"","","",""],function(err,tempMsg){
											var rows2 = [];
											var rowss = [{chat_id:roomName}];
											res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});	
									});						
								});							
							}
						});
					//채팅방이 있다면
					}else{
						//채팅방 id가 친구 아이디이고 chat_id가 로그인한 내 채팅방을 가지고 있는 모든 내용을 출력
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
							console.log('rowss2',rowss);
							if(err) console.err('err', err);	
							//만약 나와 친구사이에 공통된 채팅방이 없다면
							if(rowss.length == 0){
								realChatId = 0;
							//공통된 채팅방이 있다면
							}else{
								realChatId = rowss[0].chat_id;
							}
								
							//공통된 채팅방이 있다면
							if(realChatId !== 0){
								//해당 채팅방에 대한 채팅 메시지를 뽑아옴
								var sql2 = 'select * from chat_msg where chat_id = "' + realChatId + '"';
								connection.query(sql2,function(err,rows2){
									if(err) console.err('err',err);
									res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});
								});
							//공통된 채팅방이 없다면
							}else{
								//채팅하고자 하는 친구가 차단된 친구인지 확인
								connection.query('select * from block where c_id=? and blocked_id=?',[room,id],function(err,tempBlock){
									console.log('tempBlock',tempBlock);
									if(err) console.log('err',err);
									var blockLeng = tempBlock.length;
									//차단된 친구가 아니라면
									if(blockLeng == 0){
										var data = [id,room];
										//채팅방 생성
										var newSql = 'insert into chat_room (chat_id, chat_name, c_id) values("'+roomName+'","'+roomName+'","'+id+'"),("'+roomName+'","'+roomName+'","'+room+'")';
										connection.query(newSql,function(err,newRows){
											console.log("newSql",newSql);
											if(err) console.err('err',err);	
											var rows2 = [];
											var rowss = [];
											res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});								
										});	
									//차단된 친구라면
									}else{
										//차단된 친구와 같이 가졌던 채팅방의 채팅 메시지를 뽑아옴
										var sql2 = 'select * from chat_msg where chat_id = "' + roomName + '"';
										connection.query(sql2,function(err,rows2){
											if(err) console.err('err',err);
											var rowss = [{chat_id:roomName}];
											console.log("rowss",rowss);
											res.render('chatting',{rowss:rowss, row:row, c_row:c_row, rows2:rows2});	
										});							
									}
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