/**
 * link module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Link = mongoose.model('Link');

router.post('/postNewLink',function(req, res){
    var link = new Link();
    link.url = req.body.url;
    link.title = req.body.title;
    link.description = req.body.description;
    link.previewImg = req.body.previewImg;
    link.spaceId = mongoose.Types.ObjectId(req.body.spaceId);
    link.tags = req.body.tags;
    link.save(function(err,result){
        if(err){
            res.json({"error" : "??????"});
        }
        else{
            res.json({"success" : result});
        }
    });
});

router.post('/getLinksBySpace',function(req, res){
    Link.find({spaceId : mongoose.Types.ObjectId(req.body.spaceId)},function(err,result){
        if(err){
            res.json({"error" : "??????"});
        }
        else{
            res.json({"success" : result});
        }
    });
});


module.exports = router;
