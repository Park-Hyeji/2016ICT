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
	
	pool.getConnection(function(err,connection){
		console.log("manageProfile DB CONNECT");
		connection.query('select * from customer_info where c_id=?',id, function(err,rows){
			console.log('rows',id);if(err) console.err('err', err);
			
			res.render('manageProfile',{rows:rows});
		});	
		connection.release();
	});
});

module.exports = router;
