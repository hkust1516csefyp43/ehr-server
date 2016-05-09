/**
 * Created by Louis on 16/3/2016.
 * No GET and PUT:id
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var sql = require('sql-bricks-postgres');

var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');

var permission_read = 'comments_read';
var permission_write = 'comments_write';
var this_table = consts.table_comments();
var this_pk = 'comment_id';

/**
 * Get all comments of a visit
 */
router.get('/:vid', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_read, token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value[permission_read] === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value[permission_read] === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var params = {};
          params.visit_id = req.params.vid;

          var sql_query = sql
            .select()
            .from(this_table)
            .where(params)
            .orderBy('create_timestamp');

          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 0) {
                  sent = true;
                  res.status(errors.not_found()).send('Cannot find comments according to this visit id.');
                } else {
                  q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send("Something wrong (error code 10028)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows);
                }
              }
            });
          }
        }
      }
    });
  }
});

router.post('/:vid', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  console.log(JSON.stringify(req.body));
  if (valid.empty_object(req.body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot input nothing');
  } else {
    if (!token) {
      res.status(errors.token_missing()).send('Token is missing');
      sent = true;
    } else {
      db.check_token_and_permission(permission_write, token, function (err, return_value, client) {
        if (!return_value) {
          sent = true;
          res.status(errors.bad_request()).send('Token missing or invalid');
        } else if (return_value[permission_write] === false) {
          sent = true;
          res.status(errors.no_permission()).send('No permission');
        } else if (return_value[permission_write] === true) {
          if (return_value.expiry_timestamp < Date.now()) {
            sent = true;
            res.status(errors.access_token_expired()).send('Access token expired');
          } else {
            var params = {};
            params[this_pk] = util.random_string(consts.id_random_string_length());
            params.create_timestamp = moment();
            params.user_id = return_value.user_id;
            params.visit_id = req.params.vid;

            var comment = req.body.comment;
            if (comment) {
              params.comment = comment;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('comment cannot be null');
            }

            var sql_query = sql.insert(this_table, params).returning('*');
            console.log("The whole query in string: " + sql_query.toString());

            if (!sent) {
              client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                if (err) {
                  res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                  sent = true;
                  return console.error('error fetching client from pool', err);
                } else {
                  if (result.rows.length === 1) {
                    q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                      if (err) {
                        if (!sent) {
                          sent = true;
                          res.status(errors.server_error()).send("Something wrong (error code 10029)");
                        }
                      }
                    });
                    sent = true;
                    res.json(result.rows[0]);
                  } else if (result.rows.length === 0) {
                    sent = true;
                    res.status(errors.not_found()).send('Insertion failed');
                  } else {
                    sent = true;
                    res.status(errors.server_error()).send('Sth weird is happening');
                  }
                }
              });
            }
          }
        }
      });
    }
  }
});

router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_write, token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value[permission_write] === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value[permission_write] === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(this_table).where(sql(this_pk), req.params.id).returning('*');
          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send("Something wrong (error code 10030)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find comment according to this id.');
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