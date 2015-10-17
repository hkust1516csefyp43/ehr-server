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
 * Return a list of static objects (countries, slums, etc)
 */
router.get('/update/:id', function (req, res, next) {
    /**
     * TODO s
     * 1.   id == 1 >> country json
     *      id == 2 >> slums json
     * 2. retrieve the whole country table from json
     */
    res.json('[{"country_id":1,"english_name":"Hong Kong","phone_country_code":852},{"country_id":2,"english_name":"China","phone_country_code":86},{"country_id":3,"english_name":"Macau","phone_country_code":853},{"country_id":4,"english_name":"Cambodia","phone_country_code":855}]');
});

/**
 * for front end to check if they need to update their local static data
 * e.g. country list, slum list, etc
 */
router.get('/update/', function (req, res, next) {
    res.send('No need to update for now.');
});

module.exports = router;