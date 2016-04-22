var validator = require('validator');
var consts = require('./consts');
var _ = require('underscore');

/**
 * TODO a list of methods to do type validation (e.g. is that a valid email)
 */
module.exports = {
  email: function (e) {
    //TODO validator have bug?
    /**
     * 2016-04-13T10:51:13.748858+00:00 app[web.1]: /app/node_modules/validator/lib/util/merge.js:12
     2016-04-13T10:51:13.748868+00:00 app[web.1]:     if (typeof obj[key] === 'undefined') {
2016-04-13T10:51:13.748870+00:00 app[web.1]:                   ^
2016-04-13T10:51:13.748871+00:00 app[web.1]:
2016-04-13T10:51:13.748871+00:00 app[web.1]: TypeError: Cannot read property 'allow_display_name' of null
2016-04-13T10:51:13.748872+00:00 app[web.1]:     at merge (/app/node_modules/validator/lib/util/merge.js:12:19)
2016-04-13T10:51:13.748873+00:00 app[web.1]:     at Object.isEmail (/app/node_modules/validator/lib/isEmail.js:42:33)
2016-04-13T10:51:13.748874+00:00 app[web.1]:     at Object.module.exports.email (/app/v2/valid.js:10:22)
2016-04-13T10:51:13.748874+00:00 app[web.1]:     at /app/v2/routes/patients.js:494:23
2016-04-13T10:51:13.748875+00:00 app[web.1]:     at null.callback (/app/v2/database.js:67:13)
2016-04-13T10:51:13.748876+00:00 app[web.1]:     at Query.handleReadyForQuery (/app/node_modules/pg/lib/query.js:89:10)
2016-04-13T10:51:13.748877+00:00 app[web.1]:     at null.<anonymous> (/app/node_modules/pg/lib/client.js:163:19)
2016-04-13T10:51:13.748877+00:00 app[web.1]:     at emitOne (events.js:95:20)
2016-04-13T10:51:13.748878+00:00 app[web.1]:     at emit (events.js:182:7)
2016-04-13T10:51:13.748879+00:00 app[web.1]:     at TLSSocket.<anonymous> (/app/node_modules/pg/lib/connection.js:109:12)
     */
    // return validator.isEmail(e + '', null);
    return true;
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
    return false;
    // return _.isEmpty(j);
  }
};