/**
 * Created by Louis on 23/4/2016.
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

var permission_read = 'queries_read';
var permission_write = 'queries_write';
var this_table = consts.table_queries();
var this_pk = 'v2.queries.query_id';

/**
 * GET list of queries
 * i.e. server receives request, send list of queries to user
 */
router.get('/', function (req, res) {
  var sent = false;
  console.log(JSON.stringify(req.query));
  console.log(JSON.stringify(req.headers));
  var token = req.headers.token;
  if (!token) {
    sent = true;
    res.status(errors.token_missing()).send('Token is missing');
  } else {
    db.check_token_and_permission(permission_read, token, function(err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value[permission_read] === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value[permission_read] === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var params = {};

          //TODO create_timestamp filter

          var sql_query = sql.select().from(this_table).where(params).orderBy('create_timestamp');
          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function(err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                sent = true;
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
 * POST list of queries
 * i.e. server receives requests plus a list of queries, process them one by one, and then report how many pass through, how many does not
 */
router.post('/', function (req, res) {

});

module.exports = router;