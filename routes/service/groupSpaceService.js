var mongoose = require('../common/mongodbUtil'),
    common = require('../common/common.js'),
    TEMPLATE = require('../template/temp.js'),
    User = mongoose.model('User'),
    Space = mongoose.model('Space'),
    Group = mongoose.model('Group'),
    Message = mongoose.model('Message'),
    Q = require("q");

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


var removeUserFromSpace = function (userId, spaceId,deferred) {
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
                    console.log(userId + ' spaceId=' + space.toString());
                    if (space.toString() == spaceId) {
                        index = i;
                        //break;
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
                console.log('remove ' + userId + ' from ' + spaceId);
                if(deferred){
                    deferred.resolve();
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


var notifyUserRemoveSpaceIfNeed = function (user,space) {
    var deferred = Q.defer();
    User.findOne({_id: mongoose.Types.ObjectId(user.userId)}, function (err, doc) {
        if (!err) {
            var userO = doc.toObject();
            var found = false;
            for (var i in userO.space.joined) {
                if (userO.space.joined[i].toString() == space._id.toString()) {
                    found = true;
                    break;
                }
            }
            if (found) {
                User.findOne({_id: mongoose.Types.ObjectId(space.userId)}, function (err, doc) {
                    var owner = doc.toObject();
                    var msg = new Message();
                    msg.to = user.userId;
                    msg.from = space.userId;
                    var temp = TEMPLATE.MESSAGE.LEAVE_SPACE;
                    temp = temp.replace('{content}', owner.userName + '把你移出' + space.spaceName);
                    msg.content = temp;
                    msg.createDate = Date.now();
                    msg.valid = true;
                    removeUserFromSpace(msg.to, space._id,deferred);
                    msg.save(function (err, doc) {
                    });
                });
            }
        }
    });
    return deferred.promise;
};


var notifyUserAddSpaceIfNeed = function(user,space){
    var deferred = Q.defer();
    User.findOne({_id: mongoose.Types.ObjectId(user.userId)}, function (err, doc) {
        if (!err) {
            var userO = doc.toObject();
            var found = false;
            for (var i in userO.space.joined) {
                if (userO.space.joined[i].toString() == space._id.toString()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                User.findOne({_id: mongoose.Types.ObjectId(space.userId)}, function (err, doc) {
                    var owner = doc.toObject();
                    var msg = new Message();
                    msg.to = user.userId;
                    msg.from = space.userId;
                    var temp = TEMPLATE.MESSAGE.JOIN_SPACE;
                    temp = temp.replace('{content}', owner.userName + '邀请你加入' + space.spaceName)
                        .replace('{userId}', msg.to).replace('{spaceId}', space._id);
                    msg.content = temp;
                    msg.createDate = Date.now();
                    msg.valid = true;
                    msg.save(function (err, doc) {
                        deferred.resolve();
                    });
                });
            }
        }
    });
    return deferred.promise;
};

var informUserJoinSpaceAfterGroupEdit = function (group, oldUsers) {
    //1.add user and remove user
    var addUsers = buildAddUsers(group.users, oldUsers);
    var removeUsers = buildRemoveUsers(group.users, oldUsers);
    //2.reference spaces
    Space.find({
        groups: {
            $elemMatch: {
                groupId: {
                    $all: [group._id]
                }
            }
        }
    }, function (err, docs) {
        if (!err) {
            if (docs && docs.length > 0) {
                common.forEachPromise(null,0,docs,function(doc){
                    var outerDeferred = Q.defer();
                    var space = doc.toObject();
                    (function(){
                        var deferred = Q.defer();
                        common.forEachPromise(deferred,0,addUsers,notifyUserAddSpaceIfNeed,space);
                        return deferred.promise;
                    })().then(function(){
                        common.forEachPromise(outerDeferred,0,removeUsers,notifyUserRemoveSpaceIfNeed,space);
                    });
                    return outerDeferred.promise;
                });
            }
        }
    });
};








module.exports = {
    informUserJoinSpace: informUserJoinSpace,
    informUserJoinSpaceAfterGroupEdit: informUserJoinSpaceAfterGroupEdit
};
