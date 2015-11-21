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
        return localConString;
    },
    check_permission: function (permission, token) {
        var output = {};
        pg.connect(this.url(), function (err, client, done) {
            if (err) {
                sent = true;
                return console.error('error fetching client from pool', err);
            } else {
                var params1 = {};
                params1.token = token;
                var sql_query1 = sql.select('user_id').from('token').where(params1);

                var params2 = {};
                params2.user_id = sql_query1;
                var sql_query2 = sql.select('role_id').from('User').where(params2);

                var params3 = {};
                params3.role_id = sql_query2;
                var sql_query3 = sql.select(permission).from('role').where(params3);

                console.log("The whole query in string: " + sql_query3.toString());
                console.log(JSON.stringify(sql_query3.toParams()));
                //return true;

                client.query(sql_query3.toParams().text, sql_query3.toParams().values, function (err, result) {
                    done();
                    if (err) {
                        sent = true;
                        return console.error('error fetching client from pool', err);
                    } else {
                        console.log("the result: " + JSON.stringify(result));
                        output = result.rows[0];
                        return output;
                    }
                })
            }
        });
    }
};