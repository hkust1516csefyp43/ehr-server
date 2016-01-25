var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../errors');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');

/**
 * Get list of slums
 */
router.get('/slum/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var sql_query;
  console.log('All input queries: ' + JSON.stringify(param_query));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    //TODO return list of slums (name only)
    sql_query = sql.select('name').from('slum');
    pg.connect(db.url(), function (err, client, done) {
      if (err) {
        res.status(errors.bad_request()).send('somethings wrong');
      } else {
        client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
          done();
          if (err) {
            res.status(errors.bad_request()).send('somethings wrong');
          } else {
            var output = [];
            for (var i = 0; i < result.rows.length; i++)
              output.push(result.rows[i].name);
            res.json(output);
          }
        });
      }
    });
    sent = true;
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (!return_value) {
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.reset_any_password === false) {
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.reset_any_password === true) {
        console.log("return value: " + JSON.stringify(return_value));

        //TODO search both english and native
        var name = param_query.name;
        //if (name) {
        //  params.name = name;
        //}

        var english_name = param_query.english_name;
        if (english_name) {
          params.english_name = english_name;
        }

        var native_name = param_query.native_name;
        if (native_name) {
          params.native_name = native_name;
        }

        var location_near = param_query.location_near;
        //if (location_near) {
        //  params.location_near = location_near;
        //}

        var country_id = param_query.country_id;
        if (country_id) {
          params.country_id = country_id;
        }

        sql_query = sql
          .select()
          .from('slum')
          .where(params);

        var limit = param_query.limit;
        if (limit) {
          sql_query.limit(limit);
        } else {    //Default limit
          sql_query.limit(100);
        }

        var offset = param_query.offset;
        if (offset) {
          sql_query.offset(offset);
        }

        var sort_by = param_query.sort_by;
        if (!sort_by) { //Default sort by
          sql_query.orderBy('slum_id');
        } else {    //custom sort by
          //TODO check if custom sort by param is valid
          sql_query.orderBy(sort_by);
        }

        console.log(sql_query.toString());

        client.query(sql_query.toParams().text, sql_query.toParams.values, function (err, result) {
          if (err) {
            res.status(errors.bad_request()).send('error');
            sent = true;
          } else {
            q.save_sql_query(sql_query.toString());
            res.json(result.rows);
          }
        });
      }
    });
  }
});

/**
 * Get slum by id
 */
router.get('/slum/:id', function (req, res) {

});

/**
 * Update info of a slum
 */
router.put('/slum/:id', function (req, res) {

});

/**
 * Add new slum
 */
router.post('/slum/', function (req, res) {

});

/**
 * Get list of countries
 */
router.get('/country/', function (req, res) {

});

/**
 * Get country by id
 */
router.get('/country/:id', function (req, res) {

});

/**
 * Update info of a country
 */
router.put('/country/:id', function (req, res) {

});


/**
 * Add new country
 */
router.post('/country/', function (req, res) {

});

module.exports = router;