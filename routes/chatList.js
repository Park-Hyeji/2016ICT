var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  res.render('chatList');
});

router.post('/chatting', function(req,res){
	var id = req.body.id;
	req.session.id = id;
	res.render('chatting',req.body);
});

module.exports = router;
