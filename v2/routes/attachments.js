/**
 * Created by RickyLo on 16/3/2016.
 */
/**
 * Created by RickyLo on 12/3/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var wait = require('wait.for');

var util = require('../utils');
var errors = require('../errors');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');
var attachments_table = 'v2.attachments';

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
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.attachments_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var attachment_id = req.query.id;
          if (attachment_id) {
            params.attachment_id = attachment_id;
          }
          var cloudinary_url =req.query.cloudinary_url;
          if (cloudinary_url) {
            params.cloudinary_url = cloudinary_url;
          }
          var file_name =req.file_name;
          if (file_name) {
            params.file_name = file_name;
          }
          var user_id =req.query.user_id;
          if (user_id) {
            params.user_id = user_id;
          }
          var create_timestamp =req.create_timestamp;
          if (create_timestamp) {
            params.create_timestamp = create_timestamp;
          }
          console.log(params);

          var sql_query = sql
            .select()
            .from(attachments_table)
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
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.attachments_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var attachment_id = req.params.id;
          params.attachment_id = attachment_id;

          var sql_query = sql
            .select()
            .from(attachments_table)
            .where(params);

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var order_by = param_query.order_by;
          if (order_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(order_by);
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
    })
  }
});

/* POST */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_query));
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
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.attachments_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var attachment_id = body.attachment_id;
          if (attachment_id)
            params.attachment_id = attachment_id;
          else
            params.attachment_id = util.random_string(consts.id_random_string_length());

          var cloudinary_url = body.cloudinary_url;
          if (cloudinary_url)
            params.cloudinary_url = cloudinary_url;

          var file_name = body.file_name;
          if (file_name)
            params.file_name = file_name;

          var user_id = body.user_id;
          if (user_id)
            params.user_id = user_id;
          else
            res.status(errors.bad_request()).send('user_id should be not null');

          var create_timestamp = moment();
          if (create_timestamp)
            params.create_timestamp = create_timestamp;


          var sql_query = sql.insert(attachments_table, params).returning('*');
          console.log(sql_query.toString());
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
    });
  }
});

/*PUT*/
router.put('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_query));
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
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.attachments_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var attachment_id = req.params.id;
          params.attachment_id = attachment_id;

          var cloudinary_url = body.cloudinary_url;
          if (cloudinary_url)
            params.cloudinary_url = cloudinary_url;

          var file_name = body.file_name;
          if (file_name)
            params.file_name = file_name;

          var user_id = body.user_id;
          if (user_id)
            params.user_id = user_id;

          var create_timestamp = body.create_timestamp;
          if (create_timestamp)
            params.create_timestamp = create_timestamp;

          var sql_query = sql
            .update(attachments_table, params)
            .where(sql('attachment_id'), attachment_id).returning('*');
          console.log(sql_query.toString());
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
    });
  }
});

module.exports = router;