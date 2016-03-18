var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var errors = require('../errors');
var valid = require('../valid');
var consts = require('../consts');
var sql = require('sql-bricks-postgres');

var default_table = 'medication';

/**
 * get a list of medications
 */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));

  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    params.token = token;
  }

  var diagnosis_id = param_query.diagnosis_id;
  if (diagnosis_id) {
    params.diagnosis_id = diagnosis_id;
  }

  var name = param_query.name;
  if (name) {
    params.name = name;
  }

  var form = param_query.form;
  if (form) {
    params.form = form;
  }

  var dosage = param_query.dosage;
  if (dosage) {
    params.dosage = dosage;
  }

  var concentration = param_query.concentration;
  if (concentration) {
    params.concentration = concentration;
  }

  var sql_query = sql
    .select()
    .from(default_table)
    .where(params)
    .toString();

  var offset = param_query.offset;
  if (offset) {
    sql_query.offset(offset);
  }

  var sort_by = param_query.sort_by;
  if (!sort_by) { //Default sort by
    sql_query.orderBy('medication_id');
  } else {    //custom sort by
    //TODO check if custom sort by param is valid
    sql_query.orderBy(sort_by);
  }

  var limit = param_query.limit;
  if (limit) {
    sql_query.limit(limit);
  } else {    //Default limit
    sql_query.limit(consts.list_limit());
  }

  console.log(sql_query);

  if (!sent) {
    res.send('testing stuff');
  }

});

/**
 * get a medication by id
 */
router.get('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  console.log(JSON.stringify(param_query));

  params.user_id = req.params.id;
  var token = param_query.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    params.token = token;
  }

  var sql_query = sql
    .select()
    .from(default_table)
    .where(params)
    .toString();

  console.log(sql_query);

  if (!sent) {
    res.send('testing stuff');
  }

});

/**
 * TODO
 * get a list of medicatino varitant of all medications
 * param search
 */
router.get('/variants/', function (req, res) {

});

/**
 * TODO
 * 1. edit medication variant
 * 2. flag medication as not available/insufficient/available (i.e. edit)
 */
router.put('/variants/:id', function (req, res) {

});

router.put('/:id', function (req, res) {

});

router.post('/', function (req, res) {

});

/**
 * TODO
 * delete medication
 * permission: delete_medication
 */
router.delete('/:id', function (req, res) {

});

/**
 * TODO
 * delete a variant of a medication
 * permission: delete_medication_variant
 */
router.delete('/variants/:id', function (req, res) {

});

module.exports = router;