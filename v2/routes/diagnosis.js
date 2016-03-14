var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../errors');
var consts = require('../consts');
var db = require('../database');
var valid = require('../valid');
var q = require('../query');
var sql = require('sql-bricks-postgres');

var default_table = 'diagnosis';

/**
 * Get a list of diagnosis
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
    //TODO check what permission it actually needs
    var permissions = [];
    permissions.push("read_patient");
    permissions.push("add_to_inventory");
    db.check_token_and_permission(permissions, token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.read_patient === false || return_value.add_to_inventory === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.read_patient === true && return_value.add_to_inventory === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var chief_complain_id = param_query.chief_complain_id;
          if (chief_complain_id) {
            params.chief_complain_id = chief_complain_id;
          }

          var medication_id = param_query.medication_id;
          if (medication_id) {
            params.medication_id = medication_id;
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
            sql_query.orderBy('diagnosis_id');
          } else {    //custom sort by
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          }

          console.log(sql_query.toString());

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
    });
  }
});

/**
 * Get a diagnosis by id
 */
router.get('/:id', function (req, res) {

});

router.post('/', function (req, res) {

});

router.put('/:id', function (req, res) {

});

router.delete('/:id', function (req, res) {

});

module.exports = router;