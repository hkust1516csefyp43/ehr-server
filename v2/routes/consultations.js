/**
 * Created by RickyLo on 22/3/2016.
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

/**
 * TODO don't do this >> very easy to get everyone's medical history
 * GET list
 */
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
    db.check_token_and_permission("consultations_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.consultations_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.consultations_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var visit_id = req.query.visit_id;
          if (visit_id)
            params.visit_id = visit_id;

          var user_id = req.query.user_id;
          if (user_id)
            params.user_id = user_id;

          var start_timestamp = req.query.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;

          var end_timestamp = req.query.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;

          var ros_ga = req.query.ros_ga;
          if (ros_ga)
            params.ros_ga = ros_ga;

          var ros_respi = req.query.ros_respi;
          if (ros_respi)
            params.ros_respi = ros_respi;

          var ros_cardio = req.query.ros_cardio;
          if (ros_cardio)
            params.ros_cardio = ros_cardio;

          var ros_gastro = req.query.ros_gastro;
          if (ros_gastro)
            params.ros_gastro = ros_gastro;

          var ros_genital = req.query.ros_genital;
          if (ros_genital)
            params.ros_genital = ros_genital;

          var ros_ent = req.query.ros_ent;
          if (ros_ent)
            params.ros_ent = ros_ent;

          var ros_skin = req.query.ros_skin;
          if (ros_skin)
            params.ros_skin = ros_skin;

          var ros_other = req.query.ros_other;
          if (ros_other)
            params.ros_other = ros_other;

          var preg_lmp = req.query.preg_lmp;
          if (preg_lmp)
            params.preg_lmp = preg_lmp;

          var preg_curr_preg = req.query.preg_curr_preg;
          if (preg_curr_preg)
            params.preg_curr_preg = preg_curr_preg;

          var preg_gestration = req.query.preg_gestration;
          if (preg_gestration)
            params.preg_gestration = preg_gestration;

          var preg_breast_feeding = req.query.preg_breast_feeding;
          if (preg_breast_feeding)
            params.preg_breast_feeding = preg_breast_feeding;

          var preg_contraceptive = req.query.preg_contraceptive;
          if (preg_contraceptive)
            params.preg_contraceptive = preg_contraceptive;

          var preg_num_preg = req.query.preg_num_preg;
          if (preg_num_preg)
            params.preg_num_preg = preg_num_preg;

          var preg_num_live_birth = req.query.preg_num_live_birth;
          if (preg_num_live_birth)
            params.preg_num_live_birth = preg_num_live_birth;

          var preg_num_miscarriage = req.query.preg_num_miscarriage;
          if (preg_num_miscarriage)
            params.preg_num_miscarriage = preg_num_miscarriage;

          var preg_num_abortion = req.query.preg_num_abortion;
          if (preg_num_abortion)
            params.preg_num_abortion = preg_num_abortion;

          var preg_num_still_birth = req.query.preg_num_still_birth;
          if (preg_num_still_birth)
            params.preg_num_still_birth = preg_num_still_birth;

          var preg_remark = req.query.preg_remark;
          if (preg_remark)
            params.preg_remark = preg_remark;

          var pe_general = req.query.pe_general;
          if (pe_general)
            params.pe_general = pe_general;

          var pe_respiratory = req.query.pe_respiratory;
          if (pe_respiratory)
            params.pe_respiratory = pe_respiratory;

          var pe_cardio = req.query.pe_cardio;
          if (pe_cardio)
            params.pe_cardio = pe_cardio;

          var pe_gastro = req.query.pe_gastro;
          if (pe_gastro)
            params.pe_gastro = pe_gastro;

          var pe_genital = req.query.pe_genital;
          if (pe_genital)
            params.pe_genital = pe_genital;

          var pe_ent = req.query.pe_ent;
          if (pe_ent)
            params.pe_ent = pe_ent;

          var pe_skin = req.query.pe_skin;
          if (pe_skin)
            params.pe_skin = pe_skin;

          var pe_other = req.query.pe_other;
          if (pe_other)
            params.pe_other = pe_other;

          var rf_alertness = req.query.rf_alertness;
          if (rf_alertness)
            params.rf_alertness = rf_alertness;

          var rf_breathing = req.query.rf_breathing;
          if (rf_breathing)
            params.rf_breathing = rf_breathing;

          var rf_circulation = req.query.rf_circulation;
          if (rf_circulation)
            params.rf_circulation = rf_circulation;

          var rf_dehydration = req.query.rf_dehydration;
          if (rf_dehydration)
            params.rf_dehydration = rf_dehydration;

          var rf_defg = req.query.rf_defg;
          if (rf_defg)
            params.rf_defg = rf_defg;

          var diagnosis = req.query.diagnosis;
          if (diagnosis)
            params.diagnosis = diagnosis;

          var advice = req.query.advice;
          if (advice)
            params.advice = advice;

          var follow_up = req.query.follow_up;
          if (follow_up)
            params.follow_up = follow_up;

          var education = req.query.education;
          if (education)
            params.education = education;

          var remark = req.query.remark;
          if (remark)
            params.remark = remark;

          console.log(params);

          var sql_query = sql
            .select()
            .from(consts.table_consultations())
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
            sql_query.orderBy('consultation_id');
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
    db.check_token_and_permission("consultations_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.consultations_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.consultations_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.consultation_id = req.params.id;

          var sql_query = sql.select().from(consts.table_consultations()).where(params);

          console.log("The whole query in string: " + sql_query.toString());
          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find consultation according to this id.');
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
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("consultations_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.consultations_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.consultations_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.user_id = return_value.user_id;
          params.consultation_id = util.random_string(consts.id_random_string_length());

          var visit_id = body.visit_id;
          if (visit_id)
            params.visit_id = visit_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('visit_id should be not null');
          }

          var start_timestamp= body.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;

          var end_timestamp = body.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;

          var ros_ga = body.ros_ga;
          if (ros_ga)
            params.ros_ga = ros_ga;

          var ros_respi = body.ros_respi;
          if (ros_respi)
            params.ros_respi = ros_respi;

          var ros_cardio = body.ros_cardio;
          if (ros_cardio)
            params.ros_cardio = ros_cardio;

          var ros_gastro = body.ros_gastro;
          if (ros_gastro)
            params.ros_gastro = ros_gastro;

          var ros_genital = body.ros_genital;
          if (ros_genital)
            params.ros_genital = ros_genital;

          var ros_ent = body.ros_ent;
          if (ros_ent)
            params.ros_ent = ros_ent;

          var ros_skin = body.ros_skin;
          if (ros_skin)
            params.ros_skin = ros_skin;

          var ros_other = body.ros_other;
          if (ros_other)
            params.ros_other = ros_other;

          var preg_lmp = body.preg_lmp;
          if (preg_lmp)
            params.preg_lmp = preg_lmp;

          var preg_curr_preg = body.preg_curr_preg;
          if (preg_curr_preg)
            params.preg_curr_preg = preg_curr_preg;

          var preg_gestration = body.preg_gestration;
          if (preg_gestration)
            params.preg_gestration = preg_gestration;

          var preg_breast_feeding = body.preg_breast_feeding;
          if (preg_breast_feeding)
            params.preg_breast_feeding = preg_breast_feeding;

          var preg_contraceptive = body.preg_contraceptive;
          if (preg_contraceptive)
            params.preg_contraceptive = preg_contraceptive;

          var preg_num_preg = body.preg_num_preg;
          if (preg_num_preg)
            params.preg_num_preg = preg_num_preg;

          var preg_num_live_birth = body.preg_num_live_birth;
          if (preg_num_live_birth)
            params.preg_num_live_birth = preg_num_live_birth;

          var preg_num_miscarriage = body.preg_num_miscarriage;
          if (preg_num_miscarriage)
            params.preg_num_miscarriage = preg_num_miscarriage;

          var preg_num_abortion = body.preg_num_abortion;
          if (preg_num_abortion)
            params.preg_num_abortion = preg_num_abortion;

          var preg_num_still_birth = body.preg_num_still_birth;
          if (preg_num_still_birth)
            params.preg_num_still_birth = preg_num_still_birth;

          var preg_remark = body.preg_remark;
          if (preg_remark)
            params.preg_remark = preg_remark;

          var pe_general = body.pe_general;
          if (pe_general)
            params.pe_general = pe_general;

          var pe_respiratory = body.pe_respiratory;
          if (pe_respiratory)
            params.pe_respiratory = pe_respiratory;

          var pe_cardio = body.pe_cardio;
          if (pe_cardio)
            params.pe_cardio = pe_cardio;

          var pe_gastro = body.pe_gastro;
          if (pe_gastro)
            params.pe_gastro = pe_gastro;

          var pe_genital = body.pe_genital;
          if (pe_genital)
            params.pe_genital = pe_genital;

          var pe_ent = body.pe_ent;
          if (pe_ent)
            params.pe_ent = pe_ent;

          var pe_skin = body.pe_skin;
          if (pe_skin)
            params.pe_skin = pe_skin;

          var pe_other = body.pe_other;
          if (pe_other)
            params.pe_other = pe_other;

          var rf_alertness = body.rf_alertness;
          if (rf_alertness)
            params.rf_alertness = rf_alertness;

          var rf_breathing = body.rf_breathing;
          if (rf_breathing)
            params.rf_breathing = rf_breathing;

          var rf_circulation = body.rf_circulation;
          if (rf_circulation)
            params.rf_circulation = rf_circulation;

          var rf_dehydration = body.rf_dehydration;
          if (rf_dehydration)
            params.rf_dehydration = rf_dehydration;

          var rf_defg = body.rf_defg;
          if (rf_defg)
            params.rf_defg = rf_defg;

          var diagnosis = body.diagnosis;
          if (diagnosis)
            params.diagnosis = diagnosis;

          var advice = body.advice;
          if (advice)
            params.advice = advice;

          var follow_up = body.follow_up;
          if (follow_up)
            params.follow_up = follow_up;

          var education = body.education;
          if (education)
            params.education = education;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var sql_query = sql.insert(consts.table_consultations(), params).returning('*');
          console.log(sql_query.toString());

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
                      res.status(errors.server_error()).send("Something wrong (error code 10038)");
                    }
                  }
                });
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
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("consultations_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.consultations_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.consultations_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          var user_id = body.user_id;
          if (user_id)
            params.user_id = user_id;

          var visit_id = body.visit_id;
          if (visit_id)
            params.visit_id = visit_id;

          var start_timestamp = body.start_timestamp;
          if (start_timestamp)
            params.start_timestamp = start_timestamp;

          var end_timestamp = body.end_timestamp;
          if (end_timestamp)
            params.end_timestamp = end_timestamp;

          var ros_ga = body.ros_ga;
          if (ros_ga)
            params.ros_ga = ros_ga;

          var ros_respi = body.ros_respi;
          if (ros_respi)
            params.ros_respi = ros_respi;

          var ros_cardio = body.ros_cardio;
          if (ros_cardio)
            params.ros_cardio = ros_cardio;

          var ros_gastro = body.ros_gastro;
          if (ros_gastro)
            params.ros_gastro = ros_gastro;

          var ros_genital = body.ros_genital;
          if (ros_genital)
            params.ros_genital = ros_genital;

          var ros_ent = body.ros_ent;
          if (ros_ent)
            params.ros_ent = ros_ent;

          var ros_skin = body.ros_skin;
          if (ros_skin)
            params.ros_skin = ros_skin;

          var ros_other = body.ros_other;
          if (ros_other)
            params.ros_other = ros_other;

          var preg_lmp = body.preg_lmp;
          if (preg_lmp)
            params.preg_lmp = preg_lmp;

          var preg_curr_preg = body.preg_curr_preg;
          if (preg_curr_preg)
            params.preg_curr_preg = preg_curr_preg;

          var preg_gestration = body.preg_gestration;
          if (preg_gestration)
            params.preg_gestration = preg_gestration;

          var preg_breast_feeding = body.preg_breast_feeding;
          if (preg_breast_feeding)
            params.preg_breast_feeding = preg_breast_feeding;

          var preg_contraceptive = body.preg_contraceptive;
          if (preg_contraceptive)
            params.preg_contraceptive = preg_contraceptive;

          var preg_num_preg = body.preg_num_preg;
          if (preg_num_preg)
            params.preg_num_preg = preg_num_preg;

          var preg_num_live_birth = body.preg_num_live_birth;
          if (preg_num_live_birth)
            params.preg_num_live_birth = preg_num_live_birth;

          var preg_num_miscarriage = body.preg_num_miscarriage;
          if (preg_num_miscarriage)
            params.preg_num_miscarriage = preg_num_miscarriage;

          var preg_num_abortion = body.preg_num_abortion;
          if (preg_num_abortion)
            params.preg_num_abortion = preg_num_abortion;

          var preg_num_still_birth = body.preg_num_still_birth;
          if (preg_num_still_birth)
            params.preg_num_still_birth = preg_num_still_birth;

          var preg_remark = body.preg_remark;
          if (preg_remark)
            params.preg_remark = preg_remark;

          var pe_general = body.pe_general;
          if (pe_general)
            params.pe_general = pe_general;

          var pe_respiratory = body.pe_respiratory;
          if (pe_respiratory)
            params.pe_respiratory = pe_respiratory;

          var pe_cardio = body.pe_cardio;
          if (pe_cardio)
            params.pe_cardio = pe_cardio;

          var pe_gastro = body.pe_gastro;
          if (pe_gastro)
            params.pe_gastro = pe_gastro;

          var pe_genital = body.pe_genital;
          if (pe_genital)
            params.pe_genital = pe_genital;

          var pe_ent = body.pe_ent;
          if (pe_ent)
            params.pe_ent = pe_ent;

          var pe_skin = body.pe_skin;
          if (pe_skin)
            params.pe_skin = pe_skin;

          var pe_other = body.pe_other;
          if (pe_other)
            params.pe_other = pe_other;

          var rf_alertness = body.rf_alertness;
          if (rf_alertness)
            params.rf_alertness = rf_alertness;

          var rf_breathing = body.rf_breathing;
          if (rf_breathing)
            params.rf_breathing = rf_breathing;

          var rf_circulation = body.rf_circulation;
          if (rf_circulation)
            params.rf_circulation = rf_circulation;

          var rf_dehydration = body.rf_dehydration;
          if (rf_dehydration)
            params.rf_dehydration = rf_dehydration;

          var rf_defg = body.rf_defg;
          if (rf_defg)
            params.rf_defg = rf_defg;

          var diagnosis = body.diagnosis;
          if (diagnosis)
            params.diagnosis = diagnosis;

          var advice = body.advice;
          if (advice)
            params.advice = advice;

          var follow_up = body.follow_up;
          if (follow_up)
            params.follow_up = follow_up;

          var education = body.education;
          if (education)
            params.education = education;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_consultations(), params)
            .where(sql('consultation_id'), req.params.id)
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
                  q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send("Something wrong (error code 10039)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find consultation according to this id.');
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

/**
 * Delete consultation
 * TODO also actually delete the file
 * TODO better implementation:
 * just mark consultation as INACTIVE,and every time if someone try to access a
 * file that is inactive, return nothing and check if that file still exist. If
 * it does, remove it
 */
router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("consultations_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.consultations_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.consultations_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_consultations()).where(sql('consultation_id'), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10040)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find consultation according to this id.');
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