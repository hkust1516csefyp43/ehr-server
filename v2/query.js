var fs = require('fs');
var moment = require('moment');
var util = require('../v1/utils');

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
  save_sql_query: function (sq) {
    fs.appendFile(query_path, sq + ';' + endOfLine, function (err) {
      if (err) {
        console.log("error witting file");
      }
    });
    query_count++;
  },
  save_sql_query_2: function (sq) {
    //TODO save to db
    //1. connect to db
    //2. generate sql query
    //3. run that query
    //4. output successful or not
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