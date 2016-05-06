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

          var sql_query = sql
            .select(consts.table_patients() + ".*")
            .from(consts.table_patients());

          var cont = function () {

            // //These 3 are mutually exclusive
            // var age = param_query.age;
            // var age_ot = param_query.age_ot;
            // var age_yt = param_query.age_yt;
            //
            // //TODO age_ot and age_yt can exist together iff age_yt > age_ot
            // switch (util.mutually_exclusive(age, age_ot, age_yt)) {
            //   case 0:
            //     //Do nothing, LITERALLY
            //     break;
            //   case 1:
            //     if (age) {
            //       //TODO calculation
            //     } else if (age_ot) {
            //       //TODO calculation
            //     } else if (age_yt) {
            //       //TODO calculation
            //     }
            //     break;
            //   case 2:
            //     if (!age) { //i.e. age_ot and age_yt exists, although technically it can be age + age_ot/yt >> TODO fix that
            //       if (age_yt - age_ot > 1) {
            //         //TODO ok, calculate
            //       } else {
            //         res.status(errors.bad_request()).send('age_yt must be larger than age_ot; if it is equal, use age');
            //       }
            //     }
            //     break;
            //   default:
            //     res.status(errors.bad_request()).send('age, ago_ot and age_yt must be mutually exclusive');
            //     sent = true;
            // }

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

            var phone_number = param_query.phone_number;
            if (phone_number) {
              params.phone_number = phone_number;
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
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(first_name)));
            }

            var middle_name = param_query.middle_name;
            if (middle_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(middle_name)));
            }

            var last_name = param_query.last_name;
            if (last_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(last_name)));
            }

            var honorific = param_query.honorific;
            if (honorific) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(honorific)));
            }

            var native_name = param_query.native_name;
            if (native_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(native_name)));
            }

            var name = param_query.name;
            if (name) {
              if (!first_name && !middle_name && !last_name) {
                //select * from v2.patients where first_name ILIKE '%Louis%' OR middle_name ILIKE '%Louis%' OR last_name ILIKE '%Louis%' OR native_name ILIKE '%Louis%'
                sql_query.where(sql.or(sql.ilike('first_name', util.pre_suf_percent(name)), sql.ilike('middle_name', util.pre_suf_percent(name)), sql.ilike('last_name', util.pre_suf_percent(name)), sql.ilike('native_name', util.pre_suf_percent(name))));
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send("Which name do you want me to search?");
              }
            }

            var related_to_id = param_query.related_to_id;
            if (related_to_id) {
              sql_query.from(consts.table_relationships());
              sql_query.where(sql.and(sql.or(sql.eq(sql(consts.table_relationships() + ".patient_id_1"), related_to_id), sql.eq(sql(consts.table_relationships() + ".patient_id_2"), related_to_id)), sql.or(sql.eq(sql(consts.table_relationships() + ".patient_id_1"), sql(consts.table_patients() + ".patient_id")), sql.eq(sql(consts.table_relationships() + ".patient_id_2"), sql(consts.table_patients() + ".patient_id"))), sql.notEq(sql(consts.table_patients() + ".patient_id"), related_to_id)));
            }

            console.log(JSON.stringify(params));

            var visit_date = param_query.visit_date;
            var visit_date_range_before = param_query.visit_date_range_before;
            var visit_date_range_after = param_query.visit_date_range_after;


            if (visit_date) {
              if (visit_date_range_after || visit_date_range_before) {
                if (!sent) {
                  res.status(errors.bad_request()).send("You cant have both visit_date and visit_data_range_before/after");
                  sent = true;
                }
              } else {
                sql_query.select(sql(consts.table_visits() + ".tag"));
                sql_query.select(sql(consts.table_visits() + ".next_station"));
                sql_query.select(sql(consts.table_visits() + ".visit_id"));
                sql_query.from(consts.table_visits());
                sql_query.where(sql.and(sql.gte(consts.table_visits() + ".create_timestamp", visit_date), sql.lt(consts.table_visits() + ".create_timestamp", sql("(date '" + visit_date + "' + integer '1')"))));
                sql_query.where(sql(consts.table_visits() + ".patient_id"), sql(consts.table_patients() + ".patient_id"));
              }
            } else {
              //TODO visit_date_range
            }

            var next_station = param_query.next_station;
            if (next_station) {
              if (!visit_date) {
                sql_query.select(sql(consts.table_visits() + ".tag"));
                sql_query.select(sql(consts.table_visits() + ".next_station"));
                sql_query.select(sql(consts.table_visits() + ".visit_id"));
                sql_query.from(consts.table_visits());
              }
              sql_query.where(sql(consts.table_visits() + ".next_station"), sql(next_station));
              sql_query.where(sql(consts.table_visits() + ".patient_id"), sql(consts.table_patients() + ".patient_id"));
            }

            var offset = param_query.offset;
            if (offset) {
              sql_query.offset(offset);
            }

            var sort_by = param_query.sort_by;
            if (sort_by) {
              //TODO check if custom sort by param is valid
              sql_query.orderBy(sort_by);
            } else {
              sql_query.orderBy('v2.patients.patient_id');
            }

            var limit = param_query.limit;
            if (limit) {
              sql_query.limit(limit);
            } else {    //Default limit
              sql_query.limit(consts.list_limit());
            }

            sql_query.where(params);

            console.log("The whole query in string A: " + sql_query.toString());

            if (!sent) {
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
          };

          var clinic_id = param_query.clinic_id;
          if (clinic_id) {
            db.is_clinic_global(clinic_id, function (err, return_value, client) {  //TODO i might need to cache that or it will be too slow
              if (err) {
                sent = true;
                res.status(errors.server_error()).send("something wrong");
              }
              if (return_value) {
                if (return_value.is_global === false) {
                  sql_query.where('clinic_id', clinic_id.toString());
                }
                //else >> literally do nothing, just move on
                cont();
              } else {
                //TODO response error
              }
            });
          } else {
            cont();
          }
        }
      }
    });
  }
});

