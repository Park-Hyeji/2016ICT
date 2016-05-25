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
router.get('/', function(req, res) {
  res.render('login');
});

router.post('/', function(req,res,next){
	pool.getConnection(function(err,connection){
		console.log("addFriend DB CONNECT");
		connection.query('select count(*) cnt from customer where c_id = ?',req.body.friendIdAdd,function(err,rows){
			var cnt = rows[0].cnt;
			if(cnt == 0){
				res.send('<script>alert("아이디가 없습니다."); history.back();</script>');
			}else{
				var data = [req.body.c_id,req.body.friendIdAdd];
				connection.query('select count(*) cnt2 from friend where c_id = ? and f_id = ?',data,function(err,rows2){
					var cnt2 = rows2[0].cnt2;
					if(cnt2 == 1){
						res.send('<script>alert("이미 등록했습니다."); history.back();</script>');
					}else{
						connection.query('insert into friend values(?,?)',data, function(err,rows3){
							if(err) console.err('err', err);
							console.log('rows3',rows3);
						});
						res.send("<script>alert('친구를 추가했습니다.');history.back();</script>");
					}
				});
			}
		});		
		connection.release();	
	});
});

module.exports = router;
