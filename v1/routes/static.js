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
var path = require('path');

/**
 * Send apk for installation
 * No auth, no checking, no instruction, just the apk
 */
router.get('/apk/', function (req, res) {
  //http://stackoverflow.com/questions/9321027/how-to-send-files-with-node-js
  res.send('apk');
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

/**
 * https://www.raspberrypi.org/forums/viewtopic.php?f=91&t=34994
 */
router.get('/status/', function (req, res) {
  var ops = {};         //outputs

  ops.app = require('../../package.json').version;
  ops.node = util.to_version_number(shell.exec('node --version', {silent: true}).output);
  ops.npm = util.to_version_number(shell.exec('npm --version', {silent: true}).output);
  ops.port = util.get_port();
  ops.query_count = util.get_query_count();
  ops.running_for = util.millisecondToJson(new Date().getTime() - util.get_start_time().getTime());

  res.json(ops);
});

/**
 * TODO return the whole txt
 * id >> filename
 */
router.get('/sync/:id', function (req, res) {
  fs.stat('../query/' + req.params.id, function (err, stats) {
    if (err) {
      res.status(400).send("Error finding file: " + err);
    } else {
      res.sendFile(path.join(__dirname, '../../query', req.params.id));
    }
  });
});

/**
 * TODO get a json array of file (names, last update, etc)
 */
router.get('/sync/', function (req, res) {
  fs.readdir('../query/', function (err, files) {
    if (err) {
      res.send("error");
    } else {
      var op = [];
      for (var i in files) {
        var f = files[i];
        var stat = fs.statSync('../query/' + f);
        var file = {};
        file.filename = f;
        file.mtime = stat.mtime;
        op.push(file);
      }
      res.json(op);
    }
  });
});

/**
 * RPi posting to Heroku
 * Logic:
 * 1. find the right file by id(i.e. file name)
 * 2. sendFile() to remoteUrl() (how?)
 */
router.post('/sync/:id', function (req, res) {
  res.send("in progress");
});

/**
 * Receiving data and putting them into the db
 */
router.put('/sync/', function (req, res) {
  res.send("in progress");
});

/**
 * delete sync file
 */
router.delete('/sync/:id', function (req, res) {
  res.send("in progress");
});

module.exports = router;