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

var permission_read = 'emergency_contacts_read';
var permission_write = 'emergency_contacts_write';
var this_table = consts.table_emergency_contacts();
var this_pk = 'emergency_contact_id';

/**
 * Get all emergency contact of a user (uid)
 */
router.get('/:uid', function (req, res) {
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
          var sql_query = sql
            .select()
            .from(this_table)
            .where('user_id', req.params.uid);
          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 0) {
                  sent = true;
                  res.status(errors.not_found()).send('Cannot find user according to this id.');
                } else {
                  q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send("Something wrong (error code 10055)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows);
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

          var email_1 = req.body.email_1;
          if (email_1) {
            if (valid.email(email_1)) {
              params.email_1 = email_1;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid email_1');
            }
          }
          var email_2 = req.body.email_2;
          if (email_2) {
            if (valid.email(email_2)) {
              params.email_2 = email_2;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid email_2');
            }
          }
          var email_3 = req.body.email_3;
          if (email_3) {
            if (valid.email(email_3)) {
              params.email_3 = email_3;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('Invalid email_3');
            }
          }
          var phone_number_1 = req.body.phone_number_1;
          if (phone_number_1) {
            params.phone_number_1 = phone_number_1;
          }
          var phone_number_2 = req.body.phone_number_2;
          if (phone_number_2) {
            params.phone_number_2 = phone_number_2;
          }
          var phone_number_3 = req.body.phone_number_3;
          if (phone_number_3) {
            params.phone_number_3 = phone_number_3;
          }
          var name = req.body.name;
          if (name) {
            params.name = name;
          }
          var relationship_description = req.body.relationship_description;
          if (relationship_description) {
            params.relationship_description = relationship_description;
          }
          var remark = req.body.remark;
          if (remark) {
            params.remark = remark;
          }
          var user_id = req.body.user_id;
          if (user_id) {
            params.user_id = user_id;
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
                  q.save_sql_query(sql_query.toString(), return_value.user_id, function (err, return_value, client) {
                    if (err) {
                      if (!sent) {
                        sent = true;
                        res.status(errors.server_error()).send("Something wrong (error code 10056)");
                      }
                    }
                  });
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

            var email_1 = req.body.email_1;
            if (email_1) {
              if (valid.email(email_1)) {
                params.email_1 = email_1;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid email_1');
              }
            }
            var email_2 = req.body.email_2;
            if (email_2) {
              if (valid.email(email_2)) {
                params.email_2 = email_2;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid email_2');
              }
            }
            var email_3 = req.body.email_3;
            if (email_3) {
              if (valid.email(email_3)) {
                params.email_3 = email_3;
              } else if (!sent) {
                sent = true;
                res.status(errors.bad_request()).send('Invalid email_3');
              }
            }
            var phone_number_1 = req.body.phone_number_1;
            if (phone_number_1) {
              params.phone_number_1 = phone_number_1;
            }
            var phone_number_2 = req.body.phone_number_2;
            if (phone_number_2) {
              params.phone_number_2 = phone_number_2;
            }
            var phone_number_3 = req.body.phone_number_3;
            if (phone_number_3) {
              params.phone_number_3 = phone_number_3;
            }
            var name = req.body.name;
            if (name) {
              params.name = name;
            } else if (!sent) {
              sent = true;
              res.status(errors.bad_request()).send('name cannot be null');
            }
            var relationship_description = req.body.relationship_description;
            if (relationship_description) {
              params.relationship_description = relationship_description;
            }
            var remark = req.body.remark;
            if (remark) {
              params.remark = remark;
            }
            params.user_id = return_value.user_id;
            params.create_timestamp = moment();

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
                          res.status(errors.server_error()).send("Something wrong (error code 10057)");
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
                        res.status(errors.server_error()).send("Something wrong (error code 10058)");
                      }
                    }
                  });
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