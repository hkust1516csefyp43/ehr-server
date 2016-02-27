/**
 * Created by RickyLo on 19/2/2016.
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
var patient_table = 'patient';
var visit_table = 'visit';
var triage_table = 'triage';
var consultation_table = 'consultation';
var pharmacy_table = 'pharmacy';

/**
 * get all visits of a patient
 * (unless you know all patient id, you won't be able to get all visits of everyone)
 */
router.get('/:id', function (req, res) {
  //logic:
  //1. get patient id
  //2. use patient id to find all visits with that patient id
  //3. use each visit id to find all triage
  //4. use each visit id to find all consultation
  //5. use each visit id to find all pharmacy
  //6. put triage into visit
  //7. put consultation into visit
  //8. put pharmacy into visit
  //9. loop to another one and repeat from 3

  var sent = false;
  var param_query = req.query;
  var token = param_query.token;
  var id = req.params.id;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_visit", token, function (err, return_value, client) {
      if (!return_value) {
        res.status(errors.bad_request()).send('Token missing or invalid');
        sent = true;
      } else if (return_value.add_visit === false) {
        res.status(errors.no_permission).send('No permission');
        sent = true;
      } else if (return_value.add_visit === true) {
        console.log("return value: " + JSON.stringify(return_value));

        //client.query('select * from triage where visit_id = (select visit_id from visit where patient_id = \'1\');select * from consultation where visit_id = (select visit_id from visit where patient_id = \'1\');select * from pharmacy where visit_id = (select visit_id from visit where patient_id = \'1\');select * from visit where patient_id = \'1\';', function(err, result) {
        //  if (!err)
        //    console.log("the result q: " + JSON.stringify(result.rows));
        //  else
        //    console.log("err: " + JSON.stringify(err));
        //  res.send('in progress again');
        //});

        var visits = [];
        var test = "testing";
        var sql_query1 = sql.select().from('visit').where(sql('patient_id'), '1');
        client.query(sql_query1.toParams().text, sql_query1.toParams().values, function (err, result) {
          if (!err) {
            visits = result.rows;
            test = "testing2";
            console.log("getting visits: " + JSON.stringify(visits));

            //This does not work because i can figure out how to make the for loop wait for the callback
            //for (var i = 0; i < visits.length; i++) {
            //  var sql_query2 = sql.select().from('triage').where(sql('visit_id'), visits[i].visit_id);
            //  console.log(sql_query2.toString());
            //  client.query(sql_query2.toParams().text, sql_query2.toParams().values, function (err, result) {
            //    if (!err) {
            //      console.log("does this work: " + test);
            //      console.log("getting triages: " + JSON.stringify(result.rows));
            //      console.log("does this visit " + i + " exist: " + JSON.stringify(visits[i]));
            //      visits[i].triage = result.rows[0];
            //    }
            //  });
            //}


            setTimeout(function () {
              res.send("in progress ar");
            }, 5000);
          }
        });

      }
    });
  }
});

/**
 * TODO
 * get all info of a visit of a patient
 */
router.get('/:uid/:vid', function(req, res) {

});

/**
 * TODO needs fixing
 * add visit
 * add :if to the end (patient id)
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
    db.check_token_and_permission("add_visit", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_visit === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_visit === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.visit_id = util.random_string(consts.id_random_string_length());
          params.date = moment(Date.now()).format('YYYY-MM-DD');
          params.next_station = "1";
          var patient_id = body.patient_id;
          var tag_number = body.tag_number;
          if (patient_id) {
            params.patient_id = patient_id;
          }
          if (tag_number) {
            params.tag_number = tag_number;
          }
          var sql_query = sql.insert(visit_table, params);
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
 * get list of triages (param search)
 */
router.get('/triage/', function (req, res) {

});

/**
 * TODO need fix
 * something is wrong with this function. It is way too long
 * add :id to the end (user_id)
 */
