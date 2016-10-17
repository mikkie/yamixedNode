/**
 * space module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    TEMPLATE = require('../template/temp.js'),
    Space = mongoose.model('Space'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Message = mongoose.model('Message'),
    Q = require("q");


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
    Space.find({_id: {"$in": conditions}}, function (err, docs) {
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
    Space.findOne({spaceName: req.query.name}, function (err, doc) {
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


var buildUsers = function (groups) {
    var deferred = Q.defer();
    if (!groups || groups.length == 0) {
        deferred.resolve([]);
        return deferred.promise;
    }
    var allUsers = [];
    var count = 0;
    for (var i in groups) {
        var group = groups[i];
        Group.findOne({_id: mongoose.Types.ObjectId(group.groupId)}, function (err, doc) {
            if (err) {
                res.json({"error": err});
            }
            else {
                group = doc.toObject();
                var users = group.users;
                if (users && users.length > 0) {
                    for (var i in users) {
                        allUsers.push(users[i]);
                    }
                    count++;
                    if (count == groups.length) {
                        deferred.resolve(allUsers);
                    }
                }
            }
        });
    }
    return deferred.promise;
};

var buildAddUsers = function (newUsers, oldUsers) {
    var addUsers = [];
    if (!oldUsers || oldUsers.length == 0) {
        if (!newUsers || newUsers.length == 0) {
            return [];
        }
        else {
            for (var i in newUsers) {
                addUsers.push(newUsers[i]);
            }
            return addUsers;
        }
    }
    if (!newUsers || newUsers.length == 0) {
        return [];
    }
    for (var i in newUsers) {
        var newUser = newUsers[i];
        var found = false;
        for (var j in oldUsers) {
            var oldUser = oldUsers[j];
            if (newUser.userId.toString() == oldUser.userId.toString()) {
                found = true;
                break;
            }
        }
        if (!found) {
            addUsers.push(newUser);
        }
    }
    return addUsers;
};


var buildRemoveUsers = function (newUsers, oldUsers) {
    var removeUsers = [];
    if (!newUsers || newUsers.length == 0) {
        if (!oldUsers || oldUsers.length == 0) {
            return [];
        }
        else {
            for (var i in oldUsers) {
                removeUsers.push(oldUsers[i]);
            }
            return removeUsers;
        }
    }
    if (!oldUsers || oldUsers.length == 0) {
        return [];
    }
    for (var i in oldUsers) {
        var oldUser = oldUsers[i];
        var found = false;
        for (var j in newUsers) {
            var newUser = newUsers[j];
            if (oldUser.userId.toString() == newUser.userId.toString()) {
                found = true;
                break;
            }
        }
        if (!found) {
            removeUsers.push(oldUser);
        }
    }
    return removeUsers;
};


var createJoinSpaceMsgs = function (space, addUsers) {
    if (!addUsers || addUsers.length == 0) {
        return;
    }
    User.findOne({_id: mongoose.Types.ObjectId(space.userId)}, function (err, doc) {
        var user = doc.toObject();
        var msgs = [];
        for (var i in addUsers) {
            var addUser = addUsers[i];
            var msg = {};
            msg.to = addUser.userId;
            msg.from = space.userId;
            var temp = TEMPLATE.MESSAGE.JOIN_SPACE;
            temp = temp.replace('{content}', user.userName + '邀请你加入' + space.spaceName)
                .replace('{userId}', msg.to).replace('{spaceId}', space._id);
            msg.content = temp;
            msg.createDate = Date.now();
            msg.valid = true;
            msgs.push(msg);
        }
        Message.collection.insert(msgs, function (err, docs) {
            if (err) {
                res.json({"error": err});
            }
        });
    });
};


var removeUserFromSpace = function (userId, spaceId) {
    User.findOne({_id: mongoose.Types.ObjectId(userId)}, function (err, doc) {
        if (err) {
            console.log(err);
        }
        else {
            var user = doc.toObject();
            var joinSpace = user.space.joined;
            if (joinSpace.length > 0) {
                var index = -1;
                for (var i in joinSpace) {
                    var space = joinSpace[i];
                    if (space.toString() == spaceId) {
                        index = i;
                        break;
                    }
                }
                if (index > -1) {
                    joinSpace.splice(index, 1);
                }
            }
            doc.space.joined = joinSpace;
            doc.save(function (err, result) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
};

var createLeaveSpaceMsgs = function (space, removeUsers) {
    if (!removeUsers || removeUsers.length == 0) {
        return;
    }
    User.findOne({_id: mongoose.Types.ObjectId(space.userId)}, function (err, doc) {
        var user = doc.toObject();
        var msgs = [];
        for (var i in removeUsers) {
            var removeUser = removeUsers[i];
            var msg = {};
            msg.to = removeUser.userId;
            msg.from = space.userId;
            var temp = TEMPLATE.MESSAGE.LEAVE_SPACE;
            temp = temp.replace('{content}', user.userName + '把你移出' + space.spaceName);
            msg.content = temp;
            msg.createDate = Date.now();
            msg.valid = true;
            msgs.push(msg);
            removeUserFromSpace(msg.to, space._id);
        }
        Message.collection.insert(msgs, function (err, docs) {
            if (err) {
                res.json({"error": err});
            }
        });
    });
};


var informUserJoinSpace = function (space, oldGroups) {
    buildUsers(oldGroups).then(function (oldUsers) {
        buildUsers(space.groups).then(function (newUsers) {
            var addUsers = buildAddUsers(newUsers, oldUsers);
            createJoinSpaceMsgs(space, addUsers);
            var removeUsers = buildRemoveUsers(newUsers, oldUsers);
            createLeaveSpaceMsgs(space, removeUsers);
        });
    });
};


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
                                informUserJoinSpace(newSpace.toObject(), null);
                                res.json({"success": result});//here is user
                            }
                        });
                    });
                }
                else {
                    informUserJoinSpace(newSpace.toObject(), oldGroups);
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

module.exports = router;
