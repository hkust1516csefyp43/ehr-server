/**
 * Database (dah)
 * http://stackoverflow.com/questions/10306185/nodejs-best-way-to-pass-common-variables-into-separate-modules
 *
 * TODO move all db components here
 * create connection pool
 * pass it as some kind of variable
 */

var pg = require('pg');

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";

//pg.connect(conString, function(err, client, done) {
//   if (err) {
//       return console.error('error: ', err);
//   }
//});

module.exports = {
    check_db_connection: function (e) {
        pg.connect(conString, function(err, client, done) {
            if (err) {
                return false;
            } else {
                return true;
            }
        });
    }
};