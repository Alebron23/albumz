/**
 * Created by victorlebron on 4/24/17.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;