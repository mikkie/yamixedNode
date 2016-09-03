var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;
mongoose.connect('mongodb://localhost/yamixed');

//define tables
//1.user
var UserSchema = new Schema({  
	   userid   :  ObjectId,  
	   username  :  {type : String, index : true},
	   email : {type : String, index : true},
	   password : String,
	   joinDate : { type: Date, default: Date.now }
});  


mongoose.model('User',UserSchema);

module.exports = mongoose;
