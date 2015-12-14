/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var sql = require('sql-bricks-postgres');

/**
 * Get list of inventories
 */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;

  var token = param_query.token;
  if (!token) {
    res.status(499).send('Token is missing');
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

/* GET with item id */
router.get('/:id', function (req, res) {
  res.send('item id = ' + req.params.id);
});


module.exports = router;