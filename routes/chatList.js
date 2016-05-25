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
		connection.query('select * from customer_info where c_id=?',id,function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			connection.query('select c.c_id, c.c_img, c.c_name, c.c_msg, f.c_id fc_id, f.f_id from customer_info c left join friend f on c.c_id = f.c_id where f.f_id = ?',id, function(err,rows2){
				if(err) console.err('err', err);
				console.log('rows2',rows2);
				res.render('chatList',{rows:rows, rows2:rows2});
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
