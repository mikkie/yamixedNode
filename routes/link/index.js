/**
 * link module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Link = mongoose.model('Link');

router.post('/postNewLink', function (req, res) {
    var id = req.body._id;
    if(id){
        Link.findByIdAndUpdate(mongoose.Types.ObjectId(id),
            { $set: { title : req.body.title, description : req.body.description,
                previewImg : req.body.previewImg,tags : req.body.tags,
                spaceId : mongoose.Types.ObjectId(req.body.spaceId),
                lastVisitTime:new Date()}}, { new: true }, function (err, doc) {
                if (err) {
                    res.json({"error": "更新链接失败" + id});
                }
                else {
                    res.json({"success": doc});
                }
        });
    }
    else{
        var link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
        link.description = req.body.description;
        link.previewImg = req.body.previewImg;
        link.spaceId = mongoose.Types.ObjectId(req.body.spaceId);
        link.owner = mongoose.Types.ObjectId(req.body.owner);
        link.tags = req.body.tags;
        link.save(function (err, result) {
            if (err) {
                res.json({"error": "??????"});
            }
            else {
                res.json({"success": result});
            }
        });
    }
});

router.post('/getLinksBySpace', function (req, res) {
    Link.find({spaceId: mongoose.Types.ObjectId(req.body.spaceId)}).sort({lastVisitTime: -1}).exec(function (err, result) {
        if (err) {
            res.json({"error": "??????"});
        }
        else {
            res.json({"success": result});
        }
    });
});


router.post('/searchLinks', function (req, res) {
    var condition = {
        spaceId: mongoose.Types.ObjectId(req.body.spaceId),
    };
    if(req.body.keyword){
        condition.$or = [{title: new RegExp(req.body.keyword, "i")}, {description: new RegExp(req.body.keyword, "i")}];
    }
    if (req.body.tag) {
        condition.tags = req.body.tag
    }
    Link.find(condition).sort({lastVisitTime: -1}).exec(function (err, result) {
        if (err) {
            res.json({"error": "??????"});
        }
        else {
            res.json({"success": result});
        }
    });
});

router.post('/updateLinkVisitTime', function (req, res) {
    Link.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.linkId)}, {$set:{lastVisitTime:new Date()}},function(err, doc){
        if (err) {
            res.json({"error": "更新lastVisitTime失败"});
        }
        else {
            res.json({"success": doc});
        }
    });
});


router.post('/deleteLink', function (req, res) {
    Link.findOneAndRemove({_id: mongoose.Types.ObjectId(req.body.linkId)},function(err){
        if (err) {
            res.json({"error": "删除失败" + req.body.linkId});
        }
        else {
            res.json({"success": "删除成功" + req.body.linkId});
        }
    });
});


router.post('/getLinkById', function (req, res) {
    Link.findOne({_id: mongoose.Types.ObjectId(req.body.linkId)},function(err,doc){
        if (err) {
            res.json({"error": "获取Link失败" + req.body.linkId});
        }
        else {
            res.json({"success": doc});
        }
    });
});


module.exports = router;
