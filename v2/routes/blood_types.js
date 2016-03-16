/**
 * Created by RickyLo on 12/3/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var wait = require('wait.for');

var util = require('../utils');
var errors = require('../errors');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');
var blood_types_table = 'v2.blood_types';

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
    db.check_token_and_permission("blood_types_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blood_types_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blood_types_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var blood_type_id = req.query.id;
          if (blood_type_id) {
            params.blood_type_id = blood_type_id;
          }
          var blood_type =req.query.blood_type;
          if (blood_type) {
            params.blood_type = blood_type;
          }
          console.log(params);

          var sql_query = sql
            .select()
            .from(blood_types_table)
            .where(params);

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('blood_type_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.send('error fetching client from pool');
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

/* GET */
router.get('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  console.log("id:",req.params.id);
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("blood_types_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blood_types_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blood_types_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var blood_type_id = req.params.id;
          params.blood_type_id = blood_type_id;

          var sql_query = sql
            .select()
            .from(blood_types_table)
            .where(params);

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var order_by = param_query.order_by;
          if (order_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(order_by);
          } else {
            sql_query.orderBy('blood_type_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          console.log("The whole query in string: " + sql_query.toString());
          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.send('error fetching client from pool');
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
    })
  }
});

/* POST */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("blood_types_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blood_types_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blood_types_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var blood_type_id = body.blood_type_id;
          if (blood_type_id)
            params.blood_type_id = blood_type_id;
          else
            params.blood_type_id = util.random_string(consts.id_random_string_length());

          var blood_type = body.blood_type;
          if (blood_type)
            params.blood_type = blood_type;
          else
            res.status(errors.bad_request()).send('blood_type should be not null');

          var sql_query = sql.insert(blood_types_table, params).returning('*');
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              q.save_sql_query(sql_query.toString());
              res.json(result.rows);
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
  var param_query = req.query;
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("blood_types_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blood_types_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blood_types_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var blood_type_id = req.params.id;
          params.blood_type_id = blood_type_id;

          var blood_type = body.blood_type;
          if (blood_type)
            params.blood_type = blood_type;

          var sql_query = sql
            .update(blood_types_table, params)
            .where(sql('blood_type_id'), blood_type_id).returning('*');
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              q.save_sql_query(sql_query.toString());
              res.json(result.rows);
            }
          });
        }
      }
    });
  }
});

module.exports = router;