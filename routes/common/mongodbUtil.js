var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;
mongoose.connect('mongodb://localhost/yamixed');

//define tables

//1.user
var UserSchema = new Schema({  
	   userName  :  {type : String, index : true},
	   email : {type : String, index : true},
	   password : String,
	   joinDate : { type: Date, default: Date.now },
	   loginDate : { type: Date, default: Date.now },
       space : {
          created : [ObjectId],
          joined : [ObjectId]
       }
});

//2.space
var SpaceSchema = new Schema({
    spaceName : {type : String, index : true},
    userId : ObjectId,
    defaultSpace : Boolean,
    createDate : { type: Date, default: Date.now },
    groups : [{
        groupName : String,
        groupId : ObjectId,
        permission : String
    }]
});

//3.link
var LinkSchema = new Schema({
    url : {type : String, index : true},
    title : {type : String, index : true},
    description : {type : String, index : true},
    previewImg : String,
    content : String,
    spaceId : ObjectId,
    tags : [String],
    lastVisitTime :{ type: Date, default: Date.now }
});

//4.group
var GroupSchema = new Schema({
    name : {type : String, index : true},
    users : [{
        userName : String,
        userId : ObjectId
    }],
    owner : ObjectId,
    createDate : { type: Date, default: Date.now }
});


mongoose.model('User',UserSchema);
mongoose.model('Space',SpaceSchema);
mongoose.model('Link', LinkSchema);
mongoose.model('Group', GroupSchema);

module.exports = mongoose;
