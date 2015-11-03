var ba = require('basic-auth');

/**
 * TODO check if user exist
 * @param req is the whole requirement
 * @returns true is user exist, false otherwise
 */
function basic_auth_bool(req) {
    var user = get_user(req);
    return true;
}

function basic_auth_data(req) {
    var user = get_user(req);
}
/**
 * return username of password of user
 * @param req == request
 * @returns a object of user
 */
function get_user(req) {
    return ba(req);
}