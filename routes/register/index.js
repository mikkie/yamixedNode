/**
 * register module
 */
var express = require('express'),
        router = express.Router(),
        crypto = require('crypto'),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User');

//check name
router.get('/checkName/:name', function(req, res,next) {
	 var name = req.params.name;
	 User.findOne({username:name},function(err,user){  
	     if(!err){
	    	 if(user){
	    		 res.json({"error" : "用户已存在"});
	    	 }
	    	 else{
	    		 res.json({"success" : "用户名可以使用"});
	    	 }
	     }
	     else{
	    	 res.json({"error" : "服务器开小差了"});
	     }
	 });  
});

//check email
router.get('/checkEmail/:email', function(req, res,next) {
	 var email = req.params.email;
	 User.findOne({email:email},function(err,user){  
	     if(!err){
	    	 if(user){
	    		 res.json({"error" : "邮箱已存在"});
	    	 }
	    	 else{
	    		 res.json({"success" : "邮箱可以使用"});
	    	 }
	     }
	     else{
	    	 res.json({"error" : "服务器开小差了"});
	     }
	 });  
});

//save new user
router.post('/createUser',function(req, res,next){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var user = new User();
	user.username = name;
	user.email = email;
	user.password = crypto.createHash('md5').update(password).digest("hex");
	user.save(function(err){
		if(err){
			res.json({"error" : "注册失败"});
		}
		else{
			res.json({"success" : "注册成功"});
		}
	});
});


module.exports = router;