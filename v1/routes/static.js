/**
 * Created by Louis on 15/8/2015.
 */
//Libraries
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pg = require('pg');
var shell = require('shelljs');
var path = require('path');
var http = require('http');
var multer = require('multer');
var sql = require('sql-bricks-postgres');
var mt = require('moment-timezone');
var mime = require('mime');
//files and other js
var util = require('../utils');
var consts = require('../consts');
var valid = require('../valid');
var q = require('../query');
//variables
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../images/');
  },
  filename: function (req, file, cb) {
    console.log(path.extname(file.originalname));
    //TODO save iff it's image (png/PNG/jpg/JPG/JPEG/jpeg/etc)
    var id = util.random_string(16) + Date.now() + path.extname(file.originalname);
    cb(null, id);
  }
});
var upload = multer({storage: storage}).single('image');

/**
 * Send apk for installation
 * No auth, no checking, no instruction, just the apk
 */
router.get('/apk/', function (req, res) {
  //http://stackoverflow.com/questions/9321027/how-to-send-files-with-node-js
  res.send('apk');
});

/**
 * DONE someone upload image to the server
 * TODO and then server returns return name/path
 * call this from terminal: google httpie first
 * > http -f POST http://localhost:3000/v1/static/image/ image@~/Downloads/logos/hdpi.png
 */
router.post('/image/', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      console.log(JSON.stringify(err));
      res.status(consts.just_error()).send("fail saving image");
    } else {
      res.send('how can I return the file name?');
    }
  });
});

//DO NOT implement delete API

/**
 * TODO return image
 * cache image for 3 minutes?
 */
router.get('/image/:id', function (req, res) {
  //http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
  res.send('In progress');
});

/**
 * Temperature(RPi only):
 * https://www.raspberrypi.org/forums/viewtopic.php?f=91&t=34994
 */
router.get('/status/', function (req, res) {
  var ops = {};         //outputs
  ops.app = require('../../package.json').version;
  ops.node = util.to_version_number(shell.exec('node --version', {silent: true}).output);
  ops.npm = util.to_version_number(shell.exec('npm --version', {silent: true}).output);
  ops.port = util.get_port();
  ops.query_count = q.get_query_count();
  ops.running_for = util.millisecondToJson(new Date().getTime() - util.get_start_time().getTime());
  ops.query_file = q.get_query_file_name();
  var where = require('../../config.json').on_the_cloud;
  if (where === false)
    console.log('pretend rpi is doing sth');
  res.json(ops);
});

/**
 * TODO return the whole txt
 * id >> filename
 */
router.get('/sync/:id', function (req, res) {
  fs.stat('../query/' + req.params.id, function (err, stats) {
    if (err) {
      res.status(consts.just_error()).send("Error finding file: " + err);
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