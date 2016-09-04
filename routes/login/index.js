/**
 * login module
 */

var express = require('express'),
        router = express.Router(),
        crypto = require('crypto'),
        mongoose = require('../common/mongodbUtil'),
        User = mongoose.model('User');


//check Login
router.post('/go',function(req, res,next){
	var emailORname = req.body.emailORname;
	var password = req.body.password;
	password = crypto.createHash('md5').update(password).digest("hex");
	User.findOne({$or:[{email : emailORname},{username : emailORname}]},function(err,user){
		if(!err){
			if(user){
				if(password === user._doc.password){
					res.json({"success" : user._doc});
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