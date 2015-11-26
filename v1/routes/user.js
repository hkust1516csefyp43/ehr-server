/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var db = require('../database');
var sql = require('sql-bricks-postgres');

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

// Frontend input username+password
// Backend connect to DB, check username+password
// yes->Backend create token + write token into backend which token FD: token->username
// no->Backend return error to Frontend

router.get('/token_create/', function (req, res) {
//Todo Louis
    pg.connect(db.url(), function (err, client, done) {
        var x = 3;
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var a = 2;

        function do_a(b, callback) {

            console.log(b);
            if (b == 2) {
                client.query('SELECT * from token', function (err, result) {
                    //call `done()` to release the client back to the pool
                    done();

                    if (err) {
                        return console.error('error running query', err);
                    }
                    res.send('result1');
                });
            }
            callback();
        }

        do_a(a, function () {
            res.send('result2');
        });

    });
});

router.get('/log_in/', function (req, res) {
    //TODO use basic auth
    var user = req.query.email; // read user
    var pwd = req.query.password; // read password
    var userid;

    var processed_pwd = pwd;    //TODO 1:process the password
    var query = sql.select().from('users').where({email: user}).toParams();

    //var tokenquery=sql.insertInto('token', 'user_email', 'token').values(user, );
    //var query=sql.select().from('user').toParams();
    pg.connect(db.url(), function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query(query, function (err, result) {
            //call `done()` to release the client back to the pool
            done();

            if (err) {
                return console.error('error running query', err);
            }

            //start varity user
            // CASE1:invalid user
            if (result.rows[0] == undefined) {
                res.send('Invalid username');
                return console.error('Invalid username');
            }
            // CASE2:valid user+wrong pwd
            else if (result.rows[0].processed_password != processed_pwd) {
                res.send('Invalid password');
                return console.error('Invalid password');
            }
            userid = result.rows[0].user_id;
            //Todo: Check user id at token table or not, if yes, delete the record
            var query = sql.select().from('token').where({user_id: userid}).toParams();
            client.query(query, function (err, result) {
                //call `done()` to release the client back to the pool
                done();

                if (err) {
                    return console.error('error running query', err);
                }

                if (result)
                    var query = sql.delete().from('token').where('user_id', userid).toParams();
                client.query(query, function (err, result) {
                    done();

                    if (err) {
                        return console.error('error running query', err);
                    }
                    //Todo: gen token
                    //Todo: gen device id
                    //Todo: gen expiry timestamp
                    //Todo: save into db
                    res.send('delete');
                });


                //output: 1
            });
            //res.send(user_id);
            //res.send(result.rows[0]); //server RETURN data to frontend
            //output: 1
        });


        //var token;
        //crypto.randomBytes(255, function (ex, buf) {
        //    token = buf.toString('hex');
        //    var tokenquery = sql.insertInto('token', 'user_id', 'token').values(user_id, token).toParams();
        //    client.query(tokenquery, function (err, result) {
        //        //call `done()` to release the client back to the pool
        //        done();
        //
        //        if (err) {
        //            return console.error('error running query', err);
        //        }
        //        res.send('done');
        //        res.send(result.rows[0]); //server RETURN data to frontend
        //        output: 1
        //    });
        //});
    });

});

// Log out-> frontend send the token back, delete
/* GET search */
//router.get('/log_in/', function(req, res) {
//    //Turn all these into MySQL command to do the searching
//    var user_email = req.query.user_email;
//    var password = req.query.password
//    //TODO transform the password into processed password
//
//        pg.connect(conString, function (err, client, done) {
//            if (err) {
//                res.send('error fetching client from pool');
//                return console.error('error fetching client from pool', err);
//            }
//
//            var query = sql.select().from('user').where({user_email: user_email}).toString();
//            client.query(query, function (err, result) {
//                done();  //call `done()` to release the client back to the pool
//                if (err) {
//                    res.send('error running query');
//                    return console.error('error running query', err);
//                }
//                if(result.rows[0].password!=password)
//                {res.send("wrong password");}
//
//                require('crypto').randomBytes(255, function(ex, buf) {
//                    var token = buf.toString('hex');
//                    pg.connect(conString, function (err, client, done) {
//                        if (err) {
//                            res.send('error fetching client from pool');
//                            return console.error('error fetching client from pool', err);
//                        }
//
//                        var query = sql.insert('token', {'token': token, 'user_email': user_email});
//                        client.query(query, function (err, result) {
//                            done();  //call `done()` to release the client back to the pool
//                            if (err) {
//                                res.send('error running query');
//                                return console.error('error running query', err);
//                            }
//
//                            res.send("return token successfully");
//
//                        });
//                    });
//                });
//            });
//    });
//});
/**
 * TODO return a list of currently online users
 */
router.get('/token/', function (req, res) {
    require('crypto').randomBytes(255, function (ex, buf) {
        var token = buf.toString('hex');
        console.log(token);
        res.send(token);
        pg.connect(db.url(), function (err, client, done) {
            if (err) {
                res.send('error fetching client from pool');
                return console.error('error fetching client from pool', err);
            }

            var query = sql.insert('token', {'token': token, 'user_email': 'Flintstone'});
            client.query(query, function (err, result) {
                done();  //call `done()` to release the client back to the pool
                if (err) {
                    res.send('error running query');
                    return console.error('error running query', err);
                }
                if (result.rows[0].password == password) {
                    res.send("same person");
                }

            });
        });
    });

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
 * TODO Login
 * */
router.get('/', function (req, res) {
    res.send('Dummy login successful');
});

//TODO add role

//TODO get role

//TODO update role

module.exports = router;