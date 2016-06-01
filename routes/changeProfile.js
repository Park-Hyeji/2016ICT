var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');
var fs = require('fs');
var multer = require('multer');
var pool = mysql.createPool({
	connectionLimit: 6,
	host: 'localhost',
	user: 'root',
	database: 'ict',
	password: 'softwareproject'
});
var multer_settings = multer({
	dest: './public/images'
});


/* GET home page. */
router.get('/',function(req,res){
	res.render('changeProfile');
});

router.post('/', multer_settings.single('imgChoice'),function(req,res,next){
	var name = req.body.nameChange;
	var msg = req.body.msgChange;
	var id = req.body.id;
	var imgChoice =req.body.imgChoice;
	
	pool.getConnection(function(err,connection){
		connection.query('select * from customer_info where c_id = ?',id,function(err,rows2){
			if(req.file){
				var file = "./images/"+req.file.filename;
				console.log(req.file);
				fs.writeFile(file,function(err){
				});
			}else{
				var file="";
			}
			console.log("파일",req.file);
			if(file == ""){
				var img = "./images/"+rows2[0].c_img;
			}else{
				var img = "./images/"+req.file.originalname;
			}
			console.log("changeProfile DB CONNECT");			
			
			var data = [img, name, msg, file, id];
			connection.query('update customer_info set c_img=? ,c_name=? ,c_msg=? , c_img_file=? where c_id=? ',data, function(err,rows){
				if(err) console.err('err', err);
				console.log('UPDATErows',data);
				connection.query('update chat_msg set c_img = ? where c_id = ?',[file,id],function(err,rows3){
					if(err) console.log("err",err);
					console.log(rows3);
					res.send('<script>alert("회원 정보가 변경되었습니다.");history.back();</script>');
				});
			});				
			connection.release();
		});
	});
});

module.exports = router;
