/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var ba = require('basic-auth');
var pg = require('pg');
var util = require('../utils');
var valid = require('../valid');
var db = require('../database');
var sql = require('sql-bricks-postgres');

/* GET with patient id + basic auth */
router.get('/:id', function(req, res) {
    var temp_patient = JSON.parse('{"id":"6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b","name":{"firstname":"Tsz Ho","middlename":"XXXX","lastname":"Tsai"},"birthday":{"year":1994,"month":9,"day":16},"gender":"male","race":"Mongolian","address":{"apartment":"A","floor":"99","village":"Sth","building":"Sth else","street":"sth street","province":"somewhere","country":"Cambodia"},"picture_id":"1024"}');
    var user = ba(req);
    //console.log(user);
    var message;
    if (req.params.id == temp_patient.id) {
        message = 'are you looking for me? \n' + JSON.stringify(temp_patient) + '\n';
    }
    message = message + 'username = ' + user.name + '\n' + 'password = ' + user.pass + '\n' + 'patient id = ' + req.params.id;
    res.send(message);
});

router.get('/', function (req, res) {
    var sent = false;
    //var body = req.body;
    //var message;
    //message = util.extend_or_replace(message, 'race: ' + body.race + '\n');
    //message = util.extend_or_replace(message, 'gender: ' + body.gender + '\n');
    //message = util.extend_or_replace(message, 'name: ' + body.name + '\n');
    //message = util.extend_or_replace(message, 'birthday: ' + body.birthday + '\n');
    //res.send(message);

    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    var token = param_query.token;
    if (!token) {
        res.status(499).send('Token is missing');
        sent = true;
    } else {
        db.check_token_and_permission("reset_any_password", token, function (return_value, client) {
            if (!return_value) {                                            //return value == null >> sth wrong
                res.status(400).send('Token missing or invalid');
            } else if (return_value.reset_any_password == false) {          //false (no permission)
                res.status(403).send('No permission');
            } else if (return_value.reset_any_password == true) {           //w/ permission
                //TODO check if token expired
                var next_station = param_query.next_station;
                if (next_station) {
                    params.next_station = next_station;
                }

                //These 3 are mutually exclusive
                var age = param_query.age;
                var age_ot = param_query.age_ot;
                var age_yt = param_query.age_yt;

                //TODO age_ot and age_yt can exist together iff age_yt > age_ot
                switch (util.mutually_exclusive(age, age_ot, age_yt)) {
                    case 0:
                        //Do nothing, LITERALLY
                        break;
                    case 1:
                        if (age) {
                            //TODO calculation
                        } else if (age_ot) {
                            //TODO calculation
                        } else if (age_yt) {
                            //TODO calculation
                        }
                        break;
                    case 2:
                        if (!age) { //i.e. age_ot and age_yt exists
                            if (age_yt - age_ot > 1) {
                                //TODO ok, calculate
                            } else {
                                res.status(409).send('invalid age_ot and age_yt combination');
                            }
                        }
                        break;
                    default:
                        res.status(409).send('age, ago_ot and age_yt must be mutually exclusive');
                        sent = true;
                }

                var slum_id = param_query.slum_id;
                if (slum_id) {
                    params.slum_id = slum_id;
                }

                var gender = param_query.gender;
                if (gender) {
                    params.gender = gender;
                }

                var blood_type = param_query.blood_type;
                if (blood_type) {
                    params.blood_type = blood_type;
                }

                var country_id = param_query.country_id;
                if (country_id) {
                    params.country_id = country_id;
                }

                var email = param_query.email;
                if (email) {
                    //params.email = email;
                    if (valid.email(email) == false) {
                        sent = true;
                        res.status(400).send("invalid email");
                    } else {
                        params.email = email;
                    }
                }

                var first_name = param_query.first_name;
                if (first_name) {
                    params.first_name = first_name;
                }

                var middle_name = param_query.middle_name;
                if (middle_name) {
                    params.middle_name = middle_name;
                }

                var last_name = param_query.last_name;
                if (last_name) {
                    params.last_name = last_name;
                }

                var name = param_query.name;
                if (name) {
                    //TODO search it at first_name OR middle_name OR last_name
                }

                //TODO get this from relationship table
                //var related_to_id = param_query.related_to_id;
                //if (related_to_id) {
                //    params.related_id = related_to_id;
                //}

                //console.log(JSON.stringify(params));

                var sql_query = sql
                    .select()
                    .from('patient')
                    .where(params);

                var limit = param_query.limit;
                if (limit) {
                    sql_query.limit(limit);
                }

                var offset = param_query.offset;
                if (offset) {
                    sql_query.offset(offset);
                }

                var sort_by = param_query.sort_by;
                if (sort_by) {
                    //TODO check if custom sort by param is valid
                    sql_query.orderBy(sort_by);
                } else {
                    sql_query.orderBy('patient_id');
                }

                var limit = param_query.limit;
                if (limit) {
                    sql_query.limit(limit);
                } else {    //Default limit
                    sql_query.limit(100);
                }

                console.log("The whole query in string: " + sql_query.toString());

                if (sent == false) {
                    client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
                        if (err) {
                            res.send('error fetching client from pool 2');
                            sent = true;
                            return console.error('error fetching client from pool', err);
                        } else {
                            util.save_sql_query(sql_query.toString());
                            res.json(result.rows);
                        }
                    });
                }
            }
        });
    }
});

router.post('/', function (req, res) {

});

router.put('/', function (req, res) {

});

/**
 * get all visits of a patient
 * (unless you know all patient id, you won't be able to get all visits of everyone)
 */
router.get('/visit/:id', function (req, res) {

});

router.post('/visit/', function (req, res) {

});

router.get('/triage/', function (req, res) {

});

router.post('/triage/', function (req, res) {

});

router.get('/consultation/', function (req, res) {

});

router.post('/consultation/', function (req, res) {

});

router.get('/pharmacy/', function (req, res) {

});

router.post('/pharmacy/', function (req, res) {

});


module.exports = router;