/**
 * TODO a list of methods to do type validation (e.g. is that a valid email)
 * @type {{email: module.exports.email, token: module.exports.token, password: module.exports.password, timestamp: module.exports.timestamp, date: module.exports.date, sort_by: module.exports.sort_by}}
 */
module.exports = {
    email: function (e) {

    },
    token: function (t) {

    },
    password: function (p) {

    },
    timestamp: function (t) {

    },
    date: function (d) {

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