var validator = require('validator');
var consts = require('./consts');
var _ = require('underscore');

/**
 * TODO a list of methods to do type validation (e.g. is that a valid email)
 */
module.exports = {
  email: function (e) {
    return validator.isEmail(e + '', null);
  },
  /**
   * Verify token
   * TODO change it back to return validator.isByteLength(t, consts.id_random_string_length(), consts.id_random_string_length());
   * @param t
   */
  token: function (t) {
    return validator.isByteLength(t, 0, 255);
  },
  password: function (p, callback) {
    if (validator.isLength(p + "", 6, 64)) {
      var letters = /^[0-9a-zA-Z!()+_.,`@#-]+$/;
      if (letters.test(p)) {  //A-OK
        callback(null, true);
      } else {
        callback('invalid password', false);
      }
    } else {
      callback('too long', false);
    }
  },
  timestamp: function (t) {

  },
  date: function (d) {
    return validator.isDate(d + "");
  },
  phone: function (p, c) {

  },
  true_or_false: function (b) {
    return validator.isBoolean(b + "");
  },
  sort_by: function (request, array, callback) {
    if (array.isArray) {
      for (var i = 0; i < array.length; i++) {
        if (request === array[i]) {
          callback(true);
        }
      }
      callback(false);
    } else
      callback(false);
  },
  empty_object: function (j) {
    return _.isEmpty(j);
  }
};