router.post('/triage/', function (req, res) {
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
    db.check_token_and_permission("add_triage", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_triage === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_triage === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.triage_id = util.random_string(consts.id_random_string_length());
          params.start_time = moment();
          params.end_time = moment();
          var user_id = body.user_id;
          var diastolic = body.diastolic;
          var systolic = body.systolic;
          var heart_rate = body.heart_rate;
          var weight = body.weight;
          var height = body.height;
          var temperature_celsius = body.temperature_celsius;
          var spo2 = body.spo2;
          var marital_status = body.marital_status;
          var respiratory_rate = body.respiratory_rate;
          var last_deworming_date = body.last_deworming_date;
          var currently_pregnant = body.currently_pregnant;
          var currently_breast_feeding = body.currently_breast_feeding;
          var amount_of_child = body.amount_of_child;
          var amount_of_miscarriage = body.amount_of_miscarriage;
          var amount_of_abortion = body.amount_of_abortion;
          var last_menstrual_period = body.last_menstrual_period;
          if (user_id) {
            params.user_id = user_id;
          }
          if (diastolic) {
            params.diastolic = diastolic;
          }
          if (systolic) {
            params.systolic = systolic;
          }
          if (heart_rate) {
            params.heart_rate = heart_rate;
          }
          if (weight) {
            params.weight = weight;
          }
          if (height) {
            params.height = height;
          }
          if (temperature_celsius) {
            params.temperature_celsius = temperature_celsius;
          }
          if (spo2) {
            params.spo2 = spo2;
          }
          if (marital_status) {
            params.marital_status = marital_status;
          }
          if (respiratory_rate) {
            params.respiratory_rate = respiratory_rate;
          }
          if (last_deworming_date) {
            params.last_deworming_date = last_deworming_date;
          }
          if (currently_pregnant) {
            params.currently_pregnant = currently_pregnant;
          }
          if (currently_breast_feeding) {
            params.currently_breast_feeding = currently_breast_feeding;
          }
          if (amount_of_child) {
            params.amount_of_child = amount_of_child;
          }
          if (amount_of_miscarriage) {
            params.amount_of_miscarrage = amount_of_miscarriage;
          }
          if (amount_of_abortion) {
            params.amount_of_abortion = amount_of_abortion;
          }
          if (last_menstrual_period) {
            params.last_menstrual_period = last_menstrual_period;
          }
          var sql_query1 = sql.insert(triage_table, params);
          console.log(sql_query1.toString());
          client.query(sql_query1.toParams().text, sql_query1.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query1.toString());

              var visit_id = body.visit_id;
              if (visit_id) {
                params.visit_id = visit_id;
              }else {
                res.status(errors.bad_request()).send('visit_id should be not null');
              }
              var triage_id = params.triage_id;
              var sql_query2 = sql
                .update(visit_table, {triage_id: triage_id, next_station: '2'})
                .where(sql('visit_id'), visit_id);

              console.log("result: " + JSON.stringify(result.rows[0]));
              console.log("The whole SQL query 2: " + sql_query2.toString());

              client.query(sql_query2.toParams().text, sql_query2.toParams().values, function (err, result) {
                if (err) {
                  if (!sent) {
                    sent = true;
                    res.status(errors.bad_request()).send("error 3");
                  }
                } else {
                  //util.save_sql_query(sql_query2.toString());

                  res.json(result.rows);
                }
              });
            }
          });
        }
      }
    });
  }

});

/**
 * TODO empty
 * edit triage
 */
router.put('/triage/:id', function(req, res) {

});

/**
 * TODO empty
 * delete triage record by id
 * permission: delete_triage
 */
router.delete('/triage/:id', function(req, res) {

});




/**
 * TODO empty
 * get list of consultations (param serach)
 */
router.get('/consultation/', function (req, res) {

});

/**
 * TODO need fix
 * add new consultation for a user
 * add :id to the end (user_id)
 */
