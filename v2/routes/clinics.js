/**
 * Created by RickyLo on 17/3/2016.
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
var clinics_table = 'v2.clinics';

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
    db.check_token_and_permission("clinics_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.clinics_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var clinic_id = req.query.id;
          if (clinic_id) {
            params.clinic_id = clinic_id;
          }
          var country_id =req.query.country_id;
          if (country_id) {
            params.country_id = country_id;
          }
          var is_active =req.query.is_active;
          if (is_active) {
            params.is_active = is_active;
          }
          var english_name =req.query.english_name;
          if (english_name) {
            params.english_name = english_name;
          }
          var native_name =req.query.native_name;
          if (native_name) {
            params.native_name = native_name;
          }
          var latitude =req.query.latitude;
          if (latitude) {
            params.latitude = latitude;
          }
          var longitude =req.query.longitude;
          if (longitude) {
            params.longitude = longitude;
          }
          var create_timestamp =req.query.create_timestamp;
          if (create_timestamp) {
            params.create_timestamp = create_timestamp;
          }
          var remark =req.query.remark;
          if (remark) {
            params.remark = remark;
          }
          var is_global =req.query.is_global;
          if (is_global) {
            params.is_global = is_global;
          }
          var suitcase_id =req.query.suitcase_id;
          if (suitcase_id) {
            params.suitcase_id = suitcase_id;
          }
          console.log(params);

          var sql_query = sql
            .select()
            .from(clinics_table)
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
            sql_query.orderBy('clinic_id');
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
    db.check_token_and_permission("clinics_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.clinics_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var clinic_id = req.params.id;
          params.clinic_id = clinic_id;

          var sql_query = sql
            .select()
            .from(clinics_table)
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
            sql_query.orderBy('clinic_id');
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
    db.check_token_and_permission("clinics_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.clinics_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var clinic_id = body.clinic_id;
          if (clinic_id)
            params.clinic_id = clinic_id;
          else
            params.clinic_id = util.random_string(consts.id_random_string_length());

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;

          var is_active = body.is_active;
          if (is_active)
            params.is_active = is_active;
          else
            res.status(errors.bad_request()).send('active should be not null');

          var english_name = body.english_name;
          if (english_name)
            params.english_name = english_name;
          else
            res.status(errors.bad_request()).send('english_name should be not null');

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          var latitude = body.latitude;
          if (latitude)
            params.latitude = latitude;

          var longitude = body.longitude;
          if (longitude)
            params.longitude = longitude;

          var create_timestamp = moment();
          params.create_timestamp = create_timestamp;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var is_global = body.is_global;
          if (is_global)
            params.is_global = is_global;
          else
            res.status(errors.bad_request()).send('global should be not null');

          var suitcase_id = body.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;

          var sql_query = sql.insert(clinics_table, params).returning('*');
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
    db.check_token_and_permission("clinics_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_write === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.clinics_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var clinic_id = req.params.id;
          params.clinic_id = clinic_id;

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;

          var is_active = body.is_active;
          if (is_active)
            params.is_active = is_active;

          var english_name = body.english_name;
          if (english_name)
            params.english_name = english_name;

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          var latitude = body.latitude;
          if (latitude)
            params.latitude = latitude;

          var longitude = body.longitude;
          if (longitude)
            params.longitude = longitude;

          var create_timestamp = body.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var is_global = body.is_global;
          if (is_global)
            params.is_global = is_global;

          var suitcase_id = body.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;

          var sql_query = sql
            .update(clinics_table, params)
            .where(sql('clinic_id'), clinic_id).returning('*');
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