/**
 * Created by Louis on 16/3/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var sql = require('sql-bricks-postgres');

var util = require('../utils');
var errors = require('../errors');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');

/**
 * Get list of suitcases (also search)
 */
router.get('/', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("suitcases_read", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.suitcases_read === false) {
        sent = true;
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.suitcases_read === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var params = {};
          var name = req.query.name;
          if (name) {
            params.suitcase_name = name;
          }
          var sql_query = sql.select().from(consts.table_suitcases()).where(params);
          var offset = req.query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = req.query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('suitcase_id');
          }

          var limit = req.query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.send('error fetching client from pool');
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
 * Get a suitcase
 */
router.get('/:id', function (req, res) {

});

router.put('/:id', function (req, res) {

});

router.post('/', function (req, res) {

});

router.delete('/:id', function (req, res) {

});

module.exports = router;