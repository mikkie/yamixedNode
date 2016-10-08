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
    var group = new Group();
    group.name = name;
    var userArray = [];
    if(users && users.length > 0){
       for(var i in users){
           var user = users[i].split('-');
           userArray.push({userName : user[1], userId : mongoose.Types.ObjectId(user[0])});
       }
    }
    group.users = userArray;
    group.owner = mongoose.Types.ObjectId(owner);
    group.save(function (err, result) {
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": result});
        }
    });
});

module.exports = router;