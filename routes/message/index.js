/**
 * message module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Message = mongoose.model('Message');

router.get('/getMessagesToUser', function (req, res) {
    Message.find(
        {
            to: mongoose.Types.ObjectId(req.query.userId),
            valid: true,
            $or: [
                {expireDate: {$exists: true, $ne: null,$lt: Date.now()}},
                {expireDate: {$exists: false}}
            ]
        }, function (err, docs) {
            if (err) {
                res.json({"error": err});
            }
            else{
                res.json({"success": docs});
            }
        });
});


router.get('/disableMessage', function (req, res) {
    Message.findOne({_id : mongoose.Types.ObjectId(req.query.messageId)}, function (err, doc) {
        if(err){
            res.json({"error": err});
        }
        else{
            doc.valid = false;
            doc.save(function(err,result){
                if (err) {
                    res.json({"error": err});
                }
                else{
                    res.json({"success": result});
                }
            });
        }
    });
});


module.exports = router;