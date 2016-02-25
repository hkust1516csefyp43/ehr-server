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

//TODO get a role


//TODO get roles
router.get('/roles/', function (req, res) {
  var sent = false;
  var param_query = req.query;
  //get token from header

});

//TODO add role (need to be cont.)
router.post('/roles/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));
  console.log("The input body: " + JSON.stringify(body));
  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_role", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_role === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_role === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.role_id = util.random_string(consts.id_random_string_length());

          var name = body.name;
          if (name)
            params.name = name;
          else
            res.status(errors.bad_request()).send('name should be not null');

          var read_patient = body.read_patient;
          if (read_patient)
            params.read_patient = read_patient;
          else
            res.status(errors.bad_request()).send('read_patient should be not null');

          var read_patient = body.read_patient;
          if (read_patient)
            params.read_patient = read_patient;
          else
            res.status(errors.bad_request()).send('read_patient should be not null');

          var add_to_inventory = body.add_to_inventory;
          if (add_to_inventory)
            params.add_to_inventory = add_to_inventory;
          else
            res.status(errors.bad_request()).send('add_to_inventory should be not null');

          var add_slum = body.add_slum;
          if (add_slum)
            params.read_patient = add_slum;
          else
            res.status(errors.bad_request()).send('add_slum should be not null');

          var add_medication_method = body.add_medication_method;
          if (add_medication_method)
            params.add_medication_method = add_medication_method;
          else
            res.status(errors.bad_request()).send('add_medication_method should be not null');

          var add_comment = body.add_comment;
          if (add_comment)
            params.add_comment = add_comment;
          else
            res.status(errors.bad_request()).send('add_comment should be not null');

          var read_patient = body.read_patient;
          if (read_patient)
            params.read_patient = read_patient;
          else
            res.status(errors.bad_request()).send('read_patient should be not null');

          var read_patient = body.read_patient;
          if (read_patient)
            params.read_patient = read_patient;
          else
            res.status(errors.bad_request()).send('read_patient should be not null');


          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql.insert(patient_table, params);
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query.toString());
              res.json(result.rows);
            }
          });
        }
      }
    });
  }

});

//TODO update role
//Destroy token permission cache
router.put('/roles/', function (req, res) {
  var sent = false;
  var param_query = req.query;
  //get token from header

});

//TODO delete role
//Destroy token permission cache
router.delete('/roles/', function (req, res) {
  var sent = false;
  var param_query = req.query;
  //get token from header

});

module.exports = router;