router.post('/consultation/', function (req, res) {
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
    db.check_token_and_permission("add_consultation", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_consultation === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_consultation === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.consultation_id = util.random_string(consts.id_random_string_length());
          params.start_time = moment();
          params.end_time = moment();
          var user_id = body.user_id;
          var medication_remark = body.medication_remark;

          if (user_id) {
            params.user_id = user_id;
          }
          if ( medication_remark) {
            params.medication_remark = medication_remark;
          }

          var sql_query1 = sql.insert(consultation_table, params);
          console.log(sql_query1.toString());
          client.query(sql_query1.toParams().text, sql_query1.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query1.toString());

              var visit_id = body.visit_id;
              if (visit_id) {
                params.visit_id = visit_id;
              }else {
                res.status(errors.bad_request()).send('visit_id should be not null');
              }
              var consultation_id = params.consultation_id;
              var sql_query2 = sql
                .update(visit_table, {consultation_id: consultation_id, next_station: '3'})
                .where(sql('visit_id'), visit_id);

              console.log("result: " + JSON.stringify(result.rows[0]));
              console.log("The whole SQL query 2: " + sql_query2.toString());

              client.query(sql_query2.toParams().text, sql_query2.toParams().values, function (err, result) {
                if (err) {
                  if (!sent) {
                    sent = true;
                    res.status(errors.bad_request()).send("error 3");
                  }
                } else {
                  //util.save_sql_query(sql_query2.toString());

                  res.json(result.rows);
                }
              });
            }
          });
        }
      }
    });
  }
});

/**
 * TODO
 * edit a consultation by consultation_id
 */
router.put('/consultation/:id', function(req, res) {

});

/**
 * TODO empty
 * delete consultation record by id
 * permission: delete_consultation
 */
router.delete('/consultation/:id', function(req, res) {

});




/**
 * TODO empty
 * get list of pharmacies
 */
router.get('/pharmacy/', function (req, res) {

});

/**
 * TODO
 * add :id to the end (user_id)
 */
router.post('/pharmacy/', function (req, res) {
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
    db.check_token_and_permission("add_pharmacy", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_pharmacy === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_pharmacy === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.pharmacy_id = util.random_string(consts.id_random_string_length());
          params.start_time = moment();
          params.end_time = moment();
          var user_id = body.user_id;

          if (user_id) {
            params.user_id = user_id;
          }

          var sql_query1 = sql.insert(pharmacy_table, params);
          console.log(sql_query1.toString());
          client.query(sql_query1.toParams().text, sql_query1.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
              sent = true;
              return console.error('error fetching client from pool', err);
            } else {
              //util.save_sql_query(sql_query1.toString());

              var visit_id = body.visit_id;
              if (visit_id) {
                params.visit_id = visit_id;
              }else {
                res.status(errors.bad_request()).send('visit_id should be not null');
              }
              var pharmacy_id = params.pharmacy_id;
              var sql_query2 = sql
                .update(visit_table, {pharmacy_id: pharmacy_id, next_station: '0'})
                .where(sql('visit_id'), visit_id);

              console.log("result: " + JSON.stringify(result.rows[0]));
              console.log("The whole SQL query 2: " + sql_query2.toString());

              client.query(sql_query2.toParams().text, sql_query2.toParams().values, function (err, result) {
                if (err) {
                  if (!sent) {
                    sent = true;
                    res.status(errors.bad_request()).send("error 3");
                  }
                } else {
                  //util.save_sql_query(sql_query2.toString());

                  res.json(result.rows);
                }
              });
            }
          });
        }
      }
    });
  }

});

/**
 * TODO
 * edit pharmacy by id
 */
router.put('/pharmacy/:id', function(req, res) {

});

/**
 * TODO empty
 * delete pharmacy record by id
 * permission: delete_pharmacy
 */
router.delete('/pharmacy/:id', function(req, res) {

});

module.exports = router;