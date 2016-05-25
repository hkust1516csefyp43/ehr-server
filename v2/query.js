var fs = require('fs');
var moment = require('moment');
var pg = require('pg');
var util = require('../v2/utils');
var consts = require('../v2/consts');
var sql = require('sql-bricks-postgres');
var config = require('../config');
var queries_table = 'v2.queries';
var conString = config.cloud_pgsql_connection_string;
var localConString = config.local_pgsql_connection_string;
var onTheCloud = config.on_the_cloud;

/**
 * A bunch of utilities related to the db synchronization
 */
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
   * TODO check if this is correct
   * @param sq
   * @param user_id
   * @param callback
   */
  save_sql_query: function (sq, user_id, callback) {
    pg.connect(module.exports.url(), function (err, client, done) {
      if (err) {
        callback(err, null, client);
        return console.error('error fetching client from pool', err);
      } else {
        var params = {};
        params.query_id = util.random_string(consts.id_random_string_length());
        params.user_id = user_id;
        params.create_timestamp = moment();
        params.query = sq;
        var sql_query;
        sql_query = sql.insert(queries_table, params).returning('*');

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
};