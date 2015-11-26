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

//[JOHN] TODO Login + renew access token
router.get('/', function (req, res) {
    var user = req.query.email;
    var pwd = req.query.password;
    var device_id = req.query.device_id;
    var sent = false;

    var sql_query = sql
        .select('user_id')
        .select('email')
        .select('salt')
        .select('processed_password')
        .from('users')
        .where(sql('email'), user);

    console.log("The whole SQL query: " + sql_query.toString());
    console.log("The whole SQL query: " + sql_query.toParams().text);
    console.log("The whole SQL query: " + sql_query.toParams().values);

    pg.connect(db.url(), function (err, client, done) {
        if (err) {
            sent = true;
            res.status(400).send("error 1");
        } else
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                if (err) {
                    sent = true;
                    res.status(400).send("error 2");
                } else {
                    switch (result.rows.length) {
                        case 0:
                            sent = true;
                            res.status(400).send("Email does not exist");
                            break;
                        case 1:
                            var user_id = result.rows[0].user_id;
                            //combine pwd and salt
                            //hash it
                            //compare it with processed_password

                            //Assume password is correct

                            var sql_query2 = sql
                                .select()
                                .from('token')
                                .where(sql('device_id'), device_id)
                                .where(sql('access_token'), true);

                            console.log("result: " + JSON.stringify(result.rows[0]));
                            console.log("The whole SQL query 2: " + sql_query2.toString());

                            client.query(sql_query2.toParams().text, sql_query2.toParams().values, function (err, result) {
                                if (err) {
                                    if (!sent) {
                                        sent = true;
                                        res.status(400).send("error 3");
                                    }
                                } else {
                                    console.log("token result: " + JSON.stringify(result.rows));

                                    var sql_query3 = sql;
                                    var params = {};
                                    params.token = util.random_string(255);
                                    params.expiry_timestamp = '2015-11-26 03:53:30.216636+00';
                                    params.access_token = true;
                                    params.user_id = user_id;

                                    switch (result.rows.length) {
                                        case 0: //device_id does not exist yet
                                            params.device_id = device_id;

                                            sql_query3 = sql_query3.insert('token', params);
                                            console.log("sql q3: " + sql_query3.toString());

                                            client.query(sql_query3.toParams().text, sql_query3.toParams().values, function (err, result) {
                                                if (err) {
                                                    res.send("errorrrrr");
                                                } else {
                                                    res.send("token saved");
                                                }
                                            });
                                            break;
                                        case 1: //device_id already exist
                                            sql_query3 = sql_query3.update('token', params).where(sql('device_id'), device_id);

                                            client.query(sql_query3.toParams().text, sql_query3.toParams().values, function (err, result) {
                                                if (err) {
                                                    res.send("errorrrrr");
                                                } else {
                                                    res.send("token updated");
                                                }
                                            });

                                            break;
                                        default:    //bugs

                                    }

                                }
                            });
                            break;
                        default:
                            sent = true;
                            res.status(400).send("Something wrong with the email (bug)");
                    }
                }
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

//TODO add role

//TODO get role

//TODO update role

module.exports = router;