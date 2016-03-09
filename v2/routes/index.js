/**
 * This file route different commands to do different things
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

module.exports = router;
