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
						console.log('rows2',rows2);
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
										connection.query('select max(msg_id) max from chat_msg group by chat_id',function(err,rows0){
											console.log('rows0',rows0);
											if(err) console.err('err', err);
											
											var sql5 = 'select * from chat_msg where msg_id IN ('
											var tempArray4 = new Array();
											for(var e=0; e<rows0.length; e++){
												tempArray4[e] = connection.escape(rows0[e].max);
												if(e == rows0.length-1){
													sql5 += tempArray4[e];
												}else{
													sql5 += tempArray4[e] + ",";
												}
											}
											sql5 += ')';
											console.log("sql5",sql5);
											connection.query(sql5, function(err,rows8){
												console.log('rows8',rows8);
												if(err) console.err('err', err);
												res.render('chatList',{rows:rows, rows2:rows2, rows5:rows5, rows6:rows6, rows7:rows7, rows8:rows8});
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





