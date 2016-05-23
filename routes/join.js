var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
	res.render('join');
});

/*
router.post('/',function(req,res,next){
	console.log('req.body : '+ req.body);
	res.json(req.body);
});
*/
module.exports = router;
