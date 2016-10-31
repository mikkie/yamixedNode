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
       avatar : {
          color : {type : String, default: 'ffffff'},
          alphabet : {type : String, default: 'U'}
       },
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
    valid : {type : Boolean, default : true},
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
    owner : ObjectId,
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
    valid : {type : Boolean, default : true},
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


//6.note
var NoteSchema = new Schema({
    url : {type : String,index : true},
    owner : { type : ObjectId },
    notes : [
       {
           sentence : {type : String},
           content : {type : String},
           color : {type : String, default: 'fbad18'},
           valid : {type : Boolean, default: true},
           createDate : {type: Date, default: Date.now},
           x : {type : String},
           y : {type : String}
       }
    ]
});


mongoose.model('User',UserSchema);
mongoose.model('Space',SpaceSchema);
mongoose.model('Link', LinkSchema);
mongoose.model('Group', GroupSchema);
mongoose.model('Message', MessageSchema);
mongoose.model('Note', NoteSchema);

module.exports = mongoose;
