var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var sql = require('sql-bricks-postgres');
var NodeCache = require( "node-cache" );
var locationCache = new NodeCache();

/**
 * Get list of slums
 */
router.get('/slum/', function (req, res) {
  //TODO all other basic get data from db stuff

  //TODO return cache if no extra input param (i.e. not searching)
  locationCache.get( "allSlums", function( err, value ){
    if( !err ){
      if(value == undefined){
        // key not found
        //TODO create cache if cache does not exist yet
        obj = { my: "Special", variable: 42 };
        locationCache.set( "myKey", obj, function( err, success ){
          if( !err && success ){
            res.send(obj);
          }
        });

      }else{
        // value extracted in value
        // TODO return it
      }
    }
  });
});

/**
 * Get slum by id
 */
router.get('/slum/:id', function (req, res) {

});

/**
 * Update info of a slum
 */
router.put('/slum/:id', function (req, res) {

});

/**
 * Add new slum
 */
router.post('/slum/', function (req, res) {

});

/**
 * Get list of countries
 */
router.get('/country/', function (req, res) {

});

/**
 * Get country by id
 */
router.get('/country/:id', function (req, res) {

});

/**
 * Update info of a country
 */
router.put('/country/:id', function (req, res) {

});


/**
 * Add new country
 */
router.post('/country/', function (req, res) {

});

module.exports = router;