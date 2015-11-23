/**
 * Database (dah)
 * http://stackoverflow.com/questions/10306185/nodejs-best-way-to-pass-common-variables-into-separate-modules
 *
 * TODO move all db components here
 * create connection pool
 * pass it as some kind of variable
 */

var pg = require('pg');
var sql = require('sql-bricks-postgres');

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";
var localConString = "postgres://localhost/sight";

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
    },
    url: function () {
        return conString;
    },
    check_permission: function (permission, token, callback) {
        //TODO synchronize this task and remove return true
        /**
         * Possibility 1: token does not exist >> 497
         * Possibility 2: user have no permission >> 403
         * Possibility 3: no user (Bug) >> 400
         * Possibility 4: no role (Bug) >> 400
         * Possibility 5: no role column (Bug) >> 400
         * Possibility 6: token expired >> 498
         * Possibility 7: token (this variable) is null >> 499
         * Possibility 8: You have permission >> 200 (default)
         */
            //return true;
        pg.connect(this.url(), function (err, client, done) {
            if (err) {
                callback(false);
                return console.error('error fetching client from pool', err);
            } else {
                var sql_query = sql
                    .select('r.' + permission)
                    .from('users AS u, token AS t, role AS r')
                    .where(sql('t.token'), token)
                    .where(sql('t.user_id'), sql('u.user_id'))
                    .where(sql('u.role_id'), sql('r.role_id'));

                console.log("The whole query in string: " + sql_query.toString());
                console.log(JSON.stringify(sql_query.toParams()));

                client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                    done();
                    if (err) {
                        callback(false);
                    } else {
                        console.log("the result: " + JSON.stringify(result.rows));
                        output = result.rows[0];
                        callback(output);
                    }
                })
            }
        })
    }
};