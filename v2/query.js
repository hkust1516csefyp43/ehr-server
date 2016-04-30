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
var endOfLine = require('os').EOL;
var query_count = 0;
var query_file_name;
var query_path;

/**
 * TODO change it to save queries to db
 * A bunch of utilities related to the db synchronization
 */
module.exports = {
  /**
   * save query into a txt file + append a ";" at the end
   * @param sq == the query string
   */
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
        sql_query = sql.
        insert(queries_table, params).returning('*');

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
  save_sql_query_2: function (sq) {
    //TODO save to db
    //1. connect to db
    //2. generate sql query
    //3. run that query
    //INSERT INTO queries ("random_string", user_id, create_timestamp, query);
    //4. output successful or not
    //TODO what if save failed? what can you do?
    
  },
  get_query_count: function () {
    return query_count;
  },
  /**
   * generate a new query file name + save the whole path
   */
  update_query_path: function () {
    query_file_name = '' + moment().year() + moment().month() + moment().date() + "_" + moment().hour() + moment().minute() + moment().second() + moment().millisecond() + "_" + moment().utcOffset() + "_" + util.random_string(16) + ".txt";
    query_path = "../query/" + query_file_name;
  },
  get_query_file_name: function () {
    return query_file_name;
  }
};