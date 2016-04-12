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

/* POST */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
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
      } else{
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
                        res.status(errors.server_error()).send('Something wrong (error code 10004)');
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
                    res.status(errors.server_error()).send('Something wrong (error code 10004)');
                  }
                } else if (return_value) {
                  responseJson.insert_access_token = return_value;
                  login_logic.insert_refresh_token(refresh_token, device_id, user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send('Something wrong (error code 10004)');
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

module.exports = router;