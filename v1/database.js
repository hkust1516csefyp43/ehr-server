var pg = require('pg');
var sql = require('sql-bricks-postgres');

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";
var localConString = "postgres://localhost/sight";

module.exports = {
    url: function () {
        return conString;
    },
    check_token_and_permission: function (permission, token, callback) {
        //TODO permission can be an array of permissions
        /**
         * Possibility 1: token does not exist >> 497
         * Possibility 2: user does not have (all) permission(s) >> 403
         * Possibility 3: no user (Bug) >> 400
         * Possibility 4: no role (Bug) >> 400
         * Possibility 5: no role column (Bug) >> 400
         * Possibility 6: token expired >> 498
         * Possibility 7: token (this variable) is null >> 499
         * Possibility 8: You have (all) permission(s) >> 200 (default)
         */
        pg.connect(this.url(), function (err, client, done) {
            if (err) {
                callback(null, client);
                return console.error('error fetching client from pool', err);
            } else {
                var sql_query;
                if (permission.isArray) {
                    sql_query = sql;
                    for (var i = 0; i < permission.length; i++) {
                        sql_query = sql_query.select('r.' + permission[i]);
                    }
                } else {
                    sql_query = sql.select('r.' + permission);
                }
                sql_query = sql_query
                    .select('t.user_id')
                    .select('t.expiry_timestamp')
                    .from('users AS u, token AS t, role AS r')
                    .where(sql('t.token'), token)
                    .where(sql('t.user_id'), sql('u.user_id'))
                    .where(sql('u.role_id'), sql('r.role_id'));

                console.log("The whole query in string: " + sql_query.toString());
                client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                    done();
                    if (err) {
                        callback(false, client);
                    } else {
                        console.log("the result: " + JSON.stringify(result.rows));
                        callback(result.rows[0], client);
                    }
                })
            }
        })
    }
};