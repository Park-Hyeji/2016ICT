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
	var blocked_id = reqquerybody.blocked_id;
	
	pool.getConnection(function(err,connection){
		console.log("DB CONNECT");
		connection.query('delete from block where c_id=? and blocked_id=?',[id,blocked_id], function(err,rows){
			if(err) console.err('err', err);
			console.log('rows',rows);
			res.send('<script>alert("차단해제 했습니다.");history.back();</script>');
		});		
		connection.release();
	});
});

module.exports = router;
