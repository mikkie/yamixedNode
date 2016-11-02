/**
 * register module
 */
var express = require('express'),
        router = express.Router(),
        crypto = require('crypto'),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User'),
        Space = mongoose.model('Space'),
		common = require('../common/common'),
        fs = require('fs'),
        emailUtil = require('../email/mailUtil');

//check name
router.get('/checkName/:name', function(req, res,next) {
	 var name = req.params.name;
	 User.findOne({userName:name},function(err,user){
	     if(!err){
	    	 if(user){
	    		 res.json({"error" : "user exist"});
	    	 }
	    	 else{
	    		 res.json({"success" : "name available"});
	    	 }
	     }
	     else{
	    	 res.json({"error" : "server is busy"});
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
	    			 res.json({"error" : "email exist"});
	    		 }
	    		 else{
	    			 res.json({"success" : "email exist"});
	    		 }
	    	 }
	    	 else{
	    		 if(flag.toLowerCase() === 'y'){
	    			 res.json({"success" : "email available"});
	    		 }
	    		 else{
	    			 res.json({"error" : "email not exist"});
	    		 }
	    	 }
	     }
	     else{
	    	 res.json({"error" : "server is busy"});
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
	user.avatar.color = common.randomColor('');
    user.avatar.alphabet = name.substring(0,1).toUpperCase();
	user.password = crypto.createHash('md5').update(password).digest("hex");
	user.save(function(err,result){
		if(err){
			res.json({"error" : "register failed"});
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
            res.json({"error" : "register fail,update user space fail"});
        }
        else{
            res.json({"success" : result.toObject()});
        }
    });
};

var createDefaultSpace = function(user,res){
    var userO = user.toObject();
    var space = new Space();
    space.spaceName = userO.userName + ' space';
    space.userId = userO._id;
    space.defaultSpace = true;
	space.groups = [];
	space.color = common.randomColor('');
    space.save(function(err){
        if(err){
            res.json({"error" : "register fail,create space error"});
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
    var encryptPwd = crypto.createHash('md5').update(newPwd).digest("hex");
    User.findOneAndUpdate({email:email},{$set:{password:encryptPwd}},function(err,user){
        if(err){
            res.json({"error" : err});
        }
        else{
            if(!user){
                res.json({"error" : "user not exist"});
                return;
            }
            fs.readFile('emailTemp/forgetPwd.html', 'utf8',function (err, html) {
                if (err) {
                    logger.error('can not render params error page ' + err);
                    res.json({"error" : err});
                    return;
                }
                var userO = user.toObject();
                var html = buildEmail(html,userO.userName,newPwd);
                try{
                    emailUtil.sendMail(userO.email,'Reset Yamixed password','',html);
                }
                catch(e){
                    console.log(e);
                }
            });
            res.json({"success" : "重置密码邮件已发送至 " + email + "，请确认"});
        }
    });
});


var buildEmail = function(html,name,pwd){
   return html.replace('{username}',name).replace('{password}',pwd);
};


module.exports = router;