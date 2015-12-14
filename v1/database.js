var pg = require('pg');
var sql = require('sql-bricks-postgres');
var NodeCache = require("node-cache");

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";
var localConString = "postgres://localhost/sight";
var permissionCache = new NodeCache();

var aClient;

module.exports = {
  url: function () {
    return conString;
  },
  localUrl: function () {
    return localConString;
  },
  remoteUrl: function () {
    return conString;
  },
  //TODO cache key should be user_id instead of token???
  check_token_and_permission: function (permission, token, callback) {
    /**
     * Possibility 1: token does not exist >> 497
     * Possibility 2: user does not have (all) permission(s) >> 403
     * Possibility 3: no user (Bug) >> 400
     * Possibility 4: no role (Bug) >> 400
     * Possibility 5: no role column (Bug) >> 400
     * Possibility 6: token expired >> 498
     * Possibility 7: token (this variable) is null >> 499
     * Possibility 8: You have (all) permission(s) >> 200 (default)
     */
    permissionCache.get(token, function (err, value) {
      if (err || value === undefined) {
        pg.connect(module.exports.url(), function (err, client, done) {
          if (err) {
            callback(null, client);
            return console.error('error fetching client from pool', err);
          } else {
            aClient = client;
            var sql_query;
            //TODO get all permissions instead just those have been specified from db (and then cache the whole thing)
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
              .from('users AS u, token AS t, role AS r')
              .where(sql('t.token'), token)
              .where(sql('t.user_id'), sql('u.user_id'))
              .where(sql('u.role_id'), sql('r.role_id'));

            console.log("The whole query in string: " + sql_query.toString());
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              done();
              if (err) {
                callback(false, client);
              } else {
                console.log("the result: " + JSON.stringify(result.rows));
                permissionCache.set(token, result.rows[0], 0); //Cache
                callback(result.rows[0], client);
              }
            });
          }
        });
      } else if (aClient) {
        callback(value, aClient);
      } else {
        pg.connect(module.exports.url(), function (err, client, done) {
          if (!err && client) {
            callback(value, client);
          } else {
            //TODO other people need to handle this
            callback(value, null);
          }
        });
      }
    });
  },
};