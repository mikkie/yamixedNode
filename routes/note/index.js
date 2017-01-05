/**
 * note module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    common = require('../common/common'),
    Note = mongoose.model('Note'),
    Link = mongoose.model('Link');

router.post('/new', function (req, res) {
    var note = null;
    Note.find({url : req.body.url,owner : mongoose.Types.ObjectId(req.body.owner)},function(err,docs){
        if(err){
            res.json({"error":err});
        }
        else{
            createLink(req.body.id,docs,req.body.icon,req.body.url,req.body.space,req.body.owner,req.body.sentence,req.body.content,req.body.tags,res,function(link){
                var detail = {
                    content : req.body.content,
                    sentence : req.body.sentence,
                    space : mongoose.Types.ObjectId(req.body.space),
                    link : mongoose.Types.ObjectId(link._id),
                    x : req.body.x,
                    y : req.body.y
                };
                if(docs && docs.length > 0){
                    note = docs[0];
                }
                else{
                    note = new Note();
                    note.url = req.body.url;
                    note.owner = mongoose.Types.ObjectId(req.body.owner);
                    note.notes = [];
                }
                if(req.body.id && note.notes.length > 0){
                    for(var i = 0; i < note.notes.length; i++){
                        if(note.notes[i].toObject()._id.toString() == req.body.id){
                            note.notes[i].content = req.body.content;
                            note.notes[i].createDate = new Date();
                            break;
                        }
                    }
                }
                else{
                    note.notes.push(detail);
                }
                note.save(function(err,doc){
                    if(err){
                        res.json({"error":err});
                    }
                    else{
                        var noteO = doc.toObject();
                        var notes = noteO.notes;
                        notes.sort(function(a,b){
                            return a.createDate - b.createDate;
                        });
                        var detail = notes[notes.length - 1];
                        detail.url = noteO.url;
                        detail.owner = noteO.owner;
                        res.json({"success":detail});
                    }
                });
            });
        }
    });
});


var saveNoteLink = function(link,icon,url,space,owner,sentence,content,tags,res,callback){
    link.url = url;
    link.title = sentence;
    link.description = content;
    link.valid = true;
    link.color = common.randomColor('');
    link.previewImg = icon;
    link.tags = tags;
    link.spaceId = mongoose.Types.ObjectId(space);
    link.owner = mongoose.Types.ObjectId(owner);
    link.save(function (err, result) {
        if(err){
            res.json({"error":err});
        }
        else{
            callback(result.toObject());
        }
    });
};

var createLink = function(id,docs,icon,url,space,owner,sentence,content,tags,res,callback){
    var link = new Link();
    if(id){
        if(docs && docs.length > 0){
           var note = docs[0];
           if(note.notes.length > 0){
                for(var i = 0; i < note.notes.length; i++){
                    if(note.notes[i].toObject()._id.toString() == id){
                        var linkId = note.notes[i].link;
                        Link.findOne({_id:mongoose.Types.ObjectId(linkId)},function(err,doc){
                           if(!err && doc){
                              saveNoteLink(doc,icon,url,space,owner,sentence,content,tags,res,callback);
                           }
                           else{
                              saveNoteLink(link,icon,url,space,owner,sentence,content,tags,res,callback);
                           }
                        });
                        return;
                    }
                }
           }
        }
    }
    saveNoteLink(link,icon,url,space,owner,sentence,content,tags,res,callback);
};

router.post('/delete', function (req, res) {
    Note.find({url : req.body.url,owner : mongoose.Types.ObjectId(req.body.owner)},function(err,docs){
        if(err){
            res.json({"error":err});
        }
        else{
            if(docs.length > 0){
                var note = docs[0];
                if(req.body.id && note.notes.length > 0){
                    for(var i = 0; i < note.notes.length; i++){
                        if(note.notes[i].toObject()._id.toString() == req.body.id){
                            note.notes[i].valid = false;
                            note.notes[i].createDate = new Date();
                            Link.findOneAndRemove({_id:mongoose.Types.ObjectId(note.notes[i].link)},function(err,doc){});
                            break;
                        }
                    }
                    note.save(function(err,doc){
                        if(err){
                            res.json({"error":err});
                        }
                        else{
                            var noteO = doc.toObject();
                            var notes = noteO.notes;
                            notes.sort(function(a,b){
                                return a.createDate - b.createDate;
                            });
                            var detail = notes[notes.length - 1];
                            detail.url = noteO.url;
                            detail.owner = noteO.owner;
                            res.json({"success":detail});
                        }
                    });
                }
            }
        }
    });
});


router.post('/search', function (req, res) {
    Note.find({url : req.body.url,owner : mongoose.Types.ObjectId(req.body.owner)},function(err,docs){
       if(err){
          res.json({"error":err});
       }
       else{
          res.json({"success":docs});
       }
    });
});

module.exports = router;