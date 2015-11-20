/**
 * Created by Louis on 15/8/2015.
 */
var express = require('express');
var router = express.Router();
var ba = require('basic-auth');
var mysql = require('mysql');
var su = require('../utils'); //FIXME I don't think this is the best practice
var sql = require('sql-bricks-postgres');

/**
 * TODO
 * function 1: search patient
 * function 2: monthly report (search query includes date time)
 * response: JSONArray of patients
 */
router.get('/search/', function (req, res) {
    var gender = req.query.gender;
    res.send('searching stuff: ' + gender);
});

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
    //var body = req.body;
    //var message;
    //message = su.extend_or_replace(message, 'race: ' + body.race + '\n');
    //message = su.extend_or_replace(message, 'gender: ' + body.gender + '\n');
    //message = su.extend_or_replace(message, 'name: ' + body.name + '\n');
    //message = su.extend_or_replace(message, 'birthday: ' + body.birthday + '\n');
    //res.send(message);

    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    var token = param_query.token;
    if (!token) {
        res.status(401).send('Token is missing');
    } else {
        params.token = token;
    }

    var next_station = param_query.next_station;
    if (next_station) {
        params.next_station = next_station;
    }

    //These 3 are mutually exclusive
    var age = param_query.age;
    var age_ot = param_query.age_ot;
    var age_yt = param_query.age_yt;

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
        params.email = email;
    }

    var related_to_id = param_query.related_to_id;
    if (related_to_id) {
        params.related_id = related_to_id;
    }

    console.log(JSON.stringify(params));

    var sql_query = sql
        .select()
        .from('patient')
        .where(params)
        .toString();

    var limit = param_query.limit;
    if (limit) {
        sql_query.limit(limit);
    }

    var offset = param_query.offset;
    if (offset) {
        sql_query.offset(offset);
    }

    console.log(sql_query);

    res.send('testing stuff');
});

//router.get('/test-mysql/', function (req, res, next) {
//    if (req.param.test == 1) {
//        var connection1 = mysql.createConnection({
//            host: '127.7.36.130',
//            port: 3306,
//            user: 'louis993546',
//            password: '449017400023',
//            database: 'php'
//        });
//        connection1.connect(function (err) {
//            if (err)
//                console.log('connect error: ' + err);
//        });
//
//        connection1.query('SELECT * FROM Persons;', function (err, rows, fields) {
//            if (err) {
//                console.log('query error: ' + err);
//            } else if (rows.length > 0) {
//                console.log('getting sth');
//                console.log(JSON.stringify(rows));
//            }
//        });
//        connection1.end();
//    } else if (req.param.test == 2) {
//        var connection2 = mysql.createConnection({
//            //host     : 'localhost',
//            socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
//            user: 'root',
//            password: 'root',
//            database: 'testing'
//        });
//        connection2.connect(function (err) {
//            if (err)
//                console.log('connect error: ' + err);
//        });
//        connection2.query('SELECT * FROM test;', function (err, rows, fields) {
//            if (err) {
//                console.log('query error: ' + err);
//            } else if (rows.length > 0) {
//                console.log('getting sth');
//                console.log(JSON.stringify(rows));
//            }
//        });
//        connection2.end();
//    }
//});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Patient' });
});

module.exports = router;