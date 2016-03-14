/**
 * Created by Louis on 15/8/2015.
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
var patient_table = 'v2.patients';
var visit_table = 'v2.visits';
var triage_table = 'v2.triages';
var consultation_table = 'v2.consultations';
var pharmacy_table = 'v2.pharmacies';

/* GET with patient id + basic auth */
router.get('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));
  console.log("patient_id:",req.params.id);
  var token = param_query.token;
    if (!token) {
      res.status(errors.token_missing()).send('Token is missing');
        sent = true;
    } else {
      db.check_token_and_permission("patients_read", token, function (err, return_value, client) {
        if (!return_value) {                                            //return value == null >> sth wrong
          res.status(errors.bad_request()).send('Token missing or invalid');
        } else if (return_value.patients_read === false) {          //false (no permission)
          res.status(errors.no_permission).send('No permission');
        } else if (return_value.patients_read === true) {           //w/ permission
          if (return_value.expiry_timestamp < Date.now()) {
            res.status(errors.access_token_expired()).send('Access token expired');
          } else{
            var patient_id = req.params.id;
            params.patient_id = patient_id;

            var sql_query = sql
              .select()
              .from(patient_table)
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
              sql_query.limit(100);
            }

            console.log("The whole query in string: " + sql_query.toString());
            if (sent === false) {
              client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                if (err) {
                  res.send('error fetching client from pool 2');
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

router.get('/', function (req, res) {
  var sent = false;

  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));

  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("patients_read", token, function (err, return_value, client) {
      if (!return_value) {                                            //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.patients_read === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.patients_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var next_station = param_query.next_station;
          if (next_station) {
            params.next_station = next_station;
          }

          //These 3 are mutually exclusive
          var age = param_query.age;
          var age_ot = param_query.age_ot;
          var age_yt = param_query.age_yt;

          //TODO age_ot and age_yt can exist together iff age_yt > age_ot
          switch (util.mutually_exclusive(age, age_ot, age_yt)) {
            case 0:
              //Do nothing, LITERALLY
              break;
            case 1:
              if (age) {
                //TODO calculation
              } else if (age_ot) {
                //TODO calculation
              } else if (age_yt) {
                //TODO calculation
              }
              break;
            case 2:
              if (!age) { //i.e. age_ot and age_yt exists
                if (age_yt - age_ot > 1) {
                  //TODO ok, calculate
                } else {
                  res.status(409).send('invalid age_ot and age_yt combination');
                }
              }
              break;
            default:
              res.status(409).send('age, ago_ot and age_yt must be mutually exclusive');
              sent = true;
          }

          var clinic_id = param_query.clinic_id;
          if (clinic_id) {
            params.clinic_id = clinic_id;
          }

          var gender_id = param_query.gender_id;
          if (gender_id) {
            params.gender_id = gender_id;
          }

          var blood_type_id = param_query.blood_type_id;
          if (blood_type_id) {
            params.blood_type_id = blood_type_id;
          }

          var phone_number_country_code = param_query.phone_number_country_code;
          if (phone_number_country_code) {
            params.phone_number_country_code = phone_number_country_code;
          }

          var email = param_query.email;
          if (email) {
            //params.email = email;
            if (valid.email(email) === false) {
              sent = true;
              res.status(errors.bad_request()).send("invalid email");
            } else {
              params.email = email;
            }
          }

          var first_name = param_query.first_name;
          if (first_name) {
            params.first_name = first_name;
          }

          var middle_name = param_query.middle_name;
          if (middle_name) {
            params.middle_name = middle_name;
          }

          var last_name = param_query.last_name;
          if (last_name) {
            params.last_name = last_name;
          }

          var name = param_query.name;
          if (name) {
            //TODO search it at first_name OR middle_name OR last_name
          }

          //TODO get this from relationship table
          //var related_to_id = param_query.related_to_id;
          //if (related_to_id) {
          //    params.related_id = related_to_id;
          //}

          //console.log(JSON.stringify(params));

          var sql_query = sql
            .select()
            .from(patient_table)
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
            sql_query.limit(100);
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.send('error fetching client from pool 2');
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

/**
 * Add new patient
 */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));
  console.log("The input body: " + JSON.stringify(body));
  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_patient", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_patient === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_patient === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.patient_id = util.random_string(consts.id_random_string_length());
          params.create_timestamp = moment();
          params.last_seen = moment();

          var honorific = body.honorific;
          if (honorific)
            params.honorific = honorific;

          var first_name = body.first_name;
          if (first_name)
            params.first_name = first_name;
          else
            res.status(errors.bad_request()).send('first_name should be not null');

          var middle_name = body.middle_name;
          if (middle_name)
            params.middle_name = middle_name;

          var last_name = body.last_name;
          if (last_name)
            params.last_name = last_name;

          //TODO select phone_country_id from the phone country input from the request body
          var phone_number = body.phone_number;
          if (phone_number) {
            params.phone_number = phone_number;
          }

          var address = body.address;
          if (address) {
            params.address = address;
          } else {
            res.status(errors.bad_request()).send('address should be not null');
          }

          var date_of_birth = body.date_of_birth;
          if (date_of_birth) {
            params.date_of_birth = date_of_birth;
          }

          var gender = body.gender;
          if (gender) {
            params.gender = gender;
          }

          var photo = body.photo;
          if (photo) {
            params.photo = photo;
          }

          var blood_type = body.blood_type;
          if (blood_type) {
            params.blood_type = blood_type;
          }

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql.insert(patient_table, params);
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query.toString());
              res.json(result.rows);
            }
          });
        }
      }
    });
  }
});

/**
 * edit patient
 */
router.put('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));
  console.log("The input body: " + JSON.stringify(body));
  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_patient", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_patient === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_patient === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.last_seen = moment();

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

          //TODO select phone_country_id from the phone country input from the request body
          var phone_number = body.phone_number;
          if (phone_number) {
            params.phone_number = phone_number;
          }

          var address = body.address;
          if (address) {
            params.address = address;
          }

          var date_of_birth = body.date_of_birth;
          if (date_of_birth) {
            params.date_of_birth = date_of_birth;
          }

          var gender = body.gender;
          if (gender) {
            params.gender = gender;
          }

          var photo = body.photo;
          if (photo) {
            params.photo = photo;
          }

          var blood_type = body.blood_type;
          if (blood_type) {
            params.blood_type = blood_type;
          }

          var patient_id = req.params.id;

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql
            .update(patient_table, params)
            .where(sql('patient_id'), patient_id);
          //var sql_query = sql.insert(patient_table, params);
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query.toString());
              res.json(result.rows);
            }
          });
        }
      }
    });
  }
});

/**
 * TODO
 * add new document to a patient (:id)
 */
router.post('/documents/:id', function(req, res) {

});

/**
 * edit a document (:id >> document_id)
 */
router.put('/documents/:id', function(req, res) {

});

/**
 * get a document (:id >> document_id)
 */
router.get('/documents/:id', function(req, res) {

});

module.exports = router;