/**
 * TODO response with the amount of patients according to params
 */
router.get('/count/', function (req, res) {

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

          var sql_query = sql
            .select('COUNT(' + consts.table_patients() + ".*" + ')')
            .from(consts.table_patients());

          var cont = function () {

            // //These 3 are mutually exclusive
            // var age = param_query.age;
            // var age_ot = param_query.age_ot;
            // var age_yt = param_query.age_yt;
            //
            // //TODO age_ot and age_yt can exist together iff age_yt > age_ot
            // switch (util.mutually_exclusive(age, age_ot, age_yt)) {
            //   case 0:
            //     //Do nothing, LITERALLY
            //     break;
            //   case 1:
            //     if (age) {
            //       //TODO calculation
            //     } else if (age_ot) {
            //       //TODO calculation
            //     } else if (age_yt) {
            //       //TODO calculation
            //     }
            //     break;
            //   case 2:
            //     if (!age) { //i.e. age_ot and age_yt exists, although technically it can be age + age_ot/yt >> TODO fix that
            //       if (age_yt - age_ot > 1) {
            //         //TODO ok, calculate
            //       } else {
            //         res.status(errors.bad_request()).send('age_yt must be larger than age_ot; if it is equal, use age');
            //       }
            //     }
            //     break;
            //   default:
            //     res.status(errors.bad_request()).send('age, ago_ot and age_yt must be mutually exclusive');
            //     sent = true;
            // }

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

            var first_name = param_query.first_name;
            if (first_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(first_name)));
            }

            var middle_name = param_query.middle_name;
            if (middle_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(middle_name)));
            }

            var last_name = param_query.last_name;
            if (last_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(last_name)));
            }

            var honorific = param_query.honorific;
            if (honorific) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(honorific)));
            }

            var native_name = param_query.native_name;
            if (native_name) {
              sql_query.where(sql.ilike('first_name', util.pre_suf_percent(native_name)));
            }
            
            var related_to_id = param_query.related_to_id;
            if (related_to_id) {
              sql_query.from(consts.table_relationships());
              sql_query.where(sql.and(sql.or(sql.eq(sql(consts.table_relationships() + ".patient_id_1"), related_to_id), sql.eq(sql(consts.table_relationships() + ".patient_id_2"), related_to_id)), sql.or(sql.eq(sql(consts.table_relationships() + ".patient_id_1"), sql(consts.table_patients() + ".patient_id")), sql.eq(sql(consts.table_relationships() + ".patient_id_2"), sql(consts.table_patients() + ".patient_id"))), sql.notEq(sql(consts.table_patients() + ".patient_id"), related_to_id)));
            }

            console.log(JSON.stringify(params));

            var visit_date = param_query.visit_date;
            var visit_date_range_before = param_query.visit_date_range_before;
            var visit_date_range_after = param_query.visit_date_range_after;


            if (visit_date) {
              if (visit_date_range_after || visit_date_range_before) {
                if (!sent) {
                  res.status(errors.bad_request()).send("You cant have both visit_date and visit_data_range_before/after");
                  sent = true;
                }
              } else {
                sql_query.from(consts.table_visits());
                sql_query.where(sql.and(sql.gte(consts.table_visits() + ".create_timestamp", visit_date), sql.lt(consts.table_visits() + ".create_timestamp", sql("(date '" + visit_date + "' + integer '1')"))));
                sql_query.where(sql(consts.table_visits() + ".patient_id"), sql(consts.table_patients() + ".patient_id"));
              }
            } else {
              //TODO visit_date_range
            }

            var next_station = param_query.next_station;
            if (next_station) {
              if (!visit_date) {
                sql_query.from(consts.table_visits());
              }
              sql_query.where(sql(consts.table_visits() + ".next_station"), sql(next_station));
              sql_query.where(sql(consts.table_visits() + ".patient_id"), sql(consts.table_patients() + ".patient_id"));
            }

            sql_query.where(params);

            console.log("The whole query in string A: " + sql_query.toString());

            if (!sent) {
              client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                if (err) {
                  res.send('error fetching client from pool 2');
                  sent = true;
                  return console.error('error fetching client from pool', err);
                } else {
                  q.save_sql_query(sql_query.toString());
                  res.json(result.rows[0]);
                }
              });
            }
          };

          var clinic_id = param_query.clinic_id;
          if (clinic_id) {
            db.is_clinic_global(clinic_id, function (err, return_value, client) {  //TODO i might need to cache that or it will be too slow
              if (err) {
                sent = true;
                res.status(errors.server_error()).send("something wrong");
              }
              if (return_value) {
                if (return_value.is_global === false) {
                  sql_query.where('clinic_id', clinic_id.toString());
                }
                //else >> literally do nothing, just move on
                cont();
              } else {
                //TODO response error
              }
            });
          } else {
            cont();
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
    if (!sent) {
      res.status(errors.token_missing()).send('Token is missing');
      sent = true;
    }
  } else {
    db.check_token_and_permission("patients_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        if (!sent) {
          sent = true;
          res.status(errors.bad_request()).send('Token missing or invalid');
        }
      } else if (return_value.patients_write === false) {          //false (no permission)
        if (!sent) {
          sent = true;
          res.status(errors.no_permission()).send('No permission');
        }
      } else if (return_value.patients_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          if (!sent) {
            sent = true;
            res.status(errors.access_token_expired()).send('Access token expired');
          }
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

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err && !sent) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result && result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result && result.rows.length === 0 && !sent) {
                  res.status(errors.not_found()).send('Insertion failed');
                } else if (!sent) {
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
          if (email) {
            if (valid.email(email)) {
              params.email = email;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send("Invalid email");
            }
          }

          var birth_year = body.birth_year;
          if (birth_year) {
            if (birth_year > 1800 && birth_year < 2100) {
              params.birth_year = birth_year;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send("I am pretty sure the birth year is wrong");
            }
          }

          var birth_month = body.birth_month;
          if (birth_month) {
            if (birth_month > 0 && birth_month < 13) {
              params.birth_month = birth_month;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send("The birth month is wrong");
            }
          }

          //TODO check this
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