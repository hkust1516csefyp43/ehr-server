var ba = require('basic-auth');
var fs = require('fs');
var rs = require('randomstring');

var endOfLine = require('os').EOL;
var start_time = {};
var port;
var query_count = 0;

/**
 * a list of string related utilities
 * @type {{extend_or_replace: Function}}
 */
module.exports = {
  /**
   * 1) append str2 to str1 if both not null
   * 2) return str2 if str1 is null and str2 is not
   * 3) return null if both str1 and str2 are null
   * @param str1
   * @param str2
   * @returns (check above)
   */
  extend_or_replace: function (str1, str2) {
    if (!str1) {
      return str2;
    } else if (str2) {
      return (str1 + str2);
    } else {
      return null;
    }
  },

  /**
   * decode basic auth into email and password
   * @param req
   * @returns {*|Object}
   */
  get_user: function (req) {
    return ba(req);
  },

  /**
   *
   * @param lat1 latitude of point 1
   * @param lon1 longitude of point 1
   * @param lat2 latitude of point 2
   * @param lon2 longitude of point 2
   * @param unit = "K" or "N"
   * @returns {number}
   */
  distance: function (lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  },

  mutually_exclusive: function () {
    var exclusivity = 0;
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) {
        exclusivity++;
      }
    }
    return exclusivity;
  },
  age_to_timestamp: function (age) {
    //TODO get current time

  },
  set_start_time: function (t) {
    start_time = t;
  },
  get_start_time: function () {
    return start_time;
  },
  set_port: function (p) {
    port = p;
  },
  get_port: function () {
    return port;
  },
  save_sql_query: function (sq) {
    fs.appendFile('../query.txt', sq + endOfLine, function (err) {
      if (err) {
        console.log("error witting file");
      } else {
        console.log("no error witting file");
      }
    });
    //TODO save it
    query_count++;
  },
  get_query_count: function () {
    return query_count;
  },
  reset_sync_data: function () {
    fs.unlink('../query.txt', function (err) {
      if (err) {
        console.log("error deleting file");
      } else {
        console.log("no error deleting file");
      }
    })
  },
  random_string: function (length) {
    return rs.generate(length);
  },
  lower_case_ify: function (s) {
    //TODO change all letters to lower case
  },
  upper_case_ify: function (S) {
    //TODO change all letters to upper case
  },
  english_character_ify: function (s) {
    //TODO remove all non a-z A-Z characters
  },
  millisecondTpString: function (ms) {
    var numyears = Math.floor(ms / 31536000000);
    var numdays = Math.floor((ms % 31536000000) / 86400000);
    var numhours = Math.floor(((ms % 31536000000) % 86400000) / 3600000);
    var numminutes = Math.floor((((ms % 31536000000) % 86400000) % 3600000) / 60000);
    var numseconds = Math.floor((((ms % 31536000000) % 86400000) % 3600000) % 60000 / 1000);
    var nummillisecond = Math.floor((((ms % 31536000000) % 86400000) % 3600000) % 60000 % 1000);
    var ops = "";
    if (numyears > 0) {
      ops = ops + numyears + " years ";
    }
    if (numdays > 0) {
      ops = ops + numdays + " days ";
    }
    if (numhours > 0) {
      ops = ops + numhours + " hours ";
    }
    if (numminutes > 0) {
      ops = ops + numminutes + " minutes ";
    }
    if (numseconds > 0) {
      ops = ops + numseconds + " seconds ";
    }
    if (nummillisecond > 0) {
      ops = ops + nummillisecond + " milliseconds";
    }
    return ops;
  }
};