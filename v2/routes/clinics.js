/**
 * Created by RickyLo on 17/3/2016.
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
var q = require('../query');
var sql = require('sql-bricks-postgres');
var clinics_table = 'v2.clinics';

/* GET list */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  var sql_query;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    sql_query = sql.select('clinic_id').select('english_name').from(consts.table_clinics()).where(sql('is_active'), sql('true')).orderBy('clinic_id');
    console.log("The whole query is " + sql_query.toString());
    pg.connect(db.url(), function (err, client, done) {
      if (err) {
        sent = true;
        res.status(errors.bad_request()).send('somethings wrong');
      } else {
        client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
          done();
          if (err) {
            sent = true;
            res.status(errors.bad_request()).send('somethings wrong:' + err);
          } else {
            sent = true;
            res.json(result.rows);
          }
        });
      }
    });
    sent = true;
  } else {
    db.check_token_and_permission("clinics_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
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

          sql_query = sql
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
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.clinics_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.clinic_id = req.params.id;

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
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find clinic according to this id.');
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
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.clinics_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          params.clinic_id = util.random_string(consts.id_random_string_length());

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;

          var is_active = body.is_active;
          if (is_active)
            params.is_active = is_active;
          else {
            sent = true;
            res.status(errors.bad_request()).send('is_active should be not null');
          }

          var english_name = body.english_name;
          if (english_name)
            params.english_name = english_name;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('english_name should be not null');
          }

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          var latitude = body.latitude;
          if (latitude)
            params.latitude = latitude;

          var longitude = body.longitude;
          if (longitude)
            params.longitude = longitude;

          params.create_timestamp = moment();

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var is_global = body.is_global;
          if (is_global)
            params.is_global = is_global;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('is_global should be not null');
          }

          var suitcase_id = body.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;

          if (!sent) {
            var sql_query = sql.insert(clinics_table, params).returning('*');
            console.log(sql_query.toString());
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
                  res.status(errors.not_found()).send('Insertion failure');
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

/**
 * edit clinic according to id
 */
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
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.clinics_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;

          var is_active = body.is_active;
          if (is_active) {
            if (valid.true_or_false(is_active))
              params.is_active = is_active;
            else {
              sent = true;
              res.status(errors.bad_request()).send('Invalid is_active. Please enter either "true" or "false"');
            }
          }

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

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var is_global = body.is_global;
          if (is_global) {
            if (valid.true_or_false(is_global))
              params.is_global = is_global;
            else {
              sent = true;
              res.status(errors.bad_request()).send('Invalid is_global. Please enter either "true" or "false"');
            }
          }

          var suitcase_id = body.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;

          if (valid.empty_object(params) && !sent) {
            sent = true;
            res.status(errors.bad_request()).send('You cannot edit nothing');
          }

          var sql_query = sql
            .update(clinics_table, params)
            .where(sql('clinic_id'), req.params.id).returning('*');
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
                  res.status(errors.not_found()).send('Cannot find clinic to edit according to this id.');
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

/**
 * Delete clinic
 */
router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission('clinics_write', token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.clinics_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.clinics_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var sql_query = sql.delete().from(consts.table_clinics()).where(sql('clinic_id'), req.params.id).returning('*');
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
                  res.status(errors.not_found()).send('Cannot find clinic according to this id to delete');
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