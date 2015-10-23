/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
//var crypto = require('crypto');
var router = express.Router();

/* GET search */
router.get('/search/', function(req, res) {
    //Turn all these into MySQL command to do the searching
    var gender = req.query.gender;
    var firstname = req.query.firstname;
    var lastname = req.query.lastname;
    var email = req.query.email;
    var country = req.query.country;
    res.send("searching... " + " " + gender + " " + firstname + " " + lastname + " " + email + " " + country);
});

/**
 * TODO return a list of currently online users
 */
router.get('/token/', function (req, res) {
    res.send("In progress");
});

/**
 * TODO revoke token
 */
router.delete('/token/:id', function (req, res) {
    res.send("In progress");
});

/**
 * TODO basic auth
 * GET user with id
 * */
router.get('/:id', function(req, res) {
    res.send('user id = ' + req.params.id);
});

/**
 * GET home page.
 * */
router.get('/', function(req, res, next) {
    //var hash = crypto.createHash('sha256').update('testing').digest('hex'); //how to hash sth in sha256
    res.render('index', { title: 'User' }); //index is index.jade
});

module.exports = router;