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
 * Get list of your notifications (based on your token)
 */
router.get('/', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    console.log("1");
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else if (!valid.token(token)) {
    console.log("2");
    res.status(errors.bad_request()).send('Token is not token');
    sent = true;
  } else {
    db.check_token_and_permission("notifications_read", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.notifications_read === false) {
        sent = true;
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.notifications_read === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          //select v2.notifications.* from v2.notifications, v2.tokens where v2.notifications.user_id=v2.tokens.user_id and v2.tokens.token='3' and v2.tokens.is_access_token=true
          var sql_query = sql
            .select(consts.table_notifications() + ".*")
            .from(consts.table_notifications())
            .from(consts.table_tokens())
            .where(sql(consts.table_notifications() + ".user_id"), sql(consts.table_tokens() + ".user_id"))
            .where(consts.table_tokens() + ".token", token)
            .where(consts.table_tokens() + ".is_access_token", sql('true'));

          console.log("The whole query in string: " + sql_query.toString());
          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                sent = true;
                res.send('error fetching client from pool');
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
 * Edit your notification
 * Won't check if you are editing your own notifications because you can only get your own notifications anyway
 * only check permission (notifications_write)
 * - Read
 * - Change the message
 * - Postpone
 */
router.put('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission('notifications_write', token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.notifications_write === false) {
        sent = true;
        res.status(errors.no_permission).send('No permission');
      } else if (return_value.notifications_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          console.log("body: " + JSON.stringify(req.body));

          var params = {};

          var message = req.body.message;
          if (message) {
            params.message = message;
          }
          var remind_date = req.body.remind_date;
          if (remind_date) {
            if (valid.date(remind_date)) {
              params.remind_date = remind_date;
            } else {
              sent = true;
              res.status(errors.bad_request()).send('Invalid date');
            }
          }
          var read = req.body.read;
          if (read) {
            params.read = read;
            if (valid.true_or_false(read)) {
              params.read = read;
            } else {
              sent = true;
              res.status(errors.bad_request()).send('Invalid read. Please enter either "true" or "false"');
            }
          }

          var sql_query = sql.update(consts.table_notifications(), params).where(sql('notification_id'), req.params.id).returning('*');
          console.log("The whole query in string: " + sql_query.toString());

          if (sent === false) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                sent = true;
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length == 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length == 0) {
                  res.status(errors.not_found()).send('Cannot find notification according to this id.');
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

/**
 * Create new notification for yourself
 */
router.post('/', function (req, res) {

});

/**
 * Delete a notification
 */

module.exports = router;