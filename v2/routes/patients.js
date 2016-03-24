/**
 * Created by RickyLo on 24/3/2016.
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
    db.check_token_and_permission("patients_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.patients_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

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

          var address = req.query.address;
          if (address)
            params.address = address;

          var email = req.query.email;
          if (email)
            params.email = email;

          var birth_year = req.query.birth_year;
          if (birth_year)
            params.birth_year = birth_year;

          var birth_month = req.query.birth_month;
          if (birth_month)
            params.birth_month = birth_month;

          var birth_date = req.query.birth_date;
          if (birth_date)
            params.birth_date = birth_date;

          var create_timestamp = req.query.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var clinic_id = req.query.clinic_id;
          if (clinic_id)
            params.clinic_id = clinic_id;

          var gender_id = req.query.gender_id;
          if (gender_id)
            params.gender_id = gender_id;

          var image_id = req.query.image_id;
          if (image_id)
            params.image_id = image_id;

          var blood_type_id = req.query.blood_type_id;
          if (blood_type_id)
            params.blood_type_id = blood_type_id;

          var phone_number_country_code = req.query.phone_number_country_code;
          if (phone_number_country_code)
            params.phone_number_country_code = phone_number_country_code;

          var phone_number = req.query.phone_number;
          if (phone_number)
            params.phone_number = phone_number;

          var native_name = req.query.native_name;
          if (native_name)
            params.native_name = native_name;

          console.log(params);

          var sql_query = sql
            .select()
            .from(consts.table_patients())
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
            sql_query.orderBy('patient_id');
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
    db.check_token_and_permission("patients_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.patients_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.patient_id = req.params.id;

          var sql_query = sql.select().from(consts.table_patients()).where(params);

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
                  res.status(errors.not_found()).send('Cannot find patient according to this id.');
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
    db.check_token_and_permission("patients_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.patients_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.create_timestamp = moment();
          params.patient_id = util.random_string(consts.id_random_string_length());

          var honorific = body.honorific;
          if (honorific)
            params.honorific = honorific;

          var first_name= body.first_name;
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

          var address = body.address;
          if (address)
            params.address = address;

          var email = body.email;
          if (email)
            params.email = email;

          var birth_year = body.birth_year;
          if (birth_year)
            params.birth_year = birth_year;

          var birth_month = body.birth_month;
          if (birth_month)
            params.birth_month = birth_month;

          var birth_date = body.birth_date;
          if (birth_date)
            params.birth_date = birth_date;

          var clinic_id = body.clinic_id;
          if (clinic_id)
            params.clinic_id = clinic_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('clinic_id should be not null');
          }

          var gender_id = body.gender_id;
          if (gender_id)
            params.gender_id = gender_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('gender_id should be not null');
          }

          var image_id = body.image_id;
          if (image_id)
            params.image_id = image_id;

          var blood_type_id = body.blood_type_id;
          if (blood_type_id)
            params.blood_type_id = blood_type_id;

          var phone_number_country_code = body.phone_number_country_code;
          if (phone_number_country_code)
            params.phone_number_country_code = phone_number_country_code;

          var phone_number = body.phone_number;
          if (phone_number)
            params.phone_number = phone_number;

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          var sql_query = sql.insert(consts.table_patients(), params).returning('*');
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
    db.check_token_and_permission("patients_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.patients_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

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

          var address = body.address;
          if (address)
            params.address = address;

          var email = body.email;
          if (email)
            params.email = email;

          var birth_year = body.birth_year;
          if (birth_year)
            params.birth_year = birth_year;

          var birth_month = body.birth_month;
          if (birth_month)
            params.birth_month = birth_month;

          var birth_date = body.birth_date;
          if (birth_date)
            params.birth_date = birth_date;

          var clinic_id = body.clinic_id;
          if (clinic_id)
            params.clinic_id = clinic_id;

          var gender_id = body.gender_id;
          if (gender_id)
            params.gender_id = gender_id;

          var image_id = body.image_id;
          if (image_id)
            params.image_id = image_id;

          var blood_type_id = body.blood_type_id;
          if (blood_type_id)
            params.blood_type_id = blood_type_id;

          var phone_number_country_code = body.phone_number_country_code;
          if (phone_number_country_code)
            params.phone_number_country_code = phone_number_country_code;

          var phone_number = body.phone_number;
          if (phone_number)
            params.phone_number = phone_number;

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_patients(), params)
            .where(sql('patient_id'), req.params.id)
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
                  res.status(errors.not_found()).send('Cannot find patient according to this id.');
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
 * Delete patient
 * TODO also actually delete the file
 * TODO better implementation:
 * just mark patient as INACTIVE,and every time if someone try to access a
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
    db.check_token_and_permission("patients_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.patients_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_patients()).where(sql('patient_id'), req.params.id).returning('*');
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
                  res.status(errors.not_found()).send('Cannot find patient according to this id.');
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