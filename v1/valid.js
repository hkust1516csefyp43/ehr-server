var validator = require('validator');

/**
 * TODO a list of methods to do type validation (e.g. is that a valid email)
 */
module.exports = {
  email: function (e) {
    return validator.isEmail(e, null);
  },
  token: function (t) {
    return validator.isByteLength(t, 255, 255);
  },
  password: function (p, callback) {
    if (validator.isLength(p, 6, 64)) {
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

  },
  phone: function (p, c) {

  },
  sort_by: function (request, array, callback) {
    if (array.isArray) {
      for (var i = 0; i < array.length; i++) {
        if (request == array[i]) {
          callback(true);
        }
      }
      callback(false);
    } else
      callback(false);
  }
};