/**
 * note module
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('../common/mongodbUtil'),
    Note = mongoose.model('Note'),
    Link = mongoose.model('Link');

router.post('/new', function (req, res) {
    var note = null;
    Note.find({url : req.body.url,owner : mongoose.Types.ObjectId(req.body.owner)},function(err,docs){
        if(err){
            res.json({"error":err});
        }
        else{
            var detail = {
                content : req.body.content,
                sentence : req.body.sentence,
                x : req.body.x,
                y : req.body.y
            };
            if(docs.length > 0){
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
                createLink(req.body.url,req.body.space,req.body.owner,req.body.sentence,req.body.content);
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
        }
    });
});


var createLink = function(url,space,owner,sentence,content){
    var link = new Link();
    link.url = url;
    link.title = sentence;
    link.description = content;
    link.previewImg = '';
    link.spaceId = mongoose.Types.ObjectId(space);
    link.owner = mongoose.Types.ObjectId(owner);
    link.save(function (err, result) {});
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