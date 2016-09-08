/**
 * login module
 */

var express = require('express'),
        router = express.Router(),
        crypto = require('crypto'),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User');


var generateAutoLoginCookie = function(user){
	return crypto.createHash('md5').update(user.password + user.loginDate).digest("hex"); 
};


router.post('/autoLogin',function(req,res,next){
	var email = req.body.email;
	var token = req.body.token;
	User.findOne({email : email},function(err,user){
		if(!err){
			if(user){
				var userO = user.toObject();
				var realToken = generateAutoLoginCookie(userO);
				if(token === realToken){
					res.json({"success" : userO});
				}
				else{
					res.json({"error" : "token 错误"});
				}
			}
			else{
				res.json({"error" : "用户不存在"});
			}
		}
		else{
			res.json({"error" : "服务器开小差了"});
		}
	});
});


//check Login
router.post('/go',function(req, res,next){
	var emailORname = req.body.emailORname;
	var password = req.body.password;
	password = crypto.createHash('md5').update(password).digest("hex");
	User.findOne({$or:[{email : emailORname},{username : emailORname}]},function(err,user){
		if(!err){
			if(user){
				var userO = user.toObject();
				if(password === userO.password){
					user.loginDate = Date.now();
					user.save(function(err,updateUser){
						if(!err){
							var newUser = updateUser.toObject();
							newUser.autoLoginToken = generateAutoLoginCookie(newUser);
							res.json({"success" : newUser});
						}
						else{
							res.json({"error" : "服务器开小差了"});
						}
					});
				}
				else{
					res.json({"error_pwd" : "密码错误"});
				}
			}
			else{
				res.json({"error_user" : "用户不存在"});
			}
		}
		else{
			res.json({"error" : "服务器开小差了"});
		}
	});
});


module.exports = router;