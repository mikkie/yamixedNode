/**
 * space module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Space = mongoose.model('Space'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Link = mongoose.model('Link'),
    gsService = require('../service/groupSpaceService.js');


var bookmarksCache = {};

var getSpacesByIds = function (ids, res) {
    if (!ids) {
        res.json({"error": "??????id"});
        return;
    }
    var idArray = ids.split(',');
    var conditions = [];
    for (var i in idArray) {
        if (idArray[i].length != 24) {
            continue;
        }
        conditions.push(mongoose.Types.ObjectId(idArray[i]));
    }
    if (conditions.length == 0) {
        res.json({"error": "??????id"});
        return;
    }
    Space.find({_id: {"$in": conditions}, valid: true}, function (err, docs) {
        if (err) {
            res.json({"error": "????????"});
        }
        else {
            res.json({"success": docs});
        }
    });
};


router.post('/getUserSpace', function (req, res) {
    getSpacesByIds(req.body.spaceIds, res);
});


router.get('/getUserCreatedSpaces', function (req, res) {
    User.findOne({_id: mongoose.Types.ObjectId(req.query.userId)}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            var spaces = doc.toObject().space;
            var spaceIds = '';
            if (spaces.created && spaces.created.length > 0) {
                for (var i in spaces.created) {
                    spaceIds += spaces.created[i] + ',';
                }
                spaceIds = spaceIds.substring(0, spaceIds.length - 1);
                getSpacesByIds(spaceIds, res);
            }
        }
    });
});


router.get('/findSpaceByName', function (req, res) {
    Space.findOne({spaceName: req.query.name, valid: true}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});


router.get('/findSpaceById', function (req, res) {
    Space.findOne({_id: mongoose.Types.ObjectId(req.query.spaceId)}, function (err, doc) {
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
    var oldGroups = null;
    if (id) {
        Space.findOne({_id: mongoose.Types.ObjectId(id)}, function (err, doc) {
            if (err) {
                res.json({"error": err});
            }
            else {
                space = doc;
                oldGroups = doc.toObject().groups;
                saveOrUpdateSpace(false);
            }
        });
    }
    else {
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
        space.save(function (err, newSpace) {
            if (err) {
                res.json({"error": err});
            }
            else {
                if (isNew) {
                    User.findOne({_id: mongoose.Types.ObjectId(owner)}, function (err, doc) {
                        var user = doc.toObject();
                        var createdSpace = user.space.created;
                        createdSpace.push(mongoose.Types.ObjectId(newSpace.toObject()._id));
                        doc.space.created = createdSpace;
                        doc.save(function (err, result) {
                            if (err) {
                                res.json({"error": err});
                            }
                            else {
                                gsService.informUserJoinSpace(newSpace.toObject(), null);
                                res.json({"success": result});//here is user
                            }
                        });
                    });
                }
                else {
                    gsService.informUserJoinSpace(newSpace.toObject(), oldGroups);
                    res.json({"success": newSpace});//here is space
                }
            }
        });
    }
});


router.post('/join', function (req, res) {
    var userId = req.body.userId;
    var spaceId = req.body.spaceId;
    var messageId = req.body.spaceId;
    User.findOne({_id: mongoose.Types.ObjectId(userId)}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            var user = doc.toObject();
            var joinSpaces = user.space.joined;
            if (joinSpaces.length == 0) {
                joinSpaces.push(mongoose.Types.ObjectId(spaceId));
            }
            else {
                for (var i in joinSpaces) {
                    var space = joinSpaces[i];
                    if (space.toString == spaceId) {
                        res.json({"success": "spaceId已加入"});
                        return;
                    }
                }
                joinSpaces.push(mongoose.Types.ObjectId(spaceId));
            }
            doc.space.joined = joinSpaces;
            doc.save(function (err, result) {
                if (err) {
                    res.json({"error": err});
                }
                else {
                    res.json({"success": result});
                }
            });
        }
    });
});


router.get('/checkRWPermission', function (req, res) {
    var spaceId = req.query.spaceId;
    var userId = req.query.userId;
    Space.findOne({_id: mongoose.Types.ObjectId(spaceId)}, function (err, doc) {
        var groups = doc.toObject().groups;
        var gIds = [];
        if (groups && groups.length > 0) {
            for (var i in groups) {
                if (groups[i].permission == 'rw') {
                    gIds.push(groups[i].groupId);
                }
            }
        }
        if (gIds.length > 0) {
            Group.find({_id: {$in: gIds}}, function (err, docs) {
                if (err) {
                    res.json({"error": err});
                }
                else {
                    if (docs.length > 0) {
                        for (var i in docs) {
                            var doc = docs[i].toObject();
                            if (doc.users && doc.users.length > 0) {
                                for (var i in doc.users) {
                                    var user = doc.users[i];
                                    if (user.userId.toString() == userId) {
                                        res.json({"success": "rw"});
                                        return;
                                    }
                                }
                                res.json({"success": "r"});
                            }
                        }
                    }
                    else {
                        res.json({"success": "r"});
                    }
                }
            })
        }
        else {
            res.json({"success": "r"});
        }
    });
});


router.get('/disableSpace', function (req, res) {
    Space.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.query.spaceId)}, {$set: {valid: false}}, function (err, doc) {
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": doc});
        }
    });
});


var createTags = function(node){
  var pId = node.parentId;
  var parent = bookmarksCache[pId];
  var tags = [];
  while(parent && parent.id != 0 && parent.id != 1 && parent.id != 2 && parent.title){
      tags.unshift(parent.title);
      pId = parent.parentId;
      if(!pId){
        return tags;
      }
      parent = bookmarksCache[pId];
  }
  return tags;
};

var createLink = function(node,spaceId){
  var link = new Link();
  link.url = node.url;
  link.title = node.title;
  link.description = '';
  link.previewImg = '';
  link.content = '';
  link.spaceId = mongoose.Types.ObjectId(spaceId);
  link.tags = createTags(node);
  link.save(function(err,doc){
  });
};

var syncBookMark = function(nodes,spaceId){
  if(nodes instanceof Array){
     for(var i in nodes){
       var node = nodes[i];
       if(node.children){
         bookmarksCache[node.id] = node;
         syncBookMark(node.children,spaceId);
       }
       else if(node.url){
         createLink(node,spaceId);
       }
     }
  }
};

router.post('/init', function (req, res) {
    var nodes = req.body.nodes;
    var spaceId = req.body.spaceId;
    syncBookMark(nodes,spaceId);
    res.json({"success": nodes});
});

module.exports = router;
