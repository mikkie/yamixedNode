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
    color : {type : String},
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
    color : {type : String},
    owner : ObjectId,
    createDate : { type: Date, default: Date.now }
});

//5.message
var MessageSchema = new Schema({
    content : {type : String},
    createDate : { type: Date, default: Date.now },
    from : {type : ObjectId},
    to : {type : ObjectId},
    valid : {type : Boolean, default: true},
    expireDate : {type: Date}
});


mongoose.model('User',UserSchema);
mongoose.model('Space',SpaceSchema);
mongoose.model('Link', LinkSchema);
mongoose.model('Group', GroupSchema);
mongoose.model('Message', MessageSchema);

module.exports = mongoose;
