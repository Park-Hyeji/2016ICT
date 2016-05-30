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
				var cnt = rows3.length;
				if(cnt == 0){
					var rows2 = [];
					res.render('chatList',{rows:rows, rows2:rows2});
				}else{
					var sql = new String(); 
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
						if(err) console.err('err', err);
						//로그인한 회원이 가진 채팅방 뽑음
						connection.query('select * from chat_room where c_id = ?',id,function(err,rows7){
							if(err) console.err('err', err);
							console.log('rows7',rows7);		
							//나와 같은 chat_id가진 친구 뽑음
							var sql2 = 'select * from chat_room where c_id != "' + id + '" and chat_id IN ('
							var tempArray = new Array();
							for(var k=0; k<rows7.length; k++){
								tempArray[k] = connection.escape(rows7[k].chat_id);
								if(k == rows7.length-1){
									sql2 += tempArray[k];
								}else{
									sql2 += tempArray[k] + ",";
								}
							}
							sql2 += ')';
							console.log("sql2",sql2);
							connection.query(sql2, function(err,rows4){
								if(err) console.err('err', err);
								console.log('rows4',rows4);	
								//내가 가진 채팅방을 가진 친구 정보 뽑음
								var sql3 = 'select * from customer_info where c_id IN ('
								var tempArray2 = new Array();
								for(var l=0; l<rows4.length; l++){
									tempArray2[l] = connection.escape(rows4[l].c_id);
									if(l == rows4.length-1){
										sql3 += tempArray2[l];
									}else{
										sql3 += tempArray2[l] + ",";
									}
								}
								sql3 += ')';
								console.log("sql3",sql3);
								connection.query(sql3, function(err,rows5){
									if(err) console.err('err', err);
									console.log('rows5',rows5);
									var sql4 = 'select * from chat_msg where c_id IN ('
									var tempArray3 = new Array();
									for(var q=0; q<rows5.length; q++){
										tempArray3[q] = connection.escape(rows5[q].c_id);
										if(q == rows5.length-1){
											sql4 += tempArray3[q];
										}else{
											sql4 += tempArray3[q] + ",";
										}
									}
									sql4 += ')';
									console.log("sql4",sql4);
									connection.query(sql4, function(err,rows6){
										if(err) console.err('err', err);
										console.log('rows6',rows6);	
										connection.query('select * from chat_msg where chat_id in(select chat_id from chat_room where c_id = "'+id+'") and msg_id in(select max(msg_id) max from chat_msg group by chat_id) order by msg_id desc', function(err,rows8){
											console.log('이거 확인rows8',rows8);
											if(err) console.err('err', err);
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
											console.log("!!!!!!!sql5",sql5);
											connection.query(sql5,function(err,rowsx){
												if(err) console.err('err',err);
												console.log("rowsx",rowsx);
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
													res.render('chatList',{rows:rows, rows2:rows2, rows7:rows7, rows8:rows8, rowsx:rowsx, rowsxx:rowsxx});
												});
											});
										});	
									});
								});
							});
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





