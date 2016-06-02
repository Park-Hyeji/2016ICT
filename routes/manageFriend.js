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
	console.log("id",id);
	pool.getConnection(function(err,connection){
		console.log("Blocked DB CONNECT");
		var sql = 'select * from block where c_id = "'+ id + '"';
		connection.query(sql,function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			if(rows.length !== 0){
				var sql2 = 'select * from customer_info where c_id IN ( ';
				var tagArray = new Array();
				for(var i=0; i<rows.length; i++){
					tagArray[i] = connection.escape(rows[i].blocked_id);
					if(i == rows.length-1){
						sql2 += tagArray[i]; 
					}else{
						sql2 += tagArray[i] + ","; 
					}
				}
				sql2 += ')';
				//로그인한 회원의 친구 상세 정보를 뽑음
				connection.query(sql2,function(err,rows2){
					if(err) console.err('err',err);
					console.log('rows2',rows2);
					res.render('manageFriend',{id:id, rows2:rows2})
				});
			}else{
				var rows2 = [];
				res.render('manageFriend',{id:id, rows2:rows2})
			}	
		});	
		connection.release();
	});
});

module.exports = router;
