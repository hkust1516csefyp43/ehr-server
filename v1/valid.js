var validator = require('validator');

/**
 * TODO a list of methods to do type validation (e.g. is that a valid email)
 * @type {{email: module.exports.email, token: module.exports.token, password: module.exports.password, timestamp: module.exports.timestamp, date: module.exports.date, phone: module.exports.phone, sort_by: module.exports.sort_by}}
 */
module.exports = {
    email: function (e) {
        return validator.isEmail(e, null);
    },
    token: function (t) {
        return validator.isByteLength(t, 255, 255);
    },
    password: function (p) {

    },
    timestamp: function (t) {

    },
    date: function (d) {

    },
    phone: function (p, c) {

    },
    sort_by: function (request) {    //TODO check if this function works correctly
        for (var i = 0; i < arguments.length; i++) {
            if (request == arguments[i]) {
                return true;
            }
        }
        return false;
    }
};