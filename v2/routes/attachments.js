/**
 * Created by RickyLo on 22/3/2016.
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
    db.check_token_and_permission("attachments_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.attachments_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.attachments_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var cloudinary_url = req.query.cloudinary_url;
          if (cloudinary_url)
            params.cloudinary_url = cloudinary_url;

          var file_name = req.query.file_name;
          if (file_name)
            params.file_name = file_name;

          var user_id = req.query.user_id;
          if (user_id)
            params.user_id = user_id;

          console.log(params);

          var sql_query = sql
            .select()
            .from(consts.table_attachments())
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
            sql_query.orderBy('attachment_id');
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
                      res.status(errors.server_error()).send("Something wrong (error code 10004)");
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

/* GET */
router.get('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  console.log("id:",req.params.id);
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("attachments_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.attachments_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.attachments_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.attachment_id = req.params.id;

          var sql_query = sql.select().from(consts.table_attachments()).where(params);

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
                        res.status(errors.server_error()).send("Something wrong (error code 10009)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find attachment according to this id.');
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
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("attachments_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.attachments_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.attachments_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.user_id = return_value.user_id;
          params.create_timestamp = moment();
          params.attachment_id = util.random_string(consts.id_random_string_length());

          var cloudinary_url = body.cloudinary_url;
          if (cloudinary_url)
            params.cloudinary_url = cloudinary_url;

          var file_name = body.file_name;
          if (file_name)
            params.file_name = file_name;

          var file_in_base64 = body.file_in_base64;
          if (file_in_base64)
            params.file_in_base64 = file_in_base64;

          var sql_query = sql.insert(consts.table_attachments(), params).returning('*');
          console.log(sql_query.toString());

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
                      res.status(errors.server_error()).send("Something wrong (error code 10010)");
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
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("attachments_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.attachments_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.attachments_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var cloudinary_url = body.cloudinary_url;
          if (cloudinary_url)
            params.cloudinary_url = cloudinary_url;

          var file_name = body.file_name;
          if (file_name)
            params.file_name = file_name;

          var user_id = body.user_id;
          if (user_id)
            params.user_id = user_id;

          var file_in_base64 = body.file_in_base64;
          if (file_in_base64)
            params.file_in_base64 = file_in_base64;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_attachments(), params)
            .where(sql('attachment_id'), req.params.id)
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
                        res.status(errors.server_error()).send("Something wrong (error code 10011)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find attachment according to this id.');
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

/**
 * Delete attachment
 * TODO also actually delete the file
 * TODO better implementation:
 * just mark attachment as INACTIVE,and every time if someone try to access a
 * file that is inactive, return nothing and check if that file still exist. If
 * it does, remove it
 */
router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("attachments_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.attachments_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.attachments_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_attachments()).where(sql('attachment_id'), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10012)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find attachment according to this id.');
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