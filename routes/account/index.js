/**
 * user module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    User = mongoose.model('User'),
    crypto = require('crypto'),
    Space = mongoose.model('Space');


router.post('/postUpdateUser', function (req, res) {
   var password = req.body.password;
   if(password){
       password = crypto.createHash('md5').update(password).digest("hex");
       User.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.userId)}, {$set:{password:password}},function(err, user){
           if (err) {
               res.json({"error": "??????" + req.body.userId});
           }
           else {
               Space.findOne({userId : req.body.userId, defaultSpace : true},function(err,doc){
                   if(err){
                       res.json({"error": "??????" + req.body.userId});
                       return;
                   }
                   var docO = doc.toObject();
                   if(docO._id == req.body.spaceId){
                      res.json({"success": user});
                      return;
                   }
                   doc.defaultSpace = false;
                   doc.save(function(err, doc){
                       if(err){
                           res.json({"error": "??????" + req.body.userId});
                       }
                       else{
                           Space.findOneAndUpdate({_id : mongoose.Types.ObjectId(req.body.spaceId)},{$set:{defaultSpace:true}},function(err,doc){
                               if(err){
                                   res.json({"error": "??????" + req.body.userId});
                               }
                               else{
                                   res.json({"success": user});
                               }
                           });
                       }
                   });
               });
           }
       });
   }
});


module.exports = router;