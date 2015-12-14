var fs = require('fs');
var moment = require('moment');
var util = require('../v1/utils');

var endOfLine = require('os').EOL;
var query_count = 0;
var query_file_name;
var query_path;

module.exports = {
  save_sql_query: function (sq) {
    fs.appendFile(query_path, sq + ';' + endOfLine, function (err) {
      if (err) {
        console.log("error witting file");
      }
    });
    query_count++;
  },
  get_query_count: function () {
    return query_count;
  },
  update_query_path: function () {
    query_file_name = '' + moment().year() + moment().month() + moment().date() + "_" + moment().hour() + moment().minute() + moment().second() + moment().millisecond() + "_" + moment().utcOffset() + "_" + util.random_string(16) + ".txt";
    query_path = "../query/" + query_file_name;
  },
  get_query_file_name: function () {
    return query_file_name;
  }
};