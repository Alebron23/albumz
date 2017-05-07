/**
 * Created by victorlebron on 4/24/17.
 */
var express     = require('express');
var router      = express.Router();
var firebase    = require('firebase');
var db          = firebase.database();

router.get('/register', function (req, res, next) {
    res.render('users/register');
});

router.get('/login', function (req, res, next) {
   res.render('users/login');
});

router.post('/register', function (req, res, next) {

    var first_name  = req.body.first_name;
    var last_name   = req.body.last_name;
    var email       = req.body.email;
    var password    = req.body.password;
    var password2   = req.body.password2;
    var location    = req.body.location;
    var fav_artists = req.body.fav_artists;
    var fav_genres  = req.body.fav_genres;

    // Validation
    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors) {
        req.flash('error_msg', errors[0].msg);
        res.redirect('/users/register');
    } else {

        firebase.auth().createUserWithEmailAndPassword(email, password)

            .then(function(userRecord) {

                var user = {
                    uid         : userRecord.uid,
                    first_name  : first_name,
                    last_name   : last_name,
                    email       : email,
                    password    : password,
                    location    : location,
                    fav_genres  : fav_genres,
                    fav_artist  : fav_artists
                };

                var userRef = db.ref("users");

                userRef.push().set(user);
                console.log("Successfully created new user:", userRecord.uid);
                req.flash('success_msg', 'You are logged in.');
                res.redirect('/albums');
            })

            .catch(function(error) {

                console.log("Error creating new user:", error);
                req.flash('error_msg', error.message);
                res.redirect('/users/register');
            });
    }
});

router.post('/login', function (req, res, next) {

    var email       = req.body.email;
    var password    = req.body.password;


    // Validation
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();



    if(errors) {
        req.flash('error_msg', errors[0].msg);
        res.redirect('/users/login');
    } else {

        firebase.auth().signInWithEmailAndPassword(email, password)

            .then(function(authData) {
                req.flash('success_msg', 'Logged In.');
                res.redirect('/albums');
            })

            .catch(function(error) {

                console.log("Login Failed: ", error);
                req.flash('error_msg', error.message);
                res.redirect('/users/login');
            });
    }
});

// Logout User
router.get('/logout', function(req, res){

    //Unauthenticate the client
    firebase.auth().signOut().then(function() {

        //Signout successful
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    }).catch(function(error) {

        // An error happened.
        req.flash('error_msg', 'You were not logged out');
        res.redirect('/users/login');
    });
});


module.exports = router;