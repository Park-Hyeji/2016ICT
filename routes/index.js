var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/logout', function(req,res){
	res.render('logout');
});

router.post('/chatList', function(req,res){

	var id = req.body.id;
	var pwd = req.body.pwd;
	var cnt = 0;
	
	//pool.getConnection(function(err,conn){
		//if(err) console.error('err', err);
		//conn.query('select count(*) cnt from member where id=? and pwd=?',[id,pwd], function(err,rows){
			//if(err) console.err('err', err);
			//console.log('rows',rows);
			//var cnt = rows[0].cnt;
			if(id == 1234 && pwd == 1234 || id == 5678 && pwd == 5678){
				cnt = 1;
			}else{
				cnt = 0;
			}
			if(cnt == 1){
				req.session.id = id;
				res.render('chatList',req.body);
			}else{
				res.send('<script>alert("아이디나 비밀번호가 틀렸습니다.");history.back();</script>');
			}	
		//});	
	//});
});

module.exports = router;
