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

module.exports = router;
