/**
 * Created by RickyLo on 3/4/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var wait = require('wait.for');

var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var login_logic = require('../login_logic');
var q = require('../query');
var sql = require('sql-bricks-postgres');

/**
 * 1) login with username + password + device_id
 * 2) use refresh token + device_id to get new access token
 */
router.post('/', function (req, res) {
  var sent = false;
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  var responseJson = { };
  if (token) {
    login_logic.return_token_info(token, function (err, return_value, client) {
      if (return_value.expiry_timestamp < Date.now()) {
        res.status(errors.access_token_expired()).send('Access token expired');
      } else {
        var user_id = return_value.user_id;
        if (err) {
          sent = true;
          res.status(errors.server_error()).send('Something wrong (error code 10000)');
        } else if (return_value) {
          responseJson.token_info = return_value;
          if (return_value.is_access_token === true){
            sent = true;
            res.json(responseJson);
          }
          else if (return_value.is_access_token === false){

            var device_id = body.device_id;
            if (!device_id && !sent) {
              sent = true;
              res.status(errors.bad_request()).send('device_id should be not null');
            }

            var access_token = util.random_string(consts.id_random_string_length());

            login_logic.update_access_token(access_token, device_id, function (err, return_value, client) {
              if (return_value) {
                responseJson.update_access_token = return_value;
                sent = true;
                res.json(responseJson);
              } else {
                login_logic.insert_access_token(access_token, device_id, user_id, function (err, return_value, client) {
                  if (return_value) {
                    responseJson.insert_access_token = return_value;
                    sent = true;
                    res.json(responseJson);
                  }
                });
              }
            });
          }
        } else if (!sent) {                                        //return value == null >> sth wrong
          sent = true;
          res.status(errors.bad_request()).send('Token invalid');
        }
      }
    });
  } else if (!token) {      //i.e. login with username & password
    var username = body.username;
    if (!username && !sent) {
      sent = true;
      res.status(errors.bad_request()).send('username should be not null');
    }
    var password = body.password;
    if (!password && !sent) {
      sent = true;
      res.status(errors.bad_request()).send('password should be not null');
    }
    var device_id = body.device_id;
    if (!device_id && !sent) {
      sent = true;
      res.status(errors.bad_request()).send('device_id should be not null');
    }

    login_logic.return_user_info(username, function (err, return_value, client) {
      if (err) {
        if (!sent) {
          sent = true;
          res.status(errors.server_error()).send('Something wrong (error code 10001)');
        }
      }
      if (!return_value) {
        if (!sent) {
          sent = true;
          res.status(errors.bad_request()).send('username missing or invalid');
        }
      } else {
        var user_id = return_value.user_id;
        //TODO: implement password to processed_password
        password = password;
        if (return_value.processed_password !== password && !sent) {
          sent = true;
          res.status(errors.bad_request()).send('password missing or invalid');
        }
        else if (return_value.processed_password === password) {
          var access_token = util.random_string(consts.id_random_string_length());
          var refresh_token = util.random_string(consts.id_random_string_length());
          login_logic.update_access_token(access_token, device_id, function (err, return_value, client) {
            if (err) {
              if (!sent) {
                sent = true;
                res.status(errors.server_error()).send('Something wrong (error code 10002)');
              }
            } else if (return_value) {
              responseJson.update_access_token = return_value;
              login_logic.update_refresh_token(refresh_token, device_id, function (err, return_value, client) {
                if (err) {
                  if (!sent) {
                    sent = true;
                    res.status(errors.server_error()).send('Something wrong (error code 10003)');
                  }
                }
                if (return_value) {
                  responseJson.update_refresh_token = return_value;
                  sent = true;
                  res.json(responseJson);
                } else {
                  login_logic.insert_refresh_token(refresh_token, device_id, user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send('Something wrong (error code 10079)');
                      }
                    } else if (return_value) {
                      responseJson.insert_refresh_token = return_value;
                      sent = true;
                      res.json(responseJson);
                    }
                  });
                }
              });
            } else {
              login_logic.insert_access_token(access_token, device_id, user_id, function (err, return_value, client) {
                if (err) {
                  if (!sent) {
                    sent = true;
                    res.status(errors.server_error()).send('Something wrong (error code 10080)');
                  }
                } else if (return_value) {
                  responseJson.insert_access_token = return_value;
                  login_logic.insert_refresh_token(refresh_token, device_id, user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send('Something wrong (error code 10081)');
                      }
                    } else if (return_value) {
                      responseJson.insert_refresh_token = return_value;
                      sent = true;
                      res.json(responseJson);
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }
});

/**
 * Get new access token with refresh token + device_id
 */
router.put('/rd/:refresh_token', function (req, res) {
  var sent = false;
  var refresh_token = req.params.refresh_token;
  var device_id = req.body.device_id;
  if (!refresh_token) {

  } else if (!device_id) {

  } else {
    
  }
  /*
   1. get refresh_token & device_id (return 4XX if any of them is missing)
   2. check if device_id is not blocked
   2. check if refresh token is valid (not access token, not expired)
   */
});

/**
 * Get refresh token & access token with username, password and device_id
 */
router.get('/upd/', function (req, res) {
  var username = req.query.username;
  if (!username) {
    res.status(errors.bad_request()).send('username missing');
  } else {
    var password = req.query.passowrd;
    if (!password) {
      res.status(errors.bad_request()).send('password missing');
    } else {
      var device_id = req.query.device_id;
      if (!device_id) {
        res.status(errors.bad_request()).send('device_id missing');
      } else {
        db.is_this_device_blocked(device_id, function (err, result, client) {
          if (err) {
            res.status(errors.device_id_blocked()).send('BLOCKED');
          } else {
            var sql_query_1 = sql
              .select('*')
              .from(consts.table_users())
              .where('username', username);
            if (client) {
              client.query(sql_query_1.toParams().text, sql_query_1.toParams().values, function (err, result) {
                if (err) {
                  res.status(errors.server_error()).send('Some kind of error (error code 10005');
                } else if (!result) {
                  res.status(errors.server_error()).send('Some kind of error (error code 10006)');
                } else if (!result.rows) {
                  res.status(errors.server_error()).send('Some kind of error (error code 10007)');
                } else if (result.rows.length > 1) {
                  res.status(errors.server_error()).send('Some kind of error (error code 10008)');
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('username does not exists');
                } else {

                }
              });
            }
          }
        });
        /*
         [DONE] 1. get username & password & device id (return 4XX if any of them is missing)
         [DONE] 2. check if device_id has been blocked
         [DONE] 3. check if username exists
         4. check if sha256(password + salt) match the processed_password
         5. upsert token table (https://blog.heroku.com/archives/2016/1/7/postgres-95-now-available-on-heroku)
         */
      }
    }
  }
});

module.exports = router;