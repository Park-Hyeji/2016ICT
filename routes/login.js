var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 6,
	host: 'localhost',
	user: 'root',
	database: 'ict',
	password: 'softwareproject'
});

/* GET home page. */
router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/', function(req,res,next){
	var id = req.body.c_id;
	var pwd = req.body.c_pwd;
	
	pool.getConnection(function(err,connection){
		console.log("DB CONNECT");
		connection.query('select count(*) cnt from customer where c_id=? and c_pwd=?',[id,pwd], function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			var cnt = rows[0].cnt;
			if(cnt == 1){
				req.session.id = id;
				res.render('chatList',{id:id});
			}else{
				res.send('<script>alert("아이디나 비밀번호가 틀렸습니다.");history.back();</script>');
			}
		});		
		connection.release();
	});

});


module.exports = router;
