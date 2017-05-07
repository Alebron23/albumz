/**
 * Created by victorlebron on 4/24/17.
 */

var express  = require('express');
var router   = express.Router();
var firebase = require('firebase');
var db       = firebase.database();

router.get('/', function (req, res) {

    var genreRef  = db.ref("genres");

    genreRef.once('value', function(snapshot){

        var genres = [];

        snapshot.forEach(function(childSnapshot){

            var key       = childSnapshot.key;
            var childData = childSnapshot.val();

            if(childData.uid == firebase.auth().currentUser.uid){

                genres.push({
                    id: key,
                    name : childData.name
                });
            }
        });

        res.render('genres/index', {genres: genres});
    });
});

router.get('/add', function (req, res) {
    res.render('genres/add');
});

router.get('/edit/:id', function (req, res) {

    var id       = req.params.id;
    var genreRef = db.ref("genres/" + id);

    genreRef.once('value', function(snapshot){

        var genre = snapshot.val();
        res.render('genres/edit', {genre: genre, id: id});
    });
});

router.post('/edit/:id', function (req, res) {

    var id       = req.params.id;
    var name     = req.body.name;
    var genreRef = db.ref("genres/" + id);

    genreRef.update({
        name: name
    });

    res.redirect('/genres');
});

router.post('/add', function (req, res) {

    if(req.body.name === ''){
        req.flash('error_msg', 'Field is empty');
        res.redirect('/genres/add');
    } else{

        var genre = {
            uid : firebase.auth().currentUser.uid,
            name: req.body.name
        }

        var genreRef  = db.ref("genres");
        genreRef.push().set(genre);

        req.flash('success_msg', 'Genre Saved');
        res.redirect('/genres');
    }

});


router.delete('/delete/:id', function (req, res) {

    var id       = req.params.id;
    var genreRef = db.ref("genres/" + id);

    genreRef.remove();
    req.flash('success_msg', 'Genre Deleted');
    res.send(200);
});

module.exports = router;