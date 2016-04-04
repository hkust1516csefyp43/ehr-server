/**
 * Created by RickyLo on 4/4/2016.
 */
var pg = require('pg');
var moment = require('moment');
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
  return_token_info: function (token, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var sql_query;
        sql_query = sql
          .select()
          .from(consts.table_tokens())
          .where(sql('token'), token);

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
  return_user_info: function (username, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var sql_query;
        sql_query = sql
          .select('user_id', 'salt', 'processed_password')
          .from(consts.table_users())
          .where(sql('username'), username);

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
  update_access_token: function (access_token, device_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var params = {};
        params.token = access_token;
        var sql_query;
        sql_query = sql
          .update(consts.table_tokens(), params)
          .where({'device_id': device_id, 'is_access_token': 'true'})
          .returning('*');

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
  update_refresh_token: function (refresh_token, device_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var params = {};
        params.token = refresh_token;
        var sql_query;
        sql_query = sql
          .update(consts.table_tokens(), params)
          .where({'device_id': device_id, 'is_access_token': 'false'})
          .returning('*');

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
  insert_access_token: function (access_token, device_id, user_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var params = {};
        params.token = access_token;
        params.expiry_timestamp = moment().add(7, 'd');
        params.device_id = device_id;
        params.is_access_token = 'true';
        params.user_id = user_id;
        var sql_query;
        sql_query = sql.insert(consts.table_tokens(), params).returning('*');

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
  insert_refresh_token: function (refresh_token, device_id, user_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var params = {};
        params.token = refresh_token;
        params.expiry_timestamp = moment().add(7, 'd');
        params.device_id = device_id;
        params.is_access_token = 'false';
        params.user_id = user_id;
        var sql_query;
        sql_query = sql.insert(consts.table_tokens(), params).returning('*');

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
  }

}