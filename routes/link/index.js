/**
 * link module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    common = require('../common/common'),
    Link = mongoose.model('Link'),
    User = mongoose.model('User');
    //Urlbox = require('urlbox'),
    //urlbox = Urlbox('54a74ca2-31a5-4801-88b1-d9e5baf50151', 'c52bf450-e94e-466d-938e-c050591b23df');

router.post('/postNewLink', function (req, res) {
    var id = req.body._id;
    if (id) {
        Link.findByIdAndUpdate(mongoose.Types.ObjectId(id),
            {
                $set: {
                    title: req.body.title, description: req.body.description,
                    previewImg: req.body.previewImg, tags: req.body.tags,
                    spaceId: mongoose.Types.ObjectId(req.body.spaceId),
                    lastVisitTime: new Date()
                }
            }, {new: true}, function (err, doc) {
                if (err) {
                    res.json({"error": "更新链接失败" + id});
                }
                else {
                    res.json({"success": doc});
                }
            });
    }
    else {
        var link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
        link.description = req.body.description;
        link.previewImg = req.body.previewImg;
        link.color = common.randomColor('');
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
            res.json({"error": err});
        }
        else {
            if(result && result.length > 0){
                for(var i in result){
                    delete result[i]._doc.content;
                }
            }
            res.json({"success": result});
        }
    });
});


router.post('/searchLinks', function (req, res) {
    var condition = {
        spaceId: mongoose.Types.ObjectId(req.body.spaceId),
    };
    if (req.body.keyword) {
        condition.$or = [{title: new RegExp(req.body.keyword, "i")}, {description: new RegExp(req.body.keyword, "i")}];
        if (req.body.keyword.length > 10) {
            condition.$or.push({content: new RegExp(req.body.keyword, "i")});
        }
    }
    if (req.body.tag) {
        condition.tags = req.body.tag
    }
    Link.find(condition).sort({lastVisitTime: -1}).exec(function (err, result) {
        if (err) {
            res.json({"error": err});
        }
        else {
            if(result && result.length > 0){
                for(var i in result){
                    delete result[i]._doc.content;
                }
            }
            res.json({"success": result});
        }
    });
});


router.post('/searchLinksFromAddressBar', function (req, res) {
    User.findOne({_id: req.body.userId}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            if(!doc){
                res.json({"error": "no user"});
                return;
            }
            var user = doc.toObject();
            var spaceIds = [];
            for (var i in user.space.created) {
                spaceIds.push(user.space.created[i]);
            }
            if(user.space.joined.length > 0){
                for(var i in user.space.joined){
                    spaceIds.push(user.space.joined[i]);
                }
            }
            var condition = {
                $or : [{title: new RegExp(req.body.keyword, "i")}, {description: new RegExp(req.body.keyword, "i")}],
                spaceId : {$in : spaceIds}
            };
            Link.find(condition).sort({lastVisitTime: -1}).exec(function (err, result) {
                if (err) {
                    res.json({"error": err});
                }
                else {
                    if(result && result.length > 0){
                        for(var i in result){
                            delete result[i]._doc.content;
                        }
                    }
                    res.json({"success": result});
                }
            });
        }
    });
});


router.post('/updateLinkVisitTime', function (req, res) {
    Link.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.linkId)}, {$set: {lastVisitTime: new Date()}}, function (err, doc) {
        if (err) {
            res.json({"error": "更新lastVisitTime失败"});
        }
        else {
            if(doc){
                delete doc._doc.content;
            }
            res.json({"success": doc});
        }
    });
});


router.post('/deleteLink', function (req, res) {
    Link.findOneAndRemove({_id: mongoose.Types.ObjectId(req.body.linkId)}, function (err) {
        if (err) {
            res.json({"error": "删除失败" + req.body.linkId});
        }
        else {
            res.json({"success": "删除成功" + req.body.linkId});
        }
    });
});


router.post('/getLinkById', function (req, res) {
    Link.findOne({_id: mongoose.Types.ObjectId(req.body.linkId)}, function (err, doc) {
        if (err) {
            res.json({"error": "获取Link失败" + req.body.linkId});
        }
        else {
            if(doc){
                delete doc._doc.content;
            }
            res.json({"success": doc});
        }
    });
});


router.post('/findLinkByUrlAndOwner', function (req, res) {
    Link.find({url: req.body.url, owner: mongoose.Types.ObjectId(req.body.owner)}, function (err, docs) {
        if (err) {
            res.json({"error": err});
        }
        else {
            if(docs && docs.length > 0){
                for(var i in docs){
                    delete docs[i]._doc.content;
                }
            }
            res.json({"success": docs});
        }
    });
});


router.post('/updateContent', function (req, res) {
    Link.findOneAndUpdate({_id: req.body.linkId}, {$set: {content: req.body.content}}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            if(doc){
                delete doc._doc.content;
            }
            res.json({"success": doc});
        }
    });
});

/*router.get('/url2png', function (req, res) {
    var options = {
        url: req.query.url,
        thumb_width: 136,
        format: 'png'
    };
    var imgUrl = urlbox.buildUrl(options);
    res.send(decodeURIComponent(imgUrl));
});*/


module.exports = router;
