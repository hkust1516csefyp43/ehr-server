/**
 * Created by RickyLo on 28/3/2016.
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
    db.check_token_and_permission("triages_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.triages_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.triages_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var sql_query = sql
            .select()
            .from(consts.table_triages())
            .where(params);

          var visit_id = req.query.visit_id;
          if (visit_id)
            params.visit_id = visit_id;

          var user_id = req.query.user_id;
          if (user_id)
            params.user_id = user_id;

          var systolic = req.query.systolic;
          if (systolic)
            params.systolic = systolic;

          var diastolic = req.query.diastolic;
          if (diastolic)
            params.diastolic = diastolic;

          var heart_rate = req.query.heart_rate;
          if (heart_rate)
            params.heart_rate = heart_rate;

          var respiratory_rate = req.query.respiratory_rate;
          if (respiratory_rate)
            params.respiratory_rate = respiratory_rate;

          var weight = req.query.weight;
          if (weight)
            params.weight = weight;

          var height = req.query.height;
          if (height)
            params.height = height;

          var temperature = req.query.temperature;
          if (temperature)
            params.temperature = temperature;

          var spo2 = req.query.spo2;
          if (spo2)
            params.spo2 = spo2;

          var last_deworming_tablet = req.query.last_deworming_tablet;
          if (last_deworming_tablet)
            params.last_deworming_tablet = last_deworming_tablet;

          var chief_complains = req.query.chief_complains;
          if (chief_complains)
            params.chief_complains = chief_complains;

          var remark = req.query.remark;
          if (remark)
            sql_query.where(sql.ilike(consts.table_relationships(), util.pre_suf_percent(remark)));

          var start_timestamp = req.query.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;

          var end_timestamp = req.query.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;

          var edited_in_consultation = req.query.edited_in_consultation;
          if (edited_in_consultation)
            params.edited_in_consultation = edited_in_consultation;

          var head_circumference = req.query.head_circumference;
          if (head_circumference)
            params.head_circumference = head_circumference;

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('triage_id');
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
    db.check_token_and_permission("triages_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.triages_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.triages_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.user_id = return_value.user_id;
          params.triage_id = util.random_string(consts.id_random_string_length());

          var visit_id = body.visit_id;
          if (visit_id)
            params.visit_id = visit_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('visit_id should be not null');
          }

          var systolic = body.systolic;
          if (systolic)
            params.systolic = systolic;

          var diastolic = body.diastolic;
          if (diastolic)
            params.diastolic = diastolic;

          var heart_rate = body.heart_rate;
          if (heart_rate)
            params.heart_rate = heart_rate;

          var respiratory_rate = body.respiratory_rate;
          if (respiratory_rate)
            params.respiratory_rate = respiratory_rate;

          var weight = body.weight;
          if (weight)
            params.weight = weight;

          var height = body.height;
          if (height)
            params.height = height;

          var temperature = body.temperature;
          if (temperature)
            params.temperature = temperature;

          var spo2 = body.spo2;
          if (spo2)
            params.spo2 = spo2;

          var last_deworming_tablet = body.last_deworming_tablet;
          if (last_deworming_tablet)
            params.last_deworming_tablet = last_deworming_tablet;

          var chief_complains = body.chief_complains;
          if (chief_complains)
            params.chief_complains = chief_complains;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var start_timestamp = body.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('start_timestamp should be not null');
          }

          var end_timestamp = body.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('start_timestamp should be not null');
          }

          var head_circumference = body.head_circumference;
          if (head_circumference)
            params.head_circumference = head_circumference;


          var sql_query = sql.insert(consts.table_triages(), params).returning('*');
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
    db.check_token_and_permission("triages_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.triages_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.triages_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          var visit_id = body.visit_id;
          if (visit_id)
            params.visit_id = visit_id;

          var user_id = body.user_id;
          if (user_id)
            params.user_id = user_id;

          var systolic = body.systolic;
          if (systolic)
            params.systolic = systolic;

          var diastolic = body.diastolic;
          if (diastolic)
            params.diastolic = diastolic;

          var heart_rate = body.heart_rate;
          if (heart_rate)
            params.heart_rate = heart_rate;

          var respiratory_rate = body.respiratory_rate;
          if (respiratory_rate)
            params.respiratory_rate = respiratory_rate;

          var weight = body.weight;
          if (weight)
            params.weight = weight;

          var height = body.height;
          if (height)
            params.height = height;

          var temperature = body.temperature;
          if (temperature)
            params.temperature = temperature;

          var spo2 = body.spo2;
          if (spo2)
            params.spo2 = spo2;

          var last_deworming_tablet = body.last_deworming_tablet;
          if (last_deworming_tablet)
            params.last_deworming_tablet = last_deworming_tablet;

          var chief_complains = body.chief_complains;
          if (chief_complains)
            params.chief_complains = chief_complains;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var start_timestamp = body.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;

          var end_timestamp = body.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;

          var edited_in_consultation = body.edited_in_consultation;
          if (edited_in_consultation)
            params.edited_in_consultation = edited_in_consultation;

          var head_circumference = body.head_circumference;
          if (head_circumference)
            params.head_circumference = head_circumference;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_triages(), params)
            .where(sql('triage_id'), req.params.id)
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
                  res.status(errors.not_found()).send('Cannot find triage according to this id.');
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
    db.check_token_and_permission("triages_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.triages_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.triages_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_triages()).where(sql('triage_id'), req.params.id).returning('*');
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
                  res.status(errors.not_found()).send('Cannot find triage according to this id.');
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