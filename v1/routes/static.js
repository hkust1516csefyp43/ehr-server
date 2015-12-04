/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var db = require('../database');
var sql = require('sql-bricks-postgres');
var www = require('../../bin/www');
var shell = require('shelljs');

/**
 * Send apk for installation
 * No auth, no checking, no instruction, just the apk
 */
router.get('/apk/', function (req, res) {
  //http://stackoverflow.com/questions/9321027/how-to-send-files-with-node-js
  res.send('apk');
});

/**
 * Return a list of static objects (countries, slums, etc)
 */
router.get('/update/:id', function (req, res) {
  var type = req.params.id;
  if (type == 1) {                              //country
    res.json('[{"country_id":1,"english_name":"Hong Kong","phone_country_code":852},{"country_id":2,"english_name":"China","phone_country_code":86},{"country_id":3,"english_name":"Macau","phone_country_code":853},{"country_id":4,"english_name":"Cambodia","phone_country_code":855}]');
  } else if (type == 2) {                       //slum
    res.send('pretend this is a JSONArray of slums');
  } else {
    res.status(404).send('I have no idea what you are talking about');
  }
  /**
   * TODO s
   * 1.   id == 1 >> country json
   *      id == 2 >> slums json
   * 2. retrieve the whole country table from json
   */
});

/**
 * TODO go to the specific table and find out the largest last_update timestamp
 * params:
 *
 * for front end to check if they need to update their local static data
 * e.g. country list, slum list, etc
 */
router.get('/update/', function (req, res) {
  var table_id = req.query.table_id;
  var last_update = req.query.last_update;
  res.send('Checking table ' + table_id + ' for records after ' + last_update + ' ......');
});

/**
 * TODO Upload image and return name/path/???
 */
router.post('/image/', function (req, res) {
  res.send('In progress');
});

/**
 * TODO return image
 * cache image for 3 minutes?
 */
router.get('/image/:id', function (req, res) {
  //http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
  res.send('In progress');
});

router.put('/time', function (req, res) {
  //TODO save time as some sort of global variable
});

/**
 * From RPi to heroku: POST queries to the cloud
 * TODO turn txt into a JSON array (in body)
 */
router.post('/query/', function (req, res) {
  res.send("In progress");
});

/**
 * At heroku: someone is PUTing a query to me
 */
router.put('/query/', function (req, res) {
  res.send("In progress");
  pg.connect(db.url(), function (err, client, done) {
    //TODO for loop until the whole json array ends
  });
});

/**
 * http://stackoverflow.com/a/14845917/2384934
 * From * to local: GET query
 *   backup
 *   restore
 *   manual transfer
 *   etc
 *   whatever
 */
router.get('/query/', function (req, res) {
  res.send("In progress");
});

/**
 * TODO create a small json report on the system status
 * https://www.raspberrypi.org/forums/viewtopic.php?f=91&t=34994
 */
router.get('/status/', function (req, res) {
  var ops = {};
  var now = new Date();
  var node_version = shell.exec('node --version', {silent: true}).output;
  var npm_version = shell.exec('npm --version', {silent: true}).output;
  ops.node = util.remove_line_breaker(node_version);
  ops.npm = util.remove_line_breaker(npm_version);
  ops.running_for = util.millisecondTpString(now.getTime() - util.get_start_time().getTime());
  ops.port = util.get_port();
  ops.query_count = util.get_query_count();
  res.json(ops);
});

module.exports = router;