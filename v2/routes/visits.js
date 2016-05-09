/**
 * Created by RickyLo on 31/3/2016.
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
    db.check_token_and_permission("visits_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.visits_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.visits_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var create_timestamp = req.query.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var tag = req.query.tag;
          if (tag)
            params.tag = tag;

          var next_station = req.query.next_station;
          if (next_station)
            params.next_station = next_station;

          var patient_id = req.query.patient_id;
          if (patient_id)
            params.patient_id = patient_id;

          var sql_query = sql
            .select()
            .from(consts.table_visits())
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
            sql_query.orderBy('visit_id');
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
                q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                  if (err) {
                    if (!sent) {
                      sent = true;
                      res.status(errors.server_error()).send("Something wrong (error code 10152)");
                    }
                  }
                });
                res.json(result.rows);
              }
            });
          }
        }
      }
    });
  }
});

router.get('/count', function (req, res) {
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
    db.check_token_and_permission("visits_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.visits_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.visits_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var tag = req.query.tag;
          if (tag)
            params.tag = tag;

          var next_station = req.query.next_station;
          if (next_station)
            params.next_station = next_station;

          var patient_id = req.query.patient_id;
          if (patient_id)
            params.patient_id = patient_id;

          var visit_date = req.query.visit_date;
          var visit_date_range_before = req.query.visit_date_range_before;
          var visit_date_range_after = req.query.visit_date_range_after;

          var sql_query = sql
            .select('COUNT(' + consts.table_visits() + '.*)')
            .from(consts.table_visits())
            .where(params);

          if (visit_date) {
            if (visit_date_range_after || visit_date_range_before) {
              if (!sent) {
                res.status(errors.bad_request()).send("You cant have both visit_date and visit_data_range_before/after");
                sent = true;
              }
            } else {
              sql_query.where(sql.and(sql.gte(consts.table_visits() + ".create_timestamp", visit_date), sql.lt(consts.table_visits() + ".create_timestamp", sql("(date '" + visit_date + "' + integer '1')"))));
            }
          } else if (visit_date_range_after && visit_date_range_before) {
            sql_query.where(sql.and(sql.gte(consts.table_visits() + ".create_timestamp", visit_date_range_after), sql.lt(consts.table_visits() + ".create_timestamp", visit_date_range_before)));
          } else if (visit_date_range_after) {
            sql_query.where(sql.gte(consts.table_visits() + ".create_timestamp", visit_date_range_after));
          } else if (visit_date_range_before) {
            sql_query.where(sql.lt(consts.table_visits() + ".create_timestamp", visit_date_range_before));
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                  if (err) {
                    if (!sent) {
                      sent = true;
                      res.status(errors.server_error()).send("Something wrong (error code 10153)");
                    }
                  }
                });
                res.json(result.rows[0]);
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
    db.check_token_and_permission("visits_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.visits_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.visits_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.create_timestamp = moment();
          params.visit_id = util.random_string(consts.id_random_string_length());

          var tag = body.tag;
          if (tag)
            params.tag = tag;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('tag should be not null');
          }

          var next_station = body.next_station;
          if (next_station)
            params.next_station = next_station;

          var patient_id = body.patient_id;
          if (patient_id)
            params.patient_id = patient_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('patient_id should be not null');
          }

          var sql_query = sql.insert(consts.table_visits(), params).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10154)");
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
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("visits_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.visits_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.visits_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var tag = body.tag;
          if (tag)
            params.tag = tag;

          var next_station = body.next_station;
          if (next_station)
            params.next_station = next_station;

          var patient_id = body.patient_id;
          if (patient_id)
            params.patient_id = patient_id;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_visits(), params)
            .where(sql('visit_id'), req.params.id)
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
                        res.status(errors.server_error()).send("Something wrong (error code 10155)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find visit according to this id.');
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
    db.check_token_and_permission("visits_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.visits_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.visits_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_visits()).where(sql('visit_id'), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10156)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find visit according to this id.');
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