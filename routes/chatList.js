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
		connection.query('select count(*) cnt, c.c_id, c.c_img, c.c_name, c.c_msg, f.c_id fc_id, f.f_id from customer_info c left join friend f on c.c_id = f.c_id where c.c_id=?',id, function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			res.render('chatList',{rows:rows});
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
