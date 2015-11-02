/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = "postgres://zepqdcvrvhsmgv:k4LI83mCEcXt3v1RFKv20AOjmr@ec2-54-83-29-15.compute-1.amazonaws.com:5432/d3n867p1e7dkp?ssl=true";

/**
 * Client instance
 */
router.get('/dbdata', function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function (err) {
        if (err) {
            res.send('could not connect to postgres');
            return console.error('could not connect to postgres', err);

        }
        //client.
        client.query('select * from testing', function (err, result) {
            if (err) {
                res.send('error running query');
                return console.error('error running query', err);
            }
            //console.log(result.rows[0].theTime);
            res.send(result.rows[0].gender);
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            client.end();
        });
    });
});

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
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM patients', function (err, result) {
            done();  //call `done()` to release the client back to the pool
            if (err) {
                return console.error('error running query', err);
            }
            res.send(result.rows);
        });
    })
});

/* GET with item id */
router.get('/:id', function(req, res) {
    res.send('item id = ' + req.params.id);
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Inventory' });
});

module.exports = router;