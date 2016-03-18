/**
 * Created by RickyLo on 16/3/2016.
 */
var express = require('express');
var router = express.Router();
var ba = require('basic-auth');
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
var blocked_devices_table = 'v2.blocked_devices';

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
    db.check_token_and_permission("blocked_devices_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blocked_devices_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blocked_devices_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var blocked_device_id = req.query.id;
          if (blocked_device_id) {
            params.blocked_device_id = blocked_device_id;
          }
          var remark =req.query.remark;
          if (remark) {
            params.remark = remark;
          }
          var expiry_timestamp =req.query.expiry_timestamp;
          if (expiry_timestamp) {
            params.expiry_timestamp = expiry_timestamp;
          }
          var reporter_id =req.query.reporter_id;
          if (reporter_id) {
            params.reporter_id = reporter_id;
          }
          var victim_id =req.query.victim_id;
          if (victim_id) {
            params.victim_id = victim_id;
          }
          var create_timestamp =req.query.create_timestamp;
          if (create_timestamp) {
            params.create_timestamp = create_timestamp;
          }
          console.log(params);

          var sql_query = sql
            .select()
            .from(blocked_devices_table)
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
            sql_query.orderBy('blocked_device_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(100);
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (sent === false) {
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
    db.check_token_and_permission("blocked_devices_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blocked_devices_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blocked_devices_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.blocked_device_id = req.params.id;

          var sql_query = sql
            .select()
            .from(blocked_devices_table)
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
            sql_query.orderBy('blocked_device_id');
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
    db.check_token_and_permission("blocked_devices_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blocked_devices_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blocked_devices_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var blocked_device_id = body.blocked_device_id;
          if (blocked_device_id)
            params.blocked_device_id = blocked_device_id;
          else
            params.blocked_device_id = util.random_string(consts.id_random_string_length());

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var expiry_timestamp= body.expiry_timestamp;
          if (expiry_timestamp)
            params.expiry_timestamp = expiry_timestamp;

          var reporter_id = body.reporter_id;
          if (reporter_id)
            params.reporter_id = reporter_id;
          else
            res.status(errors.bad_request()).send('reporter_id should be not null');

          var victim_id = body.victim_id;
          if (victim_id)
            params.victim_id = victim_id;
          else
            res.status(errors.bad_request()).send('victim_id should be not null');

          params.create_timestamp = moment();


          var sql_query = sql.insert(blocked_devices_table, params).returning('*');
          console.log(sql_query.toString());
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
    db.check_token_and_permission("blocked_devices_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.blocked_devices_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.blocked_devices_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var blocked_device_id = req.params.id;
          params.blocked_device_id = blocked_device_id;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var expiry_timestamp= body.expiry_timestamp;
          if (expiry_timestamp)
            params.expiry_timestamp = expiry_timestamp;

          var reporter_id = body.reporter_id;
          if (reporter_id)
            params.reporter_id = reporter_id;

          var victim_id = body.victim_id;
          if (victim_id)
            params.victim_id = victim_id;

          var create_timestamp = body.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var sql_query = sql
            .update(blocked_devices_table, params)
            .where(sql('blocked_device_id'), blocked_device_id).returning('*');
          console.log(sql_query.toString());
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
    });
  }
});

module.exports = router;