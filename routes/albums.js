/**
 * Created by victorlebron on 4/24/17.
 */
var express     = require('express');
var router      = express.Router();
var firebase    = require('firebase');
var db          = firebase.database();
var multer      = require('multer');
var upload      = multer({dest : './public/images/uploads'});

router.get('*', function(req, res, next){

    if(firebase.auth().currentUser == null){
        req.flash('error_msg', 'You must be logged in to view albums or genres');
        res.redirect('/users/login')
    }

    next();
});

router.get('/', function (req, res) {

    var albumRef  = db.ref('albums');

    albumRef.once('value', function(snapshot){

        var albums = [];

        snapshot.forEach(function(childSnapshot){

            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            if(childData.uid == firebase.auth().currentUser.uid){

                albums.push({
                    id     : key,
                    artist : childData.artist,
                    title  : childData.title,
                    genre  : childData.genre,
                    info   : childData.info,
                    label  : childData.label,
                    tracks : childData.tracks,
                    cover  : childData.cover
                });
            }
        });

        res.render('albums/index', {albums: albums});
    });
});


router.get('/add', function (req, res) {

    var ref  = db.ref("genres");

    ref.once('value', function(snapshot){

        var data = [];

        snapshot.forEach(function(childSnapshot){

            var key       = childSnapshot.key;
            var childData = childSnapshot.val();

           data.push({
               id   : key,
               name : childData.name
           });
       });

        res.render('albums/add', {genres: data});
    });
});


router.get('/details/:id', function (req, res) {

    var id       = req.params.id;
    var albumRef = db.ref("albums/" + id);

    albumRef.once('value', function(snapshot){

        var album = snapshot.val();

        res.render('albums/details', {album: album, id: id});
    });
});


router.get('/edit/:id', function (req, res) {

    var id       = req.params.id;
    var albumRef = db.ref("albums/" + id);
    var genreRef = db.ref("genres");

    genreRef.once('value', function(snapshot){

        var genres = [];

        snapshot.forEach(function(childSnapshot){

            var key       = childSnapshot.key;
            var childData = childSnapshot.val();

            genres.push({
                id   : key,
                name : childData.name
            });
        });

        albumRef.once('value', function(snapshot){

            var album = snapshot.val();

            res.render('albums/edit', {album: album, id: id, genres: genres});
        });
    });
});


router.post('/edit/:id', upload.single('cover'), function (req, res) {

    var id       = req.params.id;
    var albumRef = db.ref("albums/" + id);

    //Check File Upload
    if(req.file){

        var cover = req.file.filename;

        albumRef.update({
            artist  : req.body.artist,
            title   : req.body.title,
            genre   : req.body.genre,
            info    : req.body.info,
            year    : req.body.year,
            label   : req.body.label,
            tracks  : req.body.tracks,
            cover   : cover
        });
    } else {

        albumRef.update({
            artist  : req.body.artist,
            title   : req.body.title,
            genre   : req.body.genre,
            info    : req.body.info,
            year    : req.body.year,
            label   : req.body.label,
            tracks  : req.body.tracks,
        });
    }

    req.flash('success_msg', 'Album Updated');
    res.redirect('/albums/details/' + id);
});


router.post('/add', upload.single('cover'), function (req, res) {

    //Check File Upload
    if(req.file){
        console.log('Uploading File...');
        var cover = req.file.filename;
    } else {
        console.log('No File Uploaded...');
        var cover = 'noimage.jpg';
    }

    // Build Album Object
    var album = {
        uid     : firebase.auth().currentUser.uid,
        artist  : req.body.artist,
        title   : req.body.title,
        genre   : req.body.genre,
        info    : req.body.info,
        year    : req.body.year,
        label   : req.body.label,
        tracks  : req.body.tracks,
        cover   : cover
    };

    console.log(album);

    // Create Reference
    var albumRef = db.ref("albums");

    albumRef.push().set(album);
    req.flash('success_msg', 'Album Saved');
    res.redirect('/albums');
});


router.delete('/delete/:id', function (req, res) {

    var id       = req.params.id;
    var albumRef = db.ref("albums/" + id);

    albumRef.remove();
    req.flash('success_msg', 'Album Deleted');
    res.send(200);
});

module.exports = router;