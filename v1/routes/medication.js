var express = require('express');
var router = express.Router();
var sql = require('sql-bricks-postgres');
var table_medication = 'medication';

router.get('/', function (req, res) {
    var sent = false;
    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    var token = param_query.token;
    if (!token) {
        res.status(401).send('Token is missing');
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

    //TODO sort by

    var sql_query = sql
        .select()
        .from(table_medication)
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

    if (!sent) {
        res.send('testing stuff');
    }

});

router.get('/:id', function (req, res) {
    var sent = false;
    var params = {};
    var param_query = req.query;
    console.log(JSON.stringify(param_query));

    var user_id = req.params.id;
    params.user_id = user_id;
    var token = param_query.token;
    if (!token) {
        res.status(401).send('Token is missing');
        sent = true;
    } else {
        params.token = token;
    }

    var sql_query = sql
        .select()
        .from(table_medication)
        .where(params)
        .toString();

    console.log(sql_query);

    if (!sent) {
        res.send('testing stuff');
    }

});

module.exports = router;