var pg = require('pg');
var sql = require('sql-bricks-postgres');
var config = require('../config');
var consts = require('./consts');
var conString = config.cloud_pgsql_connection_string;
var localConString = config.local_pgsql_connection_string;
var onTheCloud = config.on_the_cloud;
var aClient;

module.exports = {
  url: function () {
    if (onTheCloud === false)
      return localConString;
    else
      return conString;
  },
  localUrl: function () {
    return localConString;
  },
  remoteUrl: function () {
    return conString;
  },
  /**
   * The callback returns a specific err object
   * @param permission that it needs
   * @param access token of the user
   * @param callback(err, return_value, client):
   * err: dah;
   * return value: an object of all permissions and expiry timestamp of token;
   * client: a client object (reduce time of getting another client)
   * TODO get all permissions instead just those have been specified from db (and then cache the whole thing)
   */
  check_token_and_permission: function (permission, token, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        aClient = client;
        var sql_query;
        if (permission.isArray) {
          sql_query = sql;
          for (var i = 0; i < permission.length; i++) {
            sql_query = sql_query.select('r.' + permission[i]);
          }
        } else {
          sql_query = sql.select('r.' + permission);
        }
        sql_query = sql_query
          .select('u.*')
          .select('t.expiry_timestamp')
          .from('v2.users AS u, v2.tokens AS t, v2.roles AS r')
          .where(sql('t.token'), token)
          .where(sql('t.user_id'), sql('u.user_id'))
          .where(sql('u.role_id'), sql('r.role_id'))
          .where(sql('t.is_access_token'), sql('true'));

        console.log("The whole query in string: " + sql_query.toString());
        var sqp = sql_query.toParams();
        client.query(sqp.text, sqp.values, function (err, result) {
          done();
          if (err) {
            console.log("some error: " + err);
            callback(err, false, client);
          } else {
            console.log("the result: " + JSON.stringify(result.rows));
            callback(null, result.rows[0], client);
          }
        });
      }
    });
  },
  /**
   * get the is_global value of a clinic
   * @param clinic_id of the clinic
   * @param callback
   */
  is_clinic_global: function (clinic_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        aClient = client;
        var sql_query = sql.select('is_global').from(consts.table_clinics()).where(sql("clinic_id"), clinic_id.toString());
        console.log(sql_query.toString());
        client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
          done();
          if (err) {
            console.log("some error: " + err);
            callback(err, false, client);
          } else {
            console.log("the result: " + JSON.stringify(result.rows));
            callback(null, result.rows[0], client);
          }
        });
      }
    });
  },
  /**
   * Check if this device_id is in the blocked_device table
   * @param device_id
   * @param err
   * @param callback
   */
  is_this_device_blocked: function (device_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var sql_query = sql
          .select('blocked_device_id')
          .from(consts.table_blocked_devices())
          .where('blocked_device_id', device_id);
        client.query(sql_query.toParams().text, sql_query.toParams.values, function (err, result) {
          if (err) {
            console.log("some error: " + err);
            callback(err, false, client);
          } else {
            console.log("the result: " + JSON.stringify(result.rows));
            callback(null, result.rows[0].device_id, client);
          }
        });
      }
    });
  }
};