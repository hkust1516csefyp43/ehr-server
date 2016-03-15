var ba = require('basic-auth');
var fs = require('fs');
//noinspection SpellCheckingInspection
var rs = require('randomstring');
var moment = require('moment');

var start_time = {};
var port;
var cloud_options = {
  host: 'ehr-api.herokuapp.com',
  path: '/v1/static/status'
};

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
  get_user_from_req: function (req) {
    "use strict";
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

  /**
   * Check if the arguments you have passed are mutually exclusive
   * @returns {number} >> 1 == 1 variable is not null, 2 == 2 variables are not null, etc.
   */
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
  random_string: function (length) {
    return rs.generate(length);
  },
  /**
   * return an object of duration
   * @param ms is the duration is integer
   * @returns {{}}
   */
  millisecondToJson: function (ms) {
    var numyears = Math.floor(ms / 31536000000);
    var numweeks = Math.floor((ms % 31536000000) / 604800000);
    var numdays = Math.floor(((ms % 31536000000) % 604800000) / 86400000);
    var numhours = Math.floor((((ms % 31536000000) % 604800000) % 86400000) / 3600000);
    var numminutes = Math.floor(((((ms % 31536000000) % 604800000) % 86400000) % 3600000) / 60000);
    var numseconds = Math.floor(((((ms % 31536000000) % 604800000) % 86400000) % 3600000) % 60000 / 1000);
    var nummillisecond = Math.floor(((((ms % 31536000000) % 604800000) % 86400000) % 3600000) % 60000 % 1000);
    var ops = {};
    ops.year = numyears;
    ops.week = numweeks;
    ops.day = numdays;
    ops.hour = numhours;
    ops.minute = numminutes;
    ops.second = numseconds;
    ops.millisecond = nummillisecond;
    return ops;
  },
  remove_line_breaker: function (s) {
    return s.replace(/(\r\n|\n|\r)/gm, "");
  },
  to_version_number: function (s) {
    return s.replace(/(\r\n|\n|\r|v)/gm, "");
  },
  normalize_country_string: function(s) {
    var slash = s.indexOf("/");
    var op = s.substring(slash+1, s.length);
    while (op.indexOf("_") >= 0) {
      op = op.replace("_", " ");
    }
    return op;
  },

  //Getters and setters

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
  get_cloud_options: function() {
    return cloud_options;
  },
  pre_suf_percent: function (s) {
    return '%' + s + '%';
  }
};