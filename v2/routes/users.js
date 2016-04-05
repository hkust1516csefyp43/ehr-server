/**
 * Created by RickyLo on 31/3/2016.
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

/* GET list */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("users_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.users_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.users_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var sql_query = sql
            .select()
            .from(consts.table_users())
            .where(params);

          var gender_id = req.query.gender_id;
          if (gender_id)
            params.gender_id = gender_id;

          var role_id = req.query.role_id;
          if (role_id)
            params.role_id = role_id;

          var honorific = req.query.honorific;
          if (honorific)
            params.honorific = honorific;

          var first_name = req.query.first_name;
          if (first_name)
            params.first_name = first_name;

          var middle_name = req.query.middle_name;
          if (middle_name)
            params.middle_name = middle_name;

          var last_name = req.query.last_name;
          if (last_name)
            params.last_name = last_name;
          var nickname = req.query.nickname;
          if (nickname)
            params.nickname = nickname;

          var username = req.query.username;
          if (username)
            params.username = username;

          var email = req.query.email;
          if (email)
            params.email = email;

          var salt = req.query.salt;
          if (salt)
            params.salt = salt;

          var processed_password = req.query.processed_password;
          if (processed_password)
            params.processed_password = processed_password;

          var birth_year = req.query.birth_year;
          if (birth_year)
            params.birth_year = birth_year;

          var birth_month = req.query.birth_month;
          if (birth_month)
            params.birth_month = birth_month;

          var birth_day = req.query.birth_day;
          if (birth_day)
            params.birth_day = birth_day;

          var create_timestamp = req.query.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var image_id = req.query.image_id;
          if (image_id)
            params.image_id = image_id;

          var phone_country_code = req.query.phone_country_code;
          if (phone_country_code)
            params.phone_country_code = phone_country_code;

          var phone_number = req.query.phone_number;
          if (phone_number)
            params.phone_number = phone_number;

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('user_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                q.save_sql_query(sql_query.toString());
                res.json(result.rows);
              }
            });
          }
        }
      }
    });
  }
});

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
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("users_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.users_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.users_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.create_timestamp = moment();
          params.user_id = util.random_string(consts.id_random_string_length());

          var gender_id = body.gender_id;
          if (gender_id)
            params.gender_id = gender_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('gender_id should be not null');
          }

          var role_id = body.role_id;
          if (role_id)
            params.role_id = role_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('role_id should be not null');
          }

          var honorific = body.honorific;
          if (honorific)
            params.honorific = honorific;

          var first_name = body.first_name;
          if (first_name)
            params.first_name = first_name;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('first_name should be not null');
          }

          var middle_name = body.middle_name;
          if (middle_name)
            params.middle_name = middle_name;

          var last_name = body.last_name;
          if (last_name)
            params.last_name = last_name;

          var nickname = body.nickname;
          if (nickname)
            params.nickname = nickname;

          //TODO: check whether user_name is unique
          var username = body.username;
          if (username)
            params.username = username;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('user_name should be not null');
          }

          login_logic.return_user_info(username, function (err, return_value, client) {
            if (return_value) {
              sent = true;
              res.status(errors.bad_request()).send('username should be unique');
            }else{

              var email = body.email;
              if (email)
                params.email = email;

              var salt = body.salt;
              if (salt)
                params.salt = salt;
              else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('salt should be not null');
              }

              //TODO: automatically update the processed password
              var processed_password = body.processed_password;
              if (processed_password)
                params.processed_password = processed_password;
              else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('processed_password should be not null');
              }

              var birth_year = body.birth_year;
              if (birth_year)
                params.birth_year = birth_year;

              var birth_month = body.birth_month;
              if (birth_month)
                params.birth_month = birth_month;

              var birth_day = body.birth_day;
              if (birth_day)
                params.birth_day = birth_day;

              var image_id = body.image_id;
              if (image_id)
                params.image_id = image_id;

              var phone_country_code = body.phone_country_code;
              if (phone_country_code)
                params.phone_country_code = phone_country_code;

              var phone_number = body.phone_number;
              if (phone_number)
                params.phone_number = phone_number;

              var sql_query = sql.insert(consts.table_users(), params).returning('*');
              console.log(sql_query.toString());

              if (!sent)
                client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                  if (err) {
                    res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                    sent = true;
                    return console.error('error fetching client from pool', err);
                  } else {
                    if (result.rows.length === 1) {
                      q.save_sql_query(sql_query.toString());
                      sent = true;
                      res.json(result.rows[0]);
                    } else if (result.rows.length === 0) {
                      res.status(errors.not_found()).send('Insertion failed');
                    } else {
                      //how can 1 pk return more than 1 row!?
                      res.status(errors.server_error()).send('Sth weird is happening');
                    }
                  }
                });

            }
          });
        }
      }
    });
  }
});

/*PUT*/
router.put('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("users_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.users_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.users_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          login_logic.insert_refresh_token(refresh_token, device_id, user_id, function (err, return_value, client) {
            if (return_value) {
              responseJson.insert_refresh_token = return_value;
              sent = true;
              res.json(responseJson);
            }
          });

          var gender_id = body.gender_id;
          if (gender_id)
            params.gender_id = gender_id;

          var role_id = body.role_id;
          if (role_id)
            params.role_id = role_id;

          var honorific = body.honorific;
          if (honorific)
            params.honorific = honorific;

          var first_name = body.first_name;
          if (first_name)
            params.first_name = first_name;

          var middle_name = body.middle_name;
          if (middle_name)
            params.middle_name = middle_name;

          var last_name = body.last_name;
          if (last_name)
            params.last_name = last_name;

          var nickname = body.nickname;
          if (nickname)
            params.nickname = nickname;

          var username = body.username;
          if (username)
            params.username = username;

          var email = body.email;
          if (email)
            params.email = email;

          var salt = body.salt;
          if (salt)
            params.salt = salt;

          var processed_password = body.processed_password;
          if (processed_password)
            params.processed_password = processed_password;

          var birth_year = body.birth_year;
          if (birth_year)
            params.birth_year = birth_year;

          var birth_month = body.birth_month;
          if (birth_month)
            params.birth_month = birth_month;

          var birth_day = body.birth_day;
          if (birth_day)
            params.birth_day = birth_day;

          var image_id = body.image_id;
          if (image_id)
            params.image_id = image_id;

          var phone_country_code = body.phone_country_code;
          if (phone_country_code)
            params.phone_country_code = phone_country_code;

          var phone_number = body.phone_number;
          if (phone_number)
            params.phone_number = phone_number;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_users(), params)
            .where(sql('user_id'), req.params.id)
            .returning('*');

          console.log(sql_query.toString());
          if (!sent)
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find user according to this id.');
                } else {
                  //how can 1 pk return more than 1 row!?
                  res.status(errors.server_error()).send('Sth weird is happening');
                }
              }
            });
        }
      }
    });
  }
});

router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("users_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.users_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.users_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_users()).where(sql('user_id'), req.params.id).returning('*');
          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find user according to this id.');
                } else {
                  //how can 1 pk return more than 1 row!?
                  res.status(errors.server_error()).send('Sth weird is happening');
                }
              }
            });
          }
        }
      }
    });
  }

});

module.exports = router;