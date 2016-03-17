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
 * - Read
 * - Change the message
 * - Postpone
 */
router.put('/:id', function (req, res) {

});

/**
 * Create new notification for yourself
 */
router.put('/', function (req, res) {

});

/**
 * Delete a notification
 */

module.exports = router;