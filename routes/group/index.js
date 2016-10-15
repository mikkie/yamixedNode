/**
 * group module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Group = mongoose.model('Group');

router.post('/new', function (req, res) {
    var name = req.body.name;
    var users = req.body.users;
    var owner = req.body.owner;
    var color = req.body.color;
    var id = req.body.id;
    var group = null;
    if(id){
        Group.findOne({_id : mongoose.Types.ObjectId(id)},function(err,doc){
            if (err) {
                res.json({"error": err});
            }
            else {
                group = doc;
                saveOrUpdateGroup();
            }
        });
    }
    else{
        group = new Group();
        group.name = name;
        group.color = color;
        group.owner = mongoose.Types.ObjectId(owner);
        saveOrUpdateGroup();
    }
    function saveOrUpdateGroup() {
        var userArray = [];
        if (users && users.length > 0) {
            for (var i in users) {
                var user = users[i].split('-');
                userArray.push({userName: user[1], userId: mongoose.Types.ObjectId(user[0])});
            }
        }
        group.users = userArray;
        group.save(function (err, result) {
            if (err) {
                res.json({"error": err});
            }
            else {
                res.json({"success": result});
            }
        });
    }
});


router.get('/findGroupByName', function (req, res) {
    Group.findOne({name : req.query.name},function(err,doc){
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});

router.get('/findGroupById', function (req, res) {
    Group.findOne({_id : mongoose.Types.ObjectId(req.query.groupId)},function(err,doc){
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});

router.get('/findGroupByNameLike', function (req, res) {
    Group.find({name : new RegExp(req.query.name,"i")},function(err,docs){
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": docs});
        }
    });
});


router.get('/getUserCreatedGroups',function(req, res){
    Group.find({owner : mongoose.Types.ObjectId(req.query.userId)},function(err,docs){
        if(err){
            res.json({"error" : err});
        }
        else{
            res.json({"success" : docs});
        }
    });
});


module.exports = router;