/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();

/**
 * Send apk for installation
 * No auth, no checking, no instruction, just the apk
 */
router.get('/apk/', function (req, res, next) {
    //http://stackoverflow.com/questions/9321027/how-to-send-files-with-node-js
    res.send('apk');
});

/**
 * Send JSON Array of countries
 */
router.get('/country/', function (req, res, next) {
    //TODO retrieve the whole country table from db
    //TODO should I embed the JSON Object to this file or keep it separated?
    res.json('[{"country_id":1,"english_name":"Hong Kong","phone_country_code":852},{"country_id":2,"english_name":"China","phone_country_code":86},{"country_id":3,"english_name":"Macau","phone_country_code":853},{"country_id":4,"english_name":"Cambodia","phone_country_code":855}]');
});

module.exports = router;