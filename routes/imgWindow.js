var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  res.render('imgWindow');
});

router.post('/imgWindow', function(req,res){
	var id = req.body.id;
	req.session.id = id;
	res.render('imgWindow',req.body);
});
module.exports = router;
