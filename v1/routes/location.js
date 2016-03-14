var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../errors');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');
var slum_table = 'slum';
var country_table = 'country';

/**
 * TODO rename it to clinics
 * 1) just names & id: no access token
 * 2) everything
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
    sql_query = sql.select('name').from(slum_table);
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
          .from(slum_table)
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
 * TODO rename it to clinics
 * Get slum by id
 */
router.get('/slum/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));
  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var slum_id = req.params.id;
          params.slum_id = slum_id;

          var sql_query = sql
            .select()
            .from(slum_table)
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
            sql_query.orderBy('slum_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
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

/**
 * TODO rename it to clinics
 * Update info of a slum
 */
router.put('/slum/:id', function (req, res) {
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
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.last_visit = moment();

          var name = body.name;
          if (name)
            params.name = name;

          var latitude= body.latitude;
          if (latitude)
            params.latitude = latitude;

          var longitude = body.longitude;
          if (longitude)
            params.longitude = longitude;

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;

          var active = body.active;
          if (active) {
            params.active = active;
          }

          var slum_id = req.params.id;

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql
            .update(slum_table, params)
            .where(sql('slum_id'), patient_id);
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
 * TODO rename it to clinics
 * Add new slum
 */
router.post('/slum/', function (req, res) {
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
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.slum_id = util.random_string(consts.id_random_string_length());

          var name = body.name;
          if (name)
            params.name = name;
          else
            res.status(errors.bad_request()).send('name should be not null');

          var latitude = body.latitude;
          if (latitude)
            params.latitude = latitude;

          var longitude = body.longitude;
          if (longitude)
            params.longitude = longitude;

          var country_id = body.country_id;
          if (country_id)
            params.country_id = country_id;
          else
            res.status(errors.bad_request()).send('country_id should be not null');

          var active = body.active;
          if (active)
            params.active = active;
          else
            res.status(errors.bad_request()).send('active should be not null');

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql.insert(slum_table, params);
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
 * Get list of countries
 */
router.get('/country/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var sql_query;
  console.log('All input queries: ' + JSON.stringify(param_query));

  //TODO check token validity first
  var token = param_query.token;

  if (!token) {
    //TODO return list of countries (name only)
    sql_query = sql.select('english_name').from(country_table);
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
        //var name = param_query.name;
        ////if (name) {
        ////  params.name = name;
        ////}

        var english_name = param_query.english_name;
        if (english_name) {
          params.english_name = english_name;
        }

        var native_name = param_query.native_name;
        if (native_name) {
          params.native_name = native_name;
        }

        var phone_country_code = param_query.phone_country_code;
        if (phone_country_code) {
          params.phone_country_code = phone_country_code;
        }

        var phone_number_format = param_query.phone_number_format;
        if (phone_number_format) {
          params.phone_number_format = phone_number_format;
        }

        var create_timestamp = param_query.create_timestamp;
        if (create_timestamp) {
          params.create_timestamp = create_timestamp;
        }

        sql_query = sql
          .select()
          .from(country_table)
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
          sql_query.orderBy('country_id');
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
 * Get country by id
 */
router.get('/country/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));
  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var country_id = req.params.id;
          params.country_id = country_id;

          var sql_query = sql
            .select()
            .from(country_table)
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
            sql_query.orderBy('country_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
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

/**
 * Update info of a country
 */
router.put('/country/:id', function (req, res) {
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
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var english_name = body.english_name;
          if (english_name)
            params.english_name = english_name;

          var native_name= body.native_name;
          if (native_name)
            params.native_name = native_name;

          var phone_country_code = body.phone_country_code;
          if (phone_country_code)
            params.phone_country_code = phone_country_code;

          var phone_number_format = body.phone_number_format;
          if (phone_number_format)
            params.phone_number_format = phone_number_format;

          var country_id = req.params.id;

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql
            .update(country_table, params)
            .where(sql('country_id'), patient_id);
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
 * Add new country
 */
router.post('/country/', function (req, res) {
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
    db.check_token_and_permission("add_slum", token, function (err, return_value, client) {
      if (!return_value) {                                            //false (no token)
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.add_slum === false) {          //false (no permission)
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.add_slum === true) {           //true
        console.log("return value: " + JSON.stringify(return_value));
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.country_id = util.random_string(consts.id_random_string_length());
          params.create_timestamp = moment();

          var english_name = body.english_name;
          if (english_name)
            params.english_name = english_name;
          else
            res.status(errors.bad_request()).send('english_name should be not null');

          var native_name = body.native_name;
          if (native_name)
            params.native_name = native_name;

          var phone_country_code = body.phone_country_code;
          if (phone_country_code)
            params.phone_country_code = phone_country_code;
          else
            res.status(errors.bad_request()).send('phone_country_code should be not null');

          var phone_number_format = body.phone_number_format;
          if (phone_number_format)
            params.phone_number_format = phone_number_format;

          //TODO select slum_id from the slum input from the request body
          //TODO create function to generate timestamps
          var sql_query = sql.insert(country_table, params);
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

module.exports = router;