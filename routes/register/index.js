/**
 * register module
 */
var express = require('express'),
        router = express.Router(),
        crypto = require('crypto'),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User'),
        Space = mongoose.model('Space'),
		common = require('../common/common');

//check name
router.get('/checkName/:name', function(req, res,next) {
	 var name = req.params.name;
	 User.findOne({userName:name},function(err,user){
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
router.get('/checkEmail/:flag/:email', function(req, res,next) {
	 var email = req.params.email;
	 var flag = req.params.flag;
	 User.findOne({email:email},function(err,user){  
	     if(!err){
	    	 if(user){
	    		 if(flag.toLowerCase() === 'y'){
	    			 res.json({"error" : "邮箱已存在"});
	    		 }
	    		 else{
	    			 res.json({"success" : "邮箱存在"});
	    		 }
	    	 }
	    	 else{
	    		 if(flag.toLowerCase() === 'y'){
	    			 res.json({"success" : "邮箱可以使用"});
	    		 }
	    		 else{
	    			 res.json({"error" : "邮箱不存在"});
	    		 }
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
	user.userName = name;
	user.email = email;
	user.password = crypto.createHash('md5').update(password).digest("hex");
	user.save(function(err,result){
		if(err){
			res.json({"error" : "注册失败"});
		}
		else{
            createDefaultSpace(user,res);
		}
	});
});

var updateUserCreatedSpace = function(user,space,res){
    var spaceO = space.toObject();
    var createdSpaces = user.space.created;
    createdSpaces.push(spaceO._id);
    user.save(function(err,result){
        if(err){
            res.json({"error" : "注册失败,更新用户空间失败"});
        }
        else{
            res.json({"success" : result.toObject()});
        }
    });
};

var createDefaultSpace = function(user,res){
    var userO = user.toObject();
    var space = new Space();
    space.spaceName = userO.userName + '的书签';
    space.userId = userO._id;
    space.defaultSpace = true;
    space.save(function(err){
        if(err){
            res.json({"error" : "注册失败,创建空间错误"});
        }
        else{
            updateUserCreatedSpace(user,space,res);
        }
    });
};


//reset pwd
router.post('/resetPwdConfirm',function(req, res,next){
	var email = req.body.email;
	var newPwd = common.generateRandomNum(6);
	//TODO  send a email with new password
	res.json({"success" : "重置密码邮件已发送至 " + email + "，请确认"});
});


module.exports = router;