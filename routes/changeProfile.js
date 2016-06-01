var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');
var fs = require('fs');
var app = express();
var pool = mysql.createPool({
	connectionLimit: 6,
	host: 'localhost',
	user: 'root',
	database: 'ict',
	password: 'softwareproject'
});

/* GET home page. */
router.get('/',function(req,res){
	res.render('changeProfile');
});

router.post('/', function(req,res,next){
	if(req.body.imgChoice == ""){
		var img = "./images/"+req.body.image;
	}else{
		var img = "./images/"+req.body.imgChoice;
	}
	//var imgChoice = req.body.imgChoice;
	var name = req.body.nameChange;
	var msg = req.body.msgChange;
	var id = req.body.id;
	
	console.log("DATA",req.body);
	pool.getConnection(function(err,connection){
		console.log("changeProfile DB CONNECT");
		/*
		exports.upload = function(req,res){
			console.log("rerere",req.files.imgChoice.path);
			fs.readFile(req.files.imgChoice.path, function(error, data){
				var filePath = __dirname + "./images/" + req.files.imgChoice.name;
				console.log("filePath",filePath);
				fs.writeFile(filePath, data,function(error){
					if(error){
						throw err;
					}
				});
			});	*/
			var data = [img, name, msg, id];
			connection.query('update customer_info set c_img=? ,c_name=? ,c_msg=? where c_id=? ',data, function(err,rows){
				if(err) console.err('err', err);
				console.log('UPDATErows',rows);
				res.send('<script>alert("회원 정보가 변경되었습니다.");history.back();</script>');
			});		
			connection.release();
		//}
	});
});

module.exports = router;
