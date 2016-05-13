var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res){
  res.render('login');
});
router.post('/chatList', function(req,res){
	res.render('chatList');
});


module.exports = router;
