/**
 * space module
 */
var express = require('express'),
router = express.Router(),
mongoose = require('../common/mongodbUtil'),
Space = mongoose.model('Space'),
User = mongoose.model('User');


var getSpacesByIds = function(ids,res){
    if(!ids){
        res.json({"error" : "??????id"});
        return;
    }
    var idArray = ids.split(',');
    var conditions = [];
    for(var i in idArray){
        if(idArray[i].length != 24){
            continue;
        }
        conditions.push(mongoose.Types.ObjectId(idArray[i]));
    }
    if(conditions.length == 0){
        res.json({"error" : "??????id"});
        return;
    }
    Space.find({_id:{"$in" : conditions}},function(err,docs){
        if(err){
            res.json({"error" : "????????"});
        }
        else{
            res.json({"success" : docs});
        }
    });
};


router.post('/getUserSpace',function(req, res){
    getSpacesByIds(req.body.spaceIds,res);
});




router.get('/getUserCreatedSpaces',function(req, res){
   User.findOne({_id : mongoose.Types.ObjectId(req.query.userId)},function(err,doc){
       if(err){
           res.json({"error" : err});
       }
       else{
           var spaces = doc.toObject().space;
           var spaceIds = '';
           if(spaces.created && spaces.created.length > 0){
               for(var i in spaces.created){
                   spaceIds += spaces.created[i] + ',';
               }
               spaceIds = spaceIds.substring(0,spaceIds.length - 1);
               getSpacesByIds(spaceIds,res);
           }
       }
   });
});




router.get('/findSpaceByName', function (req, res) {
    Space.findOne({spaceName : req.query.name},function(err,doc){
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});


router.get('/findSpaceById', function (req, res) {
    Space.findOne({_id : mongoose.Types.ObjectId(req.query.spaceId)},function(err,doc){
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});






router.post('/new', function (req, res) {
    var name = req.body.name;
    var groups = req.body.groups;
    var owner = req.body.owner;
    var color = req.body.color;
    var id = req.body.id;
    var space = null;
    if(id){
        Space.findOne({_id : mongoose.Types.ObjectId(id)},function(err,doc){
            if (err) {
                res.json({"error": err});
            }
            else {
                space = doc;
                saveOrUpdateSpace(false);
            }
        });
    }
    else{
        space = new Space();
        space.spaceName = name;
        space.color = color;
        space.defaultSpace = false;
        space.userId = mongoose.Types.ObjectId(owner);
        saveOrUpdateSpace(true);
    }
    function saveOrUpdateSpace(isNew) {
        var groupArray = [];
        if (groups && groups.length > 0) {
            for (var i in groups) {
                var group = groups[i].split('-');
                groupArray.push({
                    permission: group[2],
                    groupName: group[1],
                    groupId: mongoose.Types.ObjectId(group[0])
                });
            }
        }
        space.groups = groupArray;
        space.save(function (err, result) {
            if (err) {
                res.json({"error": err});
            }
            else {
                if(isNew){
                    User.findOne({_id: mongoose.Types.ObjectId(owner)}, function (err, doc) {
                        var user = doc.toObject();
                        var createdSpace = user.space.created;
                        createdSpace.push(mongoose.Types.ObjectId(result.toObject()._id));
                        doc.space.created = createdSpace;
                        doc.save(function (err, result) {
                            if (err) {
                                res.json({"error": err});
                            }
                            else {
                                res.json({"success": result});//here is user
                            }
                        });
                    });
                }
                else{
                    res.json({"success": result});//here is space
                }
            }
        });
    }
});

module.exports = router;
