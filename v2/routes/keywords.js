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

var permission_read = 'keywords_read';
var permission_write = 'keywords_write';
var this_table = consts.table_keywords();
var this_pk = 'keyword_id';

/**
 * Get list of keywords (also search)
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

          var chief_complain = req.query.chief_complain;
          if (chief_complain) {
            if (valid.true_or_false(chief_complain)) {
              params.chief_complain = chief_complain;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid chief_complain. Please enter either "true" or "false"');
            }
          }
          var diagnosis = req.query.diagnosis;
          if (diagnosis) {
            if (valid.true_or_false(diagnosis)) {
              params.diagnosis = diagnosis;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid diagnosis. Please enter either "true" or "false"');
            }
          }
          var screening = req.query.screening;
          if (screening) {
            if (valid.true_or_false(screening)) {
              params.chief_complain = screening;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid screening. Please enter either "true" or "false"');
            }
          }
          var allergen = req.query.allergen;
          if (allergen) {
            if (valid.true_or_false(allergen)) {
              params.allergen = allergen;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid allergen. Please enter either "true" or "false"');
            }
          }
          var follow_up = req.query.follow_up;
          if (follow_up) {
            if (valid.true_or_false(follow_up)) {
              params.chief_complain = follow_up;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid follow_up. Please enter either "true" or "false"');
            }
          }
          var advice = req.query.advice;
          if (advice) {
            if (valid.true_or_false(advice)) {
              params.advice = advice;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid advice. Please enter either "true" or "false"');
            }
          }
          var education = req.query.education;
          if (education) {
            if (valid.true_or_false(education)) {
              params.education = education;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid education. Please enter either "true" or "false"');
            }
          }
          var general = req.query.general;
          if (general) {
            if (valid.true_or_false(general)) {
              params.general = general;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid general. Please enter either "true" or "false"');
            }
          }
          var medication_route = req.query.medication_route;
          if (medication_route) {
            if (valid.true_or_false(medication_route)) {
              params.medication_route = medication_route;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_route. Please enter either "true" or "false"');
            }
          }
          var medication_form = req.query.medication_form;
          if (medication_form) {
            if (valid.true_or_false(medication_form)) {
              params.medication_form = medication_form;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_form. Please enter either "true" or "false"');
            }
          }
          var unit = req.query.unit;
          if (unit) {
            if (valid.true_or_false(unit)) {
              params.unit = unit;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid unit. Please enter either "true" or "false"');
            }
          }
          var investigation = req.query.investigation;
          if (investigation) {
            if (valid.true_or_false(investigation)) {
              params.investigation = investigation;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid investigation. Please enter either "true" or "false"');
            }
          }
          var medication_frequency = req.query.medication_frequency;
          if (medication_frequency) {
            if (valid.true_or_false(medication_frequency)) {
              params.medication_frequency = medication_frequency;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_frequency. Please enter either "true" or "false"');
            }
          }
          var relationship_type = req.query.relationship_type;
          if (relationship_type) {
            if (valid.true_or_false(relationship_type)) {
              params.relationship_type = relationship_type;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid relationship_type. Please enter either "true" or "false"');
            }
          }

          var sql_query = sql.select()
            .from(this_table)
            .where(params);

          var keyword = req.query.keyword;
          if (keyword)
            sql_query.where(sql.ilike('keyword', util.pre_suf_percent(keyword)));

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
 * Get a keyword by id
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
          params[this_pk] = req.params.id;

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
                  q.save_sql_query(sql_query.toString());
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

          var chief_complain = req.body.chief_complain;
          if (chief_complain) {
            if (valid.true_or_false(chief_complain)) {
              params.chief_complain = chief_complain;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid chief_complain. Please enter either "true" or "false"');
            }
          }
          var diagnosis = req.body.diagnosis;
          if (diagnosis) {
            if (valid.true_or_false(diagnosis)) {
              params.diagnosis = diagnosis;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid diagnosis. Please enter either "true" or "false"');
            }
          }
          var screening = req.body.screening;
          if (screening) {
            if (valid.true_or_false(screening)) {
              params.chief_complain = screening;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid screening. Please enter either "true" or "false"');
            }
          }
          var allergen = req.body.allergen;
          if (allergen) {
            if (valid.true_or_false(allergen)) {
              params.allergen = allergen;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid allergen. Please enter either "true" or "false"');
            }
          }
          var follow_up = req.body.follow_up;
          if (follow_up) {
            if (valid.true_or_false(follow_up)) {
              params.chief_complain = follow_up;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid follow_up. Please enter either "true" or "false"');
            }
          }
          var advice = req.body.advice;
          if (advice) {
            if (valid.true_or_false(advice)) {
              params.advice = advice;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid advice. Please enter either "true" or "false"');
            }
          }
          var education = req.body.education;
          if (education) {
            if (valid.true_or_false(education)) {
              params.education = education;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid education. Please enter either "true" or "false"');
            }
          }
          var general = req.body.general;
          if (general) {
            if (valid.true_or_false(general)) {
              params.general = general;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid general. Please enter either "true" or "false"');
            }
          }
          var medication_route = req.body.medication_route;
          if (medication_route) {
            if (valid.true_or_false(medication_route)) {
              params.medication_route = medication_route;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_route. Please enter either "true" or "false"');
            }
          }
          var medication_form = req.body.medication_form;
          if (medication_form) {
            if (valid.true_or_false(medication_form)) {
              params.medication_form = medication_form;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_form. Please enter either "true" or "false"');
            }
          }
          var unit = req.body.unit;
          if (unit) {
            if (valid.true_or_false(unit)) {
              params.unit = unit;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid unit. Please enter either "true" or "false"');
            }
          }
          var investigation = req.body.investigation;
          if (investigation) {
            if (valid.true_or_false(investigation)) {
              params.investigation = investigation;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid investigation. Please enter either "true" or "false"');
            }
          }
          var medication_frequency = req.body.medication_frequency;
          if (medication_frequency) {
            if (valid.true_or_false(medication_frequency)) {
              params.medication_frequency = medication_frequency;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid medication_frequency. Please enter either "true" or "false"');
            }
          }
          var relationship_type = req.body.relationship_type;
          if (relationship_type) {
            if (valid.true_or_false(relationship_type)) {
              params.relationship_type = relationship_type;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid relationship_type. Please enter either "true" or "false"');
            }
          }

          if (valid.empty_object(params) && !sent) {
            sent = true;
            res.status(errors.bad_request()).send('You cannot edit nothing');
          }

          var sql_query = sql.update(this_table, params).where(sql(this_pk), req.params.id).returning('*');
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
                  res.status(errors.not_found()).send('Cannot find keyword according to this id.');
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
            params[this_pk] = util.random_string(consts.id_random_string_length());

            var keyword = req.body.keyword;
            if (keyword) {
              params.keyword = keyword;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('keyword cannot be null');
            }
            var chief_complain = req.body.chief_complain;
            if (chief_complain) {
              if (valid.true_or_false(chief_complain)) {
                params.chief_complain = chief_complain;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid chief_complain. Please enter either "true" or "false"');
              }
            }
            var diagnosis = req.body.diagnosis;
            if (diagnosis) {
              if (valid.true_or_false(diagnosis)) {
                params.diagnosis = diagnosis;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid diagnosis. Please enter either "true" or "false"');
              }
            }
            var screening = req.body.screening;
            if (screening) {
              if (valid.true_or_false(screening)) {
                params.chief_complain = screening;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid screening. Please enter either "true" or "false"');
              }
            }
            var allergen = req.body.allergen;
            if (allergen) {
              if (valid.true_or_false(allergen)) {
                params.allergen = allergen;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid allergen. Please enter either "true" or "false"');
              }
            }
            var follow_up = req.body.follow_up;
            if (follow_up) {
              if (valid.true_or_false(follow_up)) {
                params.chief_complain = follow_up;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid follow_up. Please enter either "true" or "false"');
              }
            }
            var advice = req.body.advice;
            if (advice) {
              if (valid.true_or_false(advice)) {
                params.advice = advice;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid advice. Please enter either "true" or "false"');
              }
            }
            var education = req.body.education;
            if (education) {
              if (valid.true_or_false(education)) {
                params.education = education;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid education. Please enter either "true" or "false"');
              }
            }
            var general = req.body.general;
            if (general) {
              if (valid.true_or_false(general)) {
                params.general = general;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid general. Please enter either "true" or "false"');
              }
            }
            var medication_route = req.body.medication_route;
            if (medication_route) {
              if (valid.true_or_false(medication_route)) {
                params.medication_route = medication_route;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid medication_route. Please enter either "true" or "false"');
              }
            }
            var medication_form = req.body.medication_form;
            if (medication_form) {
              if (valid.true_or_false(medication_form)) {
                params.medication_form = medication_form;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid medication_form. Please enter either "true" or "false"');
              }
            }
            var unit = req.body.unit;
            if (unit) {
              if (valid.true_or_false(unit)) {
                params.unit = unit;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid unit. Please enter either "true" or "false"');
              }
            }
            var investigation = req.body.investigation;
            if (investigation) {
              if (valid.true_or_false(investigation)) {
                params.investigation = investigation;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid investigation. Please enter either "true" or "false"');
              }
            }
            var medication_frequency = req.body.medication_frequency;
            if (medication_frequency) {
              if (valid.true_or_false(medication_frequency)) {
                params.medication_frequency = medication_frequency;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid medication_frequency. Please enter either "true" or "false"');
              }
            }
            var relationship_type = req.body.relationship_type;
            if (relationship_type) {
              if (valid.true_or_false(relationship_type)) {
                params.relationship_type = relationship_type;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid relationship_type. Please enter either "true" or "false"');
              }
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
                    q.save_sql_query(sql_query.toString());
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
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find keyword according to this id.');
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