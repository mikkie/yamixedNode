/**
 * register module
 */
var express = require('express'),
        router = express.Router(),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User');

router.get('/checkName/:name', function(req, res,next) {
	 var name = req.params.name;
	 User.find({username:name},function(err,docs){  
	     console.log(docs);  
	 });  
	 res.end();
});

module.exports = router;