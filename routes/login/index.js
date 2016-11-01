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
					res.json({"error" : "token error"});
				}
			}
			else{
				res.json({"error" : "user not exist"});
			}
		}
		else{
			res.json({"error" : "server is busy"});
		}
	});
});


//check Login
router.post('/go',function(req, res,next){
	var emailORname = req.body.emailORname;
	var password = req.body.password;
	password = crypto.createHash('md5').update(password).digest("hex");
	User.findOne({$or:[{email : emailORname},{userName : emailORname}]},function(err,user){
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
							res.json({"error" : "server is busy"});
						}
					});
				}
				else{
					res.json({"error_pwd" : "password error"});
				}
			}
			else{
				res.json({"error_user" : "user not exist"});
			}
		}
		else{
			res.json({"error" : "server is busy"});
		}
	});
});


module.exports = router;