/**
 * Created by RickyLo on 28/3/2016.
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
    db.check_token_and_permission("related_data_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.related_data_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.related_data_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var consultation_id = req.query.consultation_id;
          if (consultation_id)
            params.consultation_id = consultation_id;

          var category = req.query.category;
          if (category)
            params.category = category;

          console.log(params);

          var sql_query = sql
            .select()
            .from(consts.table_related_data())
            .where(params);

          var data = req.query.data;
          if (data)
            sql_query.where(sql.ilike('data', util.pre_suf_percent(data)));

          var remark = req.query.remark;
          if (remark)
            sql_query.where(sql.ilike('remark', util.pre_suf_percent(remark)));

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('rd_id');
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
    db.check_token_and_permission("related_data_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.related_data_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.related_data_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          params.rd_id = req.params.id;

          var sql_query = sql.select().from(consts.table_related_data()).where(params);

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
                  res.status(errors.not_found()).send('Cannot find related_data according to this id.');
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
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("related_data_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.related_data_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.related_data_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.rd_id = util.random_string(consts.id_random_string_length());

          var data = body.data;
          if (data)
            params.data = data;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('data should be not null');
          }

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var consultation_id = body.consultation_id;
          if (consultation_id)
            params.consultation_id = consultation_id;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('consultation_id should be not null');
          }

          var category = body.category;
          if (category)
            params.category = category;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('category should be not null');
          }

          var sql_query = sql.insert(consts.table_related_data(), params).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10123)");
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
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("related_data_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.related_data_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.related_data_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          var data = body.data;
          if (data)
            params.data = data;

          var remark = body.remark;
          if (remark)
            params.remark = remark;

          var consultation_id = body.consultation_id;
          if (consultation_id)
            params.consultation_id = consultation_id;

          var category = body.category;
          if (category)
            params.category = category;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_related_data(), params)
            .where(sql('rd_id'), req.params.id)
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
                        res.status(errors.server_error()).send("Something wrong (error code 10124)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find related_data according to this id.');
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

router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("related_data_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.related_data_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.related_data_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_related_data()).where(sql('rd_id'), req.params.id).returning('*');
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
                        res.status(errors.server_error()).send("Something wrong (error code 10125)");
                      }
                    }
                  });
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find related_data according to this id.');
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