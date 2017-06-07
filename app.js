/**
 * Created by victorlebron on 4/24/17.
 */
var express          = require('express');
var path             = require('path');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var session          = require('express-session');
var expressValidator = require('express-validator');
var flash            = require('connect-flash');
var port             = process.env.PORT || 8000;
var firebase         = require( 'firebase');

var config = {
    apiKey: "AIzaSyBeWvoshB6IYHuAXJDL3-DH6N-IyxdFYZs",
    authDomain: "albumz-523fc.firebaseapp.com",
    databaseURL: "https://albumz-523fc.firebaseio.com",
    projectId: "albumz-523fc",
    storageBucket: "albumz-523fc.appspot.com",
    messagingSenderId: "1071839851432"
};

firebase.initializeApp(config);

var db = firebase.database();

// Route Files
var routes = require('./routes/index');
var albums = require('./routes/albums');
var genres = require('./routes/genres');
var users  = require('./routes/users');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Handle Sessions
app.use(session({

    secret              : 'secret',
    saveUninitialized   : true,
    resave              : true
}));

// Validator
app.use(expressValidator({

    errorFormatter: function(param, msg, value) {

        var namespace = param.split('.'),
            root      = namespace.shift(),
            formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Static Folder - Tells the system that this will be the static folder
app.use(express.static(path.join(__dirname, 'public'), { redirect : false }));

// Connect Flash
app.use(flash());

// Global Variables
app.use(function (req, res, next) {

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg   = req.flash('error_msg');
    res.locals.error       = req.flash('error');        // This is for passport. passport creates an error message.
    res.locals.authdata    = firebase.auth().currentUser;
    res.locals.page        = req.url;
    next();
});

app.get('*', function(req, res, next) {

    firebase.auth().onAuthStateChanged(function(user) {

        if (user) {

            console.log("Welcome UID:" + user.email);

            var userRef = db.ref("users");

            userRef.orderByChild("uid").startAt(firebase.auth().currentUser.uid).endAt(firebase.auth().currentUser.uid).on("child_added", function (snapshot) {
                res.locals.user = snapshot.val();
            });
        }

        next();
    });
});

// Routes middleware
app.use('/', routes);
app.use('/albums', albums);
app.use('/genres', genres);
app.use('/users', users);

// Run Server
app.listen(port);
