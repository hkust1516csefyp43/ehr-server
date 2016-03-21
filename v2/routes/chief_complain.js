var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');

var default_table = 'chief_complain';

/**
 * Get list of chief complains
 */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log("All input queries: " + JSON.stringify(param_query));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.reset_any_password === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.reset_any_password === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var diagnosis_id = param_query.diagnosis_id;
          if (diagnosis_id) {
            params.diagnosis_id = diagnosis_id;
          }

          var name = param_query.name;
          if (name) {
            params.name = name;
          }

          var sql_query = sql
            .select()
            .from(default_table)
            .where(params);

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (!sort_by) { //Default sort by
            sql_query.orderBy('chief_complain_id');
          } else {    //custom sort by
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          }

          console.log(sql_query.toString());

          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.status(errors.bad_request()).send('error fetching client from pool 2');
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

/**
 * Get a chief complain by id
 */
router.get('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));

  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    params.token = token;
  }

  params.id = req.params.id;

  var sql_query = sql.select().from(default_table).where(params).toParams();

  console.log(JSON.stringify(sql_query.text));
  console.log(JSON.stringify(sql_query.values));

  if (!sent) {
    res.send('testing stuff');
  }
});

/**
 * Update chief complain with id
 */
router.put('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));
  console.log("The body: " + JSON.stringify(body));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.reset_any_password === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.reset_any_password === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var name = body.name;
          if (body) {
            params.name = name;
          }
          var sql_query = sql.update(default_table, params).where(sql('chief_complain_id'), req.params.id);
          console.log(sql_query.toString());

          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
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

/**
 * Add new chief complain
 */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.reset_any_password === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.reset_any_password === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.chief_complain_id = util.random_string(consts.id_random_string_length());
          var name = body.name;
          if (body) {
            params.name = name;
          }
          var sql_query = sql.insert(default_table, params);
          console.log(sql_query.toString());
          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
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

/**
 * delete chief complain
 */
router.delete('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var body = req.body;
  console.log("All input queries: " + JSON.stringify(param_query));
  console.log("The body: " + JSON.stringify(body));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.reset_any_password === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.reset_any_password === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var sql_query = sql.delete().from(default_table).where(sql('chief_complain_id'), req.params.id);
          console.log(sql_query.toString());

          client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
            if (err) {
              res.send('error fetching client from pool 3');
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