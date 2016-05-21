/**
 * Created by Louis on 15/8/2015.
 */
//Libraries
var express = require('express');
var router = express.Router();
var fs = require('fs');
var shell = require('shelljs');
var path = require('path');
var http = require('http');
var multer = require('multer');
var mt = require('moment-timezone');
var mime = require('mime');
var cloudinary = require('cloudinary').v2;
var Datauri = require('datauri');
//files and other js
var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var q = require('../query');
var db = require('../database');
var dUri = new Datauri();

/**
 * Send apk for installation
 * No auth, no checking, no instruction, just the apk
 */
router.get('/ehr.apk/', function (req, res) {
  var p = '../../other/app.apk';
  res.sendFile(path.join(__dirname, p));
});

/**
 * Return if new version is available
 */
router.get('/android/', function (req, res) {
  res.send('In progress');
});

/**
 * get system status
 */
router.get('/status/', function (req, res) {
  var ops = {};         //outputs
  ops.app = require('../../package.json').version;
  ops.node = util.to_version_number(shell.exec('node --version', {silent: true}).output);
  ops.npm = util.to_version_number(shell.exec('npm --version', {silent: true}).output);
  ops.port = util.get_port();
  ops.running_for = util.millisecondToJson(new Date().getTime() - util.get_start_time().getTime());
  var cloud = require('../../config.json').on_the_cloud;
  if (cloud === false) {
    console.log('pretend rpi is doing sth');
    var temp = shell.exec('/opt/vc/bin/vcgencmd measure_temp', {silent: true});
    temp = temp.output.replace('temp=', '');
    ops.temperature = temp.replace('\n', '');
  }
  res.json(ops);
});

/**
 * TODO return the whole txt
 * id >> filename
 */
router.get('/sync/:id', function (req, res) {
  fs.stat('../query/' + req.params.id, function (err, stats) {
    if (err) {
      res.status(errors.bad_request()).send("Error finding file: " + err);
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
 * 2. sendFile() to remoteUrl()
 * https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request
 */
router.post('/sync/:id', function (req, res) {
  http.request(util.get_cloud_options(), function (response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      console.log(str);
    });
  }).end();

  res.send("in progress");
});

/**
 * Receiving data and putting them into the db
 */
router.put('/sync/', function (req, res) {
  console.log(JSON.stringify(req));
  res.send("in progress");
});

/**
 * delete sync file
 */
router.delete('/sync/:id', function (req, res) {
  res.send("in progress");
});

router.get('/timezones/', function (req, res) {
  var a = mt.tz.names();
  var op = [];
  a.forEach(function (entry) {
    var zone = mt.tz.zone(entry);
    var os = zone.offsets;

    var id = zone.name;
    var name = util.normalize_country_string(id);
    var offset = os[os.length - 1];

    var oj = {};
    oj.id = id;
    oj.name = name;
    oj.offset = offset;

    op.push(oj);
  });
  res.json(op);
});



module.exports = router;