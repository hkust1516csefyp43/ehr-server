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
//variables
var diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../images/');
  },
  filename: function (req, file, cb) {
    console.log(path.extname(file.originalname));
    //TODO save iff it's image (png/PNG/jpg/JPG/JPEG/jpeg/etc
    var id = util.random_string(consts.id_random_string_length()) + Date.now() + path.extname(file.originalname);
    cb(null, id);
  }
});
var diskUpload = multer({storage: diskStorage}).single('image');
var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
  storage: memoryStorage,
  limits: {fileSize: consts.max_image_size(), files: 1}
}).single('image');

cloudinary.config({
  cloud_name: 'hkust1516csefyp43',
  api_key: '481781176725451',
  api_secret: 'e44DHc9nERY2meBmyE8srpQWAgE'
});
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
 * someone upload image to the server, and then server returns return name/path
 * httpie: http -f POST http://localhost:3000/v1/static/image/ image@~/Downloads/logos/hdpi.png token:hihi
 * NOTE: add --timeout=120 (or other number) if you experience timeout frequently
 */
router.post('/image/', function (req, res) {
  var token = req.get('token');   //Get token from header
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
  } else {
    db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
      if (err) {
        res.status(errors.server_error()).send('some kind of error: ' + err);
      } else {
        if (!return_value) {
          res.status(errors.token_does_not_exist()).send('Token is not valid');
        } else if (return_value.reset_any_password === false) {
          res.status(errors.no_permission()).send('No permission');
        } else if (return_value.reset_any_password === true) {
          console.log("return value: " + JSON.stringify(return_value));
          if (return_value.expiry_timestamp < Date.now()) {
            res.status(errors.access_token_expired()).send('Access token expired');
          } else {
            if (require('../../config.json').on_the_cloud) {                  //on the cloud >> cloudinary
              memoryUpload(req, res, function (err) {
                if (err) {
                  console.log(err);
                  res.status(errors.server_error()).send("fail to save to memory: " + err);
                } else {
                  dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
                  console.log("send to cloudinary starts now!");
                  //console.log(dUri.content);
                  cloudinary.uploader.upload(dUri.content, function (err, i) {
                    if (err) {
                      console.log(err);
                      res.status(errors.server_error()).send('Unable to save image to cloudinary');
                    } else {
                      console.log(JSON.stringify(i));
                      res.send(i);
                    }
                  });
                }
              });
            } else {                                                          //locally
              diskUpload(req, res, function (err) {
                if (err) {
                  console.log(JSON.stringify(err));
                  res.status(errors.bad_request()).send("fail saving image");
                } else {
                  res.send(req.file.filename);
                }
              });
            }
          }
        }
      }
    });
  }
});

/**
 * return image iff it is running in local hardware (RPi)
 * httpie:  http localhost:3000/v1/static/image/oNA3vGiv2Zv061ar1453266052788.png token:hihi
 */
router.get('/image/:id', function (req, res) {
  if (require('../../config.json').on_the_cloud) {
    //error (you already have the whole cloudinary url. don't ask me to do your job for you)
    res.status(errors.bad_request()).send("Ask cloudinary yourself");
  } else {
    var filename = req.params.id;
    var token = req.get('token');   //Get token from header
    var p = '../images/' + filename;
    if (!token) {
      res.status(errors.token_missing()).send('Token is missing');
    } else {
      db.check_token_and_permission("reset_any_password", token, function (err, return_value, client) {
        if (err) {
          res.status(errors.server_error()).send('some kind of error: ' + err);
        } else {
          if (!return_value) {
            res.status(errors.token_does_not_exist()).send('Token is not valid');
          } else if (return_value.reset_any_password === false) {
            res.status(errors.no_permission()).send('No permission');
          } else if (return_value.reset_any_password === true) {
            console.log("return value: " + JSON.stringify(return_value));
            if (return_value.expiry_timestamp < Date.now()) {
              res.status(errors.access_token_expired()).send('Access token expired');
            } else {
              fs.access(p, fs.F_OK, function (err) {
                if (err) {
                  res.status(errors.not_found()).send("Are you sure the file name is correct?");
                } else {
                  p = '../' + p;
                  res.sendFile(path.join(__dirname, p));
                }
              });
            }
          }
        }
      });
    }
  }
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
  ops.query_count = q.get_query_count();
  ops.running_for = util.millisecondToJson(new Date().getTime() - util.get_start_time().getTime());
  ops.query_file = q.get_query_file_name();
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