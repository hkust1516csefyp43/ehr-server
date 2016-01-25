/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../errors');
var valid = require('../valid');
var db = require('../database');
var sql = require('sql-bricks-postgres');

/**
 * DONE? Login + renew access token
 * TODO check if device id is blocked
 */
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
  console.log("The sql text: " + sql_query.toParams().text);
  console.log("The sql vars: " + sql_query.toParams().values);

  pg.connect(db.url(), function (err, client, done) {
    if (err) {
      sent = true;
      res.status(errors.bad_request()).send("error 1");
    } else
      client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
        if (err) {
          sent = true;
          res.status(errors.bad_request()).send("error 2");
        } else {
          switch (result.rows.length) {
            case 0:
              sent = true;
              res.status(errors.bad_request()).send("Email does not exist");
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
                    res.status(errors.bad_request()).send("error 3");
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
                    //update last seen
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
              res.status(errors.bad_request()).send("Something wrong with the email (bug)");
          }
        }
      });
  });
});

/**
 * TODO basic auth
 * GET user with id
 * */
router.get('/:id', function (req, res) {
  res.send('user id = ' + req.params.id);
});


/**
 * TODO return a list of currently online users
 */
router.get('/token/', function (req, res) {
});

/**
 * TODO update user by id
 */
router.put('/:id', function (req, res) {
  //Destroy cache?
});

/**
 * TODO create user
 */
router.post('/', function (req, res) {
  //Destroy cache?
});

/**
 * TODO update user by id
 */
router.delete('/:id', function (req, res) {
  //Destroy cache?
});

//TODO get a list of tokens
router.get('/token/', function (req, res) {

});

//TODO get a token by id
router.get('/token/:id', function (req, res) {

});

//NO API for POST and PUT token (because they make no sense)

/**
 * TODO revoke token
 * i.e. logout
 */
router.delete('/token/:id', function (req, res) {
  res.send("In progress");
  //Get id
  //get token
  //get device id
  //Destroy token permission cache
});


//TODO add role

//TODO get roles
router.get('/roles/', function (req, res) {
  var param_query = req.query;
  //get token from header

});

//TODO get a role

//TODO update role
//Destroy token permission cache

//TODO delete role
//Destroy token permission cache

module.exports = router;