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
router.get('/', function(req, res, next){
	res.render('joinOk');
});

router.post('/',function(req, res, next){
	pool.getConnection(function (err, connection){
		console.log("DB CONNECT");
		var data = [req.body.c_id,req.body.c_name,req.body.c_phone,req.body.c_pwd,req.body.c_email];
		connection.query('insert into customer values(?,?,?,?,?)',data,function (err, rows){
			if (err) console.error("err: "+err);
			console.log("rows : "+JSON.stringify(data));
		});
		var data2 = [req.body.c_id,,];
		connection.query('insert into setting values(?,?)',data2,function (err, rows){
			if (err) console.error("err: "+err);
			console.log("rows : "+JSON.stringify(data2));
		});
		var data3 = [req.body.c_id,,req.body.c_name,,];
		connection.query('insert into customer_info values(?,?,?,?)',data3,function (err, rows){
			if (err) console.error("err: "+err);
			console.log("rows : "+JSON.stringify(data3));
		});			
		connection.release();
	});
	res.render('index');
});
/* GET home page. 
router.get('/', function(req, res){
  res.render('joinOk');
});
*/
module.exports = router;
