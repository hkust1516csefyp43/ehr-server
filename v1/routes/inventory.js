/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var sql = require('sql-bricks-postgres');

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";

/**
 * Client instance
 */
//router.get('/dbdata', function (req, res) {
//    var client = new pg.Client(conString);
//    client.connect(function (err) {
//        if (err) {
//            res.send('could not connect to postgres');
//            return console.error('could not connect to postgres', err);
//        }
//        client.query('SELECT * FROM testing', function (err, result) {
//            if (err) {
//                res.send('error running query');
//                return console.error('error running query', err);
//            }
//            res.send(result.rows[0]);
//            client.end();
//        });
//    });
//});

/**
 * Client pooling - Much faster
 *
 * this initializes a connection pool
 * it will keep idle connections open for a (configurable) 30 seconds
 * and set a limit of 20 (also configurable)
 *
 * Time when hit frequently:
 * 1st: 2150.05 ms (Initiate during the first time, so much longer)
 * 2nd: 251.18 ms
 * 3rd: 250.77 ms
 * 4th: 249.05 ms
 * (1 minute break)
 * 5th: 2029.853 ms
 */

router.get('/dbdata2', function (req, res) {
    pg.connect(conString, function (err, client, done) {
        if (err) {
            res.send('error fetching client from pool');
            return console.error('error fetching client from pool', err);
        }
        var query = sql.select().from('patients').toString();
        client.query(query, function (err, result) {
            done();  //call `done()` to release the client back to the pool
            if (err) {
                res.send('error running query');
                return console.error('error running query', err);
            }
            res.send(result.rows[0].name);
        });
    })
});

router.get('/dbdata3', function (req, res) {
    pg.connect(conString, function (err, client, done) {
        if (err) {
            res.send('error fetching client from pool');
            return console.error('error fetching client from pool', err);
        }
        var table = 'patients; DROP table patients;';
        var query = sql.select().from(table).toString();
        console.log(query);
        client.query(query, function (err, result) {
            done();  //call `done()` to release the client back to the pool
            if (err) {
                res.send('error running query');
                return console.error('error running query', err);
            }
            console.log(JSON.stringify(result));
            res.send(result.rows);
        });
    })
});

router.get('/dbdata4', function (req, res) {
    pg.connect(conString, function (err, client, done) {
        if (err) {
            res.send('error fetching client from pool');
            return console.error('error fetching client from pool', err);
        }

        var table = 'patients; DROP TABLE patients;';
        client.query('SELECT * FROM patients WHERE name = $1', [table], function (err, result) {
            done();  //call `done()` to release the client back to the pool
            if (err) {
                res.send('error running query');
                return console.error('error running query', err);
            }
            console.log(JSON.stringify(result));
            res.send(result.rows);
        });
    })
});

router.get('/dbdata5', function (req, res) {
    pg.connect(conString, function (err, client, done) {
        if (err) {
            res.send('error fetching client from pool');
            return console.error('error fetching client from pool', err);
        }


        var query = client.query({
            text: 'SELECT * FROM patients WHERE name = $1',
            values: ['brianc@example.com']
        });

        query.on('row', function (row) {
            //do something w/ yer row data
            assert.equal('brianc', row.name);
        });


        var table = 'patients; DROP TABLE patients;';
        client.query('SELECT * FROM patients WHERE name = $1', [table], function (err, result) {
            done();  //call `done()` to release the client back to the pool
            if (err) {
                res.send('error running query');
                return console.error('error running query', err);
            }
            console.log(JSON.stringify(result));
            res.send(result.rows);
        });
    })
});

/* GET with item id */
router.get('/:id', function(req, res) {
    res.send('item id = ' + req.params.id);
});

/**
 * Get list of inventories
 */
router.get('/', function (req, res) {
    var sent = false;
    var params = {};
    var param_query = req.query;

    var token = param_query.token;
    if (!token) {
        res.status(401).send('Token is missing');
        sent = true;
    } else {
        params.token = token;
    }

    var name = param_query.name;
    if (name) {
        params.name = name;
    }

    var barcode_number = param_query.barcode_number;
    if (barcode_number) {
        params.barcode_number = barcode_number;
    }

    var batch_number = param_query.batch_number;
    if (batch_number) {
        params.batch_number = batch_number;
    }

    var name = param_query.name;
    if (name) {
        params.name = name;
    }

    //TODO receipt_id in Inventory_update table
    //TODO user_id in Inventory_update table
    //TODO name in Medication table
    //TODO form in Medication table

    //TODO need to combine medications with multiple batches into 1 JSON Object

    var sql_query = sql
        .select()
        .from('inventory')
        .where(params);

    var sort_by = param_query.sort_by;
    if (!sort_by) { //Default sort by
        sql_query.orderBy('inventory_id');
    } else {    //custom sort by
        //TODO check if custom sort by param is valid
        sql_query.orderBy(sort_by);
    }

    var limit = param_query.limit;
    if (limit) {
        sql_query.limit(limit);
    } else {    //Default limit
        sql_query.limit(100);
    }

    console.log(sql_query.toString());

    if (!sent) {
        res.send('testing stuff');
    }

});

module.exports = router;