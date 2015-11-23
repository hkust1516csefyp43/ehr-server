var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var db = require('../database');
var sql = require('sql-bricks-postgres');


var default_table = 'chief_complain';

/**
 * Get list of chief complains
 */
router.get('/', function (req, res) {
    var sent = false;
    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    //TODO check token validity first
    var token = param_query.token;

    if (!token) {
        res.status(499).send('Token is missing');
        sent = true;
    } else {
        var x = db.check_permission("reset_any_password", token);
        console.log(x);
        console.log(JSON.stringify(x));
        if (!x) {
            res.status(400).send("error");
            sent = true;
        } else {
            if (x.reset_any_password == false) {
                res.status(403).send('No permission');
                sent = true;
            } else {
                var diagnosis_id = param_query.diagnosis_id;
                if (diagnosis_id) {
                    params.diagnosis_id = diagnosis_id;
                }

                var name = param_query.name;
                if (name) {
                    params.name = name;
                }

                var sql_query = sql
                    .select()
                    .from(default_table)
                    .where(params);

                var limit = param_query.limit;
                if (limit) {
                    sql_query.limit(limit);
                } else {    //Default limit
                    sql_query.limit(100);
                }

                var offset = param_query.offset;
                if (offset) {
                    sql_query.offset(offset);
                }

                var sort_by = param_query.sort_by;
                if (!sort_by) { //Default sort by
                    sql_query.orderBy('chief_complain_id');
                } else {    //custom sort by
                    //TODO check if custom sort by param is valid
                    sql_query.orderBy(sort_by);
                }

                console.log(sql_query.toString());

                pg.connect(db.url(), function (err, client, done) {
                    if (err) {
                        res.send('error fetching client from pool 1');
                        sent = true;
                        return console.error('error fetching client from pool', err);
                    } else {
                        client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                            done();
                            if (err) {
                                res.send('error fetching client from pool 2');
                                sent = true;
                                return console.error('error fetching client from pool', err);
                            } else {
                                res.json(result.rows);
                            }
                        })
                    }
                });
            }
        }
    }
});

/**
 * Get a chief complain by id
 */
router.get('/:id', function (req, res) {
    //console.log(req);
    var sent = false;
    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    var token = param_query.token;
    if (!token) {
        res.status(499).send('Token is missing');
        sent = true;
    } else {
        params.token = token;
    }

    var id = req.params.id;
    params.id = id;

    var sql_query = sql.select().from(default_table).where(params).toParams();

    console.log(JSON.stringify(sql_query.text));
    console.log(JSON.stringify(sql_query.values));

    if (!sent) {
        res.send('testing stuff');
    }
});

/**
 * Update chief complain with id
 */
router.put('/:id', function (req, res) {
    res.send('in progress');
});

/**
 * Add new chief complain
 */
router.post('/', function (req, res) {
    //all content should be stored in body
    res.send('in progress');
});

/**
 * delete chief complain
 */
router.delete('/:id', function (req, res) {
    res.send('in progress');
});

module.exports = router;