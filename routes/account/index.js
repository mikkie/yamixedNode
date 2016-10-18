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

router.get('/getUsersByNameOrEmail', function (req, res) {
    User.find({$or : [{userName :  new RegExp(req.query.keyword, "i")},{email : new RegExp(req.query.keyword, "i")}]},function(err,docs){
        if(err){
            res.json({"error" : err});
        }
        else{
            res.json({"success": docs});
        }
    });
});


router.get('/getUserById', function (req, res) {
    User.findOne({_id : mongoose.Types.ObjectId(req.query.userId)},function(err,doc){
        if(err){
            res.json({"error" : err});
        }
        else{
            res.json({"success": doc});
        }
    });
});



module.exports = router;