/**
 * space module
 */
var express = require('express'),
router = express.Router(),
mongoose = require('../common/mongodbUtil'),
Space = mongoose.model('Space');

router.post('/getUserSpace',function(req, res){
  var ids = req.body.spaceIds;
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

router.post('/new', function (req, res) {
    var name = req.body.name;
    var groups = req.body.groups;
    var owner = req.body.owner;
    var space = new Space();
    space.spaceName = name;
    var groupArray = [];
    if(groups && groups.length > 0){
        for(var i in groups){
            var group = groups[i].split('-');
            groupArray.push({permission : group[2], groupName : group[1], groupId : mongoose.Types.ObjectId(group[0])});
        }
    }
    space.defaultSpace = false;
    space.groups = groupArray;
    space.userId = mongoose.Types.ObjectId(owner);
    space.save(function (err, result) {
        if (err) {
            res.json({"error": err});
        }
        else {
            res.json({"success": result});
        }
    });
});

module.exports = router;
