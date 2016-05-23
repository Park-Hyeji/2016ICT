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
	pool.getConnection(function (err, connection){
		var customer = {'c_id':req.body.id,
						'c_name':req.body.name,
						'c_pwd':req.body.pwd,
						'c_phone':req.body.phone,
						'c_email':req.body.email};
		connection.query('insert into customer set ?',customer,function (err, rows){
			if (err) console.error("err: "+err);
			console.log("rows : "+JSON.stringify(customer));
			res.render('join',{rows: rows});
			connection.release();
		});
	});
});

router.post('/',function(req,res,next){
	console.log('req.body : '+ req.body);
	res.json(req.body);
});

module.exports = router;
