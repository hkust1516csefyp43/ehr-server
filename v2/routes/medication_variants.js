/**
 * Created by Louis on 16/3/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var sql = require('sql-bricks-postgres');

var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');

var permission_read = 'medication_variants_read';
var permission_write = 'medication_variants_write';
var this_table = consts.table_medication_variants();
var this_pk = 'medication_variant_id';

/**
 * Get list of medications variants (also search)
 */
router.get('/', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_read, token, function (err, return_value, client) {
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

          var name = req.query.name;
          if (name)
            params.name = name;

          var medication_id = req.query.medication_id;
          if (medication_id)
            params.medication_id = medication_id;

          var strength = req.query.strength;
          if (strength)
            params.strength = strength;

          var form = req.query.form;
          if (form)
            params.form = form;

          var stock = req.query.stock;
          if (stock)
            params.stock = stock;

          var user_id = req.query.user_id;
          if (user_id)
            params.user_id = user_id;

          var suitcase_id = req.query.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;

          var sql_query = sql.select()
            .from(this_table)
            .where(params);

          var offset = req.query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = req.query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy(this_pk);
          }

          var limit = req.query.limit;
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
 * Get a medication by id
 */
router.get('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_read, token, function (err, return_value, client) {
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
          params.medication_variant_id = req.params.id;

          var sql_query = sql
            .select()
            .from(this_table)
            .where(params);

          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find medication variant according to this id.');
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

router.put('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (valid.empty_object(req.body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_write, token, function (err, return_value, client) {
      if (!return_value && !sent) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value[permission_write] === false && !sent) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value[permission_write] === true) {
        if (return_value.expiry_timestamp < Date.now() && !sent) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var params = {};

          var form = req.body.form;
          if (form)
            params.form = form;

          var medication_id = req.body.medication_id;
          if (medication_id)
            params.medication_id = medication_id;

          var name = req.body.name;
          if (name)
            params.name = name;

          var stock = req.body.stock;
          if (stock)
            params.stock = stock;

          var strength = req.body.strength;
          if (strength)
            params.strength = strength;

          var suitcase_id = req.body.suitcase_id;
          if (suitcase_id)
            params.suitcase_id = suitcase_id;


          var user_id = req.body.user_id;
          if (user_id)
            params.user_id = user_id;

          //TODO brand (update the db first)

          if (valid.empty_object(params) && !sent) {
            sent = true;
            res.status(errors.bad_request()).send('You cannot edit nothing');
          }

          var sql_query = sql.update(this_table, params).where(sql('medication_variant_id'), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10084)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find medication according to this id.');
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

router.post('/', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  console.log(JSON.stringify(req.body));
  if (valid.empty_object(req.body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else {
    if (!token) {
      res.status(errors.token_missing()).send('Token is missing');
      sent = true;
    } else {
      db.check_token_and_permission(permission_write, token, function (err, return_value, client) {
        if (!return_value) {
          sent = true;
          res.status(errors.bad_request()).send('Token missing or invalid');
        } else if (return_value[permission_write] === false) {
          sent = true;
          res.status(errors.no_permission()).send('No permission');
        } else if (return_value[permission_write] === true) {
          if (return_value.expiry_timestamp < Date.now()) {
            sent = true;
            res.status(errors.access_token_expired()).send('Access token expired');
          } else {
            var params = {};
            params.medication_variant_id = util.random_string(consts.id_random_string_length());
            params.user_id = return_value.user_id;

            var medication_id = req.body.medication_id;
            if (medication_id)
              params.medication_id = medication_id;
            else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('medication_id cannot be null');
            }

            var strength = req.body.strength;
            if (strength)
              params.strength = strength;
            else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('strength cannot be null');
            }

            var form = req.body.form;
            if (form)
              params.form = form;
            else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('form cannot be null');
            }

            var stock = req.body.stock;
            if (stock)
              params.stock = stock;
            else {
              params.stock = 0;
            }

            var suitcase_id = req.body.suitcase_id;
            if (suitcase_id)
              params.suitcase_id = suitcase_id;
            else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('suitcase_id cannot be null');
            }

            var name = req.body.name;
            if (name)
              params.name = name;
            else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('name cannot be null');
            }

            var sql_query = sql.insert(this_table, params).returning('*');
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
                          res.status(errors.server_error()).send("Something wrong (error code 10085)");
                        }
                      }
                    });
                    sent = true;
                    res.json(result.rows[0]);
                  } else if (result.rows.length === 0) {
                    res.status(errors.not_found()).send('Insertion failed');
                  } else {
                    res.status(errors.server_error()).send('Sth weird is happening');
                  }
                }
              });
            }
          }
        }
      });
    }
  }
});

router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission(permission_write, token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value[permission_write] === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value[permission_write] === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(this_table).where(sql(this_pk), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10086)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find medication variant according to this id.');
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