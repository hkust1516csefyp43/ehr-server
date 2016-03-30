/**
 * Created by RickyLo on 28/3/2016.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var moment = require('moment');
var wait = require('wait.for');

var util = require('../utils');
var errors = require('../statuses');
var consts = require('../consts');
var valid = require('../valid');
var db = require('../database');
var q = require('../query');
var sql = require('sql-bricks-postgres');

/* GET list */
router.get('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_query = req.query;
  var param_headers = req.headers;
  console.log(JSON.stringify(param_query));
  console.log(JSON.stringify(param_headers));
  var token = param_headers.token;
  console.log(token);
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("roles_read", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.roles_read === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.roles_read === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {
          var sql_query = sql
            .select()
            .from(consts.table_roles())
            .where(params);

          var name = req.query.name;
          if (name)
            params.name = name;

          var attachments_read = req.query.attachments_read;
          if (attachments_read)
            params.attachments_read = attachments_read;

          var attachments_write = req.query.attachments_write;
          if (attachments_write)
            params.attachments_write = attachments_write;

          var blocked_devices_read = req.query.blocked_devices_read;
          if (blocked_devices_read)
            params.blocked_devices_read = blocked_devices_read;

          var blocked_devices_write = req.query.blocked_devices_write;
          if (blocked_devices_write)
            params.blocked_devices_write = blocked_devices_write;

          var blood_types_read = req.query.blood_types_read;
          if (blood_types_read)
            params.blood_types_read = blood_types_read;

          var blood_types_write = req.query.blood_types_write;
          if (blood_types_write)
            params.blood_types_write = blood_types_write;

          var clinics_read = req.query.clinics_read;
          if (clinics_read)
            params.clinics_read = clinics_read;

          var clinics_write = req.query.clinics_write;
          if (clinics_write)
            params.clinics_write = clinics_write;

          var comments_read = req.query.comments_read;
          if (comments_read)
            params.comments_read = comments_read;

          var comments_write = req.query.comments_write;
          if (comments_write)
            params.comments_write = comments_write;

          var consultation_attachments_read = req.query.consultation_attachments_read;
          if (consultation_attachments_read)
            params.consultation_attachments_read = consultation_attachments_read;

          var consultation_attachments_write = req.query.consultation_attachments_write;
          if (consultation_attachments_write)
            params.consultation_attachments_write = consultation_attachments_write;

          var consultations_read = req.query.consultations_read;
          if (consultations_read)
            params.consultations_read = consultations_read;

          var consultations_write = req.query.consultations_write;
          if (consultations_write)
            params.consultations_write = consultations_write;

          var countries_read = req.query.countries_read;
          if (countries_read)
            params.countries_read = countries_read;

          var countries_write = req.query.countries_write;
          if (countries_write)
            params.countries_write = countries_write;

          var document_types_read = req.query.document_types_read;
          if (document_types_read)
            params.document_types_read = document_types_read;

          var document_types_write = req.query.document_types_write;
          if (document_types_write)
            params.document_types_write = document_types_write;

          var documents_read = req.query.documents_read;
          if (documents_read)
            params.documents_read = documents_read;

          var documents_write = req.query.documents_write;
          if (documents_write)
            params.documents_write = documents_write;

          var emergency_contacts_read = req.query.emergency_contacts_read;
          if (emergency_contacts_read)
            params.emergency_contacts_read = emergency_contacts_read;

          var emergency_contacts_write = req.query.emergency_contacts_write;
          if (emergency_contacts_write)
            params.emergency_contacts_write = emergency_contacts_write;

          var genders_read = req.query.genders_read;
          if (genders_read)
            params.genders_read = genders_read;

          var genders_write = req.query.genders_write;
          if (genders_write)
            params.genders_write = genders_write;

          var investigation_attachments_read = req.query.investigation_attachments_read;
          if (investigation_attachments_read)
            params.investigation_attachments_read = investigation_attachments_read;

          var investigation_attachments_write = req.query.investigation_attachments_write;
          if (investigation_attachments_write)
            params.investigation_attachments_write = investigation_attachments_write;

          var investigations_read = req.query.investigations_read;
          if (investigations_read)
            params.investigations_read = investigations_read;

          var investigations_write = req.query.investigations_write;
          if (investigations_write)
            params.investigations_write = investigations_write;

          var keywords_read = req.query.keywords_read;
          if (keywords_read)
            params.keywords_read = keywords_read;

          var keywords_write = req.query.keywords_write;
          if (keywords_write)
            params.keywords_write = keywords_write;

          var medication_variants_read = req.query.medication_variants_read;
          if (medication_variants_read)
            params.medication_variants_read = medication_variants_read;

          var medication_variants_write = req.query.medication_variants_write;
          if (medication_variants_write)
            params.medication_variants_write = medication_variants_write;

          var medications_read = req.query.medications_read;
          if (medications_read)
            params.medications_read = medications_read;

          var medications_write = req.query.medications_write;
          if (medications_write)
            params.medications_write = medications_write;

          var notifications_read = req.query.notifications_read;
          if (notifications_read)
            params.notifications_read = notifications_read;

          var notifications_write = req.query.notifications_write;
          if (notifications_write)
            params.notifications_write = notifications_write;

          var patients_read = req.query.patients_read;
          if (patients_read)
            params.patients_read = patients_read;

          var patients_write = req.query.patients_write;
          if (patients_write)
            params.patients_write = patients_write;

          var pharmacies_read = req.query.pharmacies_read;
          if (pharmacies_read)
            params.pharmacies_read = pharmacies_read;

          var pharmacies_write = req.query.pharmacies_write;
          if (pharmacies_write)
            params.pharmacies_write = pharmacies_write;

          var prescriptions_read = req.query.prescriptions_read;
          if (prescriptions_read)
            params.prescriptions_read = prescriptions_read;

          var prescriptions_write = req.query.prescriptions_write;
          if (prescriptions_write)
            params.prescriptions_write = prescriptions_write;

          var related_data_read = req.query.related_data_read;
          if (related_data_read)
            params.related_data_read = related_data_read;

          var related_data_write = req.query.related_data_write;
          if (related_data_write)
            params.related_data_write = related_data_write;

          var relationship_types_read = req.query.relationship_types_read;
          if (relationship_types_read)
            params.relationship_types_read = relationship_types_read;

          var relationship_types_write = req.query.relationship_types_write;
          if (relationship_types_write)
            params.relationship_types_write = relationship_types_write;

          var roles_read = req.query.roles_read;
          if (roles_read)
            params.roles_read = roles_read;

          var roles_write = req.query.roles_write;
          if (roles_write)
            params.roles_write = roles_write;

          var suitcases_read = req.query.suitcases_read;
          if (suitcases_read)
            params.suitcases_read = suitcases_read;

          var suitcases_write = req.query.suitcases_write;
          if (suitcases_write)
            params.suitcases_write = suitcases_write;

          var tokens_read = req.query.tokens_read;
          if (tokens_read)
            params.tokens_read = tokens_read;

          var tokens_write = req.query.tokens_write;
          if (tokens_write)
            params.tokens_write = tokens_write;

          var triages_read = req.query.triages_read;
          if (triages_read)
            params.triages_read = triages_read;

          var triages_write = req.query.triages_write;
          if (triages_write)
            params.triages_write = triages_write;

          var users_read = req.query.users_read;
          if (users_read)
            params.users_read = users_read;

          var users_write = req.query.users_write;
          if (users_write)
            params.users_write = users_write;

          var visits_read = req.query.visits_read;
          if (visits_read)
            params.visits_read = visits_read;

          var visits_write = req.query.visits_write;
          if (visits_write)
            params.visits_write = visits_write;

          var shut_down = req.query.shut_down;
          if (shut_down)
            params.shut_down = shut_down;

          var relationships_read = req.query.relationships_read;
          if (relationships_read)
            params.relationships_read = relationships_read;

          var relationships_write = body.relationships_write;
          if (relationships_write)
            params.relationships_write = relationships_write;

          var offset = param_query.offset;
          if (offset) {
            sql_query.offset(offset);
          }

          var sort_by = param_query.sort_by;
          if (sort_by) {
            //TODO check if custom sort by param is valid
            sql_query.orderBy(sort_by);
          } else {
            sql_query.orderBy('role_id');
          }

          var limit = param_query.limit;
          if (limit) {
            sql_query.limit(limit);
          } else {    //Default limit
            sql_query.limit(consts.list_limit());
          }

          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                q.save_sql_query(sql_query.toString());
                res.json(result.rows);
              }
            });
          }
        }
      }
    });
  }
});

/* POST */
router.post('/', function (req, res) {
  var sent = false;
  var params = {};
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("roles_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.roles_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.roles_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{
          params.role_id = util.random_string(consts.id_random_string_length());

          var name = body.name;
          if (name)
            params.name = name;
          else if (!sent) {
            sent = true;
            res.status(errors.bad_request()).send('name should be not null');
          }

          var attachments_read = body.attachments_read;
          if (attachments_read)
            params.attachments_read = attachments_read;

          var attachments_write = body.attachments_write;
          if (attachments_write)
            params.attachments_write = attachments_write;

          var blocked_devices_read = body.blocked_devices_read;
          if (blocked_devices_read)
            params.blocked_devices_read = blocked_devices_read;

          var blocked_devices_write = body.blocked_devices_write;
          if (blocked_devices_write)
            params.blocked_devices_write = blocked_devices_write;

          var blood_types_read = body.blood_types_read;
          if (blood_types_read)
            params.blood_types_read = blood_types_read;

          var blood_types_write = body.blood_types_write;
          if (blood_types_write)
            params.blood_types_write = blood_types_write;

          var clinics_read = body.clinics_read;
          if (clinics_read)
            params.clinics_read = clinics_read;

          var clinics_write = body.clinics_write;
          if (clinics_write)
            params.clinics_write = clinics_write;

          var comments_read = body.comments_read;
          if (comments_read)
            params.comments_read = comments_read;

          var comments_write = body.comments_write;
          if (comments_write)
            params.comments_write = comments_write;

          var consultation_attachments_read = body.consultation_attachments_read;
          if (consultation_attachments_read)
            params.consultation_attachments_read = consultation_attachments_read;

          var consultation_attachments_write = body.consultation_attachments_write;
          if (consultation_attachments_write)
            params.consultation_attachments_write = consultation_attachments_write;

          var consultations_read = body.consultations_read;
          if (consultations_read)
            params.consultations_read = consultations_read;

          var consultations_write = body.consultations_write;
          if (consultations_write)
            params.consultations_write = consultations_write;

          var countries_read = body.countries_read;
          if (countries_read)
            params.countries_read = countries_read;

          var countries_write = body.countries_write;
          if (countries_write)
            params.countries_write = countries_write;

          var document_types_read = body.document_types_read;
          if (document_types_read)
            params.document_types_read = document_types_read;

          var document_types_write = body.document_types_write;
          if (document_types_write)
            params.document_types_write = document_types_write;

          var documents_read = body.documents_read;
          if (documents_read)
            params.documents_read = documents_read;

          var documents_write = body.documents_write;
          if (documents_write)
            params.documents_write = documents_write;

          var emergency_contacts_read = body.emergency_contacts_read;
          if (emergency_contacts_read)
            params.emergency_contacts_read = emergency_contacts_read;

          var emergency_contacts_write = body.emergency_contacts_write;
          if (emergency_contacts_write)
            params.emergency_contacts_write = emergency_contacts_write;

          var genders_read = body.genders_read;
          if (genders_read)
            params.genders_read = genders_read;

          var genders_write = body.genders_write;
          if (genders_write)
            params.genders_write = genders_write;

          var investigation_attachments_read = body.investigation_attachments_read;
          if (investigation_attachments_read)
            params.investigation_attachments_read = investigation_attachments_read;

          var investigation_attachments_write = body.investigation_attachments_write;
          if (investigation_attachments_write)
            params.investigation_attachments_write = investigation_attachments_write;

          var investigations_read = body.investigations_read;
          if (investigations_read)
            params.investigations_read = investigations_read;

          var investigations_write = body.investigations_write;
          if (investigations_write)
            params.investigations_write = investigations_write;

          var keywords_read = body.keywords_read;
          if (keywords_read)
            params.keywords_read = keywords_read;

          var keywords_write = body.keywords_write;
          if (keywords_write)
            params.keywords_write = keywords_write;

          var medication_variants_read = body.medication_variants_read;
          if (medication_variants_read)
            params.medication_variants_read = medication_variants_read;

          var medication_variants_write = body.medication_variants_write;
          if (medication_variants_write)
            params.medication_variants_write = medication_variants_write;

          var medications_read = body.medications_read;
          if (medications_read)
            params.medications_read = medications_read;

          var medications_write = body.medications_write;
          if (medications_write)
            params.medications_write = medications_write;

          var notifications_read = body.notifications_read;
          if (notifications_read)
            params.notifications_read = notifications_read;

          var notifications_write = body.notifications_write;
          if (notifications_write)
            params.notifications_write = notifications_write;

          var patients_read = body.patients_read;
          if (patients_read)
            params.patients_read = patients_read;

          var patients_write = body.patients_write;
          if (patients_write)
            params.patients_write = patients_write;

          var pharmacies_read = body.pharmacies_read;
          if (pharmacies_read)
            params.pharmacies_read = pharmacies_read;

          var pharmacies_write = body.pharmacies_write;
          if (pharmacies_write)
            params.pharmacies_write = pharmacies_write;

          var prescriptions_read = body.prescriptions_read;
          if (prescriptions_read)
            params.prescriptions_read = prescriptions_read;

          var prescriptions_write = body.prescriptions_write;
          if (prescriptions_write)
            params.prescriptions_write = prescriptions_write;

          var related_data_read = body.related_data_read;
          if (related_data_read)
            params.related_data_read = related_data_read;

          var related_data_write = body.related_data_write;
          if (related_data_write)
            params.related_data_write = related_data_write;

          var relationship_types_read = body.relationship_types_read;
          if (relationship_types_read)
            params.relationship_types_read = relationship_types_read;

          var relationship_types_write = body.relationship_types_write;
          if (relationship_types_write)
            params.relationship_types_write = relationship_types_write;

          var roles_read = body.roles_read;
          if (roles_read)
            params.roles_read = roles_read;

          var roles_write = body.roles_write;
          if (roles_write)
            params.roles_write = roles_write;

          var suitcases_read = body.suitcases_read;
          if (suitcases_read)
            params.suitcases_read = suitcases_read;

          var suitcases_write = body.suitcases_write;
          if (suitcases_write)
            params.suitcases_write = suitcases_write;

          var tokens_read = body.tokens_read;
          if (tokens_read)
            params.tokens_read = tokens_read;

          var tokens_write = body.tokens_write;
          if (tokens_write)
            params.tokens_write = tokens_write;

          var triages_read = body.triages_read;
          if (triages_read)
            params.triages_read = triages_read;

          var triages_write = body.triages_write;
          if (triages_write)
            params.triages_write = triages_write;

          var users_read = body.users_read;
          if (users_read)
            params.users_read = users_read;

          var users_write = body.users_write;
          if (users_write)
            params.users_write = users_write;

          var visits_read = body.visits_read;
          if (visits_read)
            params.visits_read = visits_read;

          var visits_write = body.visits_write;
          if (visits_write)
            params.visits_write = visits_write;

          var shut_down = body.shut_down;
          if (shut_down)
            params.shut_down = shut_down;

          var relationships_read = body.relationships_read;
          if (relationships_read)
            params.relationships_read = relationships_read;

          var relationships_write = body.relationships_write;
          if (relationships_write)
            params.relationships_write = relationships_write;

          var sql_query = sql.insert(consts.table_roles(), params).returning('*');
          console.log(sql_query.toString());

          if (!sent)
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Insertion failed');
                } else {
                  //how can 1 pk return more than 1 row!?
                  res.status(errors.server_error()).send('Sth weird is happening');
                }
              }
            });
        }
      }
    });
  }
});

/*PUT*/
router.put('/:id', function (req, res) {
  var sent = false;
  var params = {};
  var param_headers = req.headers;
  var body = req.body;
  console.log(JSON.stringify(param_headers));
  console.log(JSON.stringify(body));
  var token = param_headers.token;
  console.log(token);
  if (valid.empty_object(body)) {
    sent = true;
    res.status(errors.bad_request()).send('You cannot edit nothing');
  } else if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("roles_write", token, function (err, return_value, client) {
      if (!return_value) {                                        //return value == null >> sth wrong
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.roles_write === false) {          //false (no permission)
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.roles_write === true) {           //w/ permission
        if (return_value.expiry_timestamp < Date.now()) {
          res.status(errors.access_token_expired()).send('Access token expired');
        } else{

          var name = body.name;
          if (name)
            params.name = name;

          var attachments_read = body.attachments_read;
          if (attachments_read)
            params.attachments_read = attachments_read;

          var attachments_write = body.attachments_write;
          if (attachments_write)
            params.attachments_write = attachments_write;

          var blocked_devices_read = body.blocked_devices_read;
          if (blocked_devices_read)
            params.blocked_devices_read = blocked_devices_read;

          var blocked_devices_write = body.blocked_devices_write;
          if (blocked_devices_write)
            params.blocked_devices_write = blocked_devices_write;

          var blood_types_read = body.blood_types_read;
          if (blood_types_read)
            params.blood_types_read = blood_types_read;

          var blood_types_write = body.blood_types_write;
          if (blood_types_write)
            params.blood_types_write = blood_types_write;

          var clinics_read = body.clinics_read;
          if (clinics_read)
            params.clinics_read = clinics_read;

          var clinics_write = body.clinics_write;
          if (clinics_write)
            params.clinics_write = clinics_write;

          var comments_read = body.comments_read;
          if (comments_read)
            params.comments_read = comments_read;

          var comments_write = body.comments_write;
          if (comments_write)
            params.comments_write = comments_write;

          var consultation_attachments_read = body.consultation_attachments_read;
          if (consultation_attachments_read)
            params.consultation_attachments_read = consultation_attachments_read;

          var consultation_attachments_write = body.consultation_attachments_write;
          if (consultation_attachments_write)
            params.consultation_attachments_write = consultation_attachments_write;

          var consultations_read = body.consultations_read;
          if (consultations_read)
            params.consultations_read = consultations_read;

          var consultations_write = body.consultations_write;
          if (consultations_write)
            params.consultations_write = consultations_write;

          var countries_read = body.countries_read;
          if (countries_read)
            params.countries_read = countries_read;

          var countries_write = body.countries_write;
          if (countries_write)
            params.countries_write = countries_write;

          var document_types_read = body.document_types_read;
          if (document_types_read)
            params.document_types_read = document_types_read;

          var document_types_write = body.document_types_write;
          if (document_types_write)
            params.document_types_write = document_types_write;

          var documents_read = body.documents_read;
          if (documents_read)
            params.documents_read = documents_read;

          var documents_write = body.documents_write;
          if (documents_write)
            params.documents_write = documents_write;

          var emergency_contacts_read = body.emergency_contacts_read;
          if (emergency_contacts_read)
            params.emergency_contacts_read = emergency_contacts_read;

          var emergency_contacts_write = body.emergency_contacts_write;
          if (emergency_contacts_write)
            params.emergency_contacts_write = emergency_contacts_write;

          var genders_read = body.genders_read;
          if (genders_read)
            params.genders_read = genders_read;

          var genders_write = body.genders_write;
          if (genders_write)
            params.genders_write = genders_write;

          var investigation_attachments_read = body.investigation_attachments_read;
          if (investigation_attachments_read)
            params.investigation_attachments_read = investigation_attachments_read;

          var investigation_attachments_write = body.investigation_attachments_write;
          if (investigation_attachments_write)
            params.investigation_attachments_write = investigation_attachments_write;

          var investigations_read = body.investigations_read;
          if (investigations_read)
            params.investigations_read = investigations_read;

          var investigations_write = body.investigations_write;
          if (investigations_write)
            params.investigations_write = investigations_write;

          var keywords_read = body.keywords_read;
          if (keywords_read)
            params.keywords_read = keywords_read;

          var keywords_write = body.keywords_write;
          if (keywords_write)
            params.keywords_write = keywords_write;

          var medication_variants_read = body.medication_variants_read;
          if (medication_variants_read)
            params.medication_variants_read = medication_variants_read;

          var medication_variants_write = body.medication_variants_write;
          if (medication_variants_write)
            params.medication_variants_write = medication_variants_write;

          var medications_read = body.medications_read;
          if (medications_read)
            params.medications_read = medications_read;

          var medications_write = body.medications_write;
          if (medications_write)
            params.medications_write = medications_write;

          var notifications_read = body.notifications_read;
          if (notifications_read)
            params.notifications_read = notifications_read;

          var notifications_write = body.notifications_write;
          if (notifications_write)
            params.notifications_write = notifications_write;

          var patients_read = body.patients_read;
          if (patients_read)
            params.patients_read = patients_read;

          var patients_write = body.patients_write;
          if (patients_write)
            params.patients_write = patients_write;

          var pharmacies_read = body.pharmacies_read;
          if (pharmacies_read)
            params.pharmacies_read = pharmacies_read;

          var pharmacies_write = body.pharmacies_write;
          if (pharmacies_write)
            params.pharmacies_write = pharmacies_write;

          var prescriptions_read = body.prescriptions_read;
          if (prescriptions_read)
            params.prescriptions_read = prescriptions_read;

          var prescriptions_write = body.prescriptions_write;
          if (prescriptions_write)
            params.prescriptions_write = prescriptions_write;

          var related_data_read = body.related_data_read;
          if (related_data_read)
            params.related_data_read = related_data_read;

          var related_data_write = body.related_data_write;
          if (related_data_write)
            params.related_data_write = related_data_write;

          var relationship_types_read = body.relationship_types_read;
          if (relationship_types_read)
            params.relationship_types_read = relationship_types_read;

          var relationship_types_write = body.relationship_types_write;
          if (relationship_types_write)
            params.relationship_types_write = relationship_types_write;

          var roles_read = body.roles_read;
          if (roles_read)
            params.roles_read = roles_read;

          var roles_write = body.roles_write;
          if (roles_write)
            params.roles_write = roles_write;

          var suitcases_read = body.suitcases_read;
          if (suitcases_read)
            params.suitcases_read = suitcases_read;

          var suitcases_write = body.suitcases_write;
          if (suitcases_write)
            params.suitcases_write = suitcases_write;

          var tokens_read = body.tokens_read;
          if (tokens_read)
            params.tokens_read = tokens_read;

          var tokens_write = body.tokens_write;
          if (tokens_write)
            params.tokens_write = tokens_write;

          var triages_read = body.triages_read;
          if (triages_read)
            params.triages_read = triages_read;

          var triages_write = body.triages_write;
          if (triages_write)
            params.triages_write = triages_write;

          var users_read = body.users_read;
          if (users_read)
            params.users_read = users_read;

          var users_write = body.users_write;
          if (users_write)
            params.users_write = users_write;

          var visits_read = body.visits_read;
          if (visits_read)
            params.visits_read = visits_read;

          var visits_write = body.visits_write;
          if (visits_write)
            params.visits_write = visits_write;

          var shut_down = body.shut_down;
          if (shut_down)
            params.shut_down = shut_down;

          var relationships_read = body.relationships_read;
          if (relationships_read)
            params.relationships_read = relationships_read;

          var relationships_write = body.relationships_write;
          if (relationships_write)
            params.relationships_write = relationships_write;

          if (valid.empty_object(params)) {
            sent = true;
            res.status(errors.bad_request()).send('You cannnot edit nothing');
          }

          var sql_query = sql
            .update(consts.table_roles(), params)
            .where(sql('role_id'), req.params.id)
            .returning('*');

          console.log(sql_query.toString());
          if (!sent)
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find role according to this id.');
                } else {
                  //how can 1 pk return more than 1 row!?
                  res.status(errors.server_error()).send('Sth weird is happening');
                }
              }
            });
        }
      }
    });
  }
});

router.delete('/:id', function (req, res) {
  var sent = false;
  var token = req.headers.token;
  if (!token) {
    res.status(errors.token_missing()).send('Token is missing');
    sent = true;
  } else {
    db.check_token_and_permission("roles_write", token, function (err, return_value, client) {
      if (!return_value) {
        sent = true;
        res.status(errors.bad_request()).send('Token missing or invalid');
      } else if (return_value.roles_write === false) {
        sent = true;
        res.status(errors.no_permission()).send('No permission');
      } else if (return_value.roles_write === true) {
        if (return_value.expiry_timestamp < Date.now()) {
          sent = true;
          res.status(errors.access_token_expired()).send('Access token expired');
        } else {

          var sql_query = sql.delete().from(consts.table_roles()).where(sql('role_id'), req.params.id).returning('*');
          console.log("The whole query in string: " + sql_query.toString());

          if (!sent) {
            client.query(sql_query.toParams().text, sql_query.toParams().values, function (err, result) {
              if (err) {
                res.status(errors.server_error()).send('error fetching client from pool: ' + err);
                sent = true;
                return console.error('error fetching client from pool', err);
              } else {
                if (result.rows.length === 1) {
                  q.save_sql_query(sql_query.toString());
                  sent = true;
                  res.json(result.rows[0]);
                } else if (result.rows.length === 0) {
                  res.status(errors.not_found()).send('Cannot find role according to this id.');
                } else {
                  //how can 1 pk return more than 1 row!?
                  res.status(errors.server_error()).send('Sth weird is happening');
                }
              }
            });
          }
        }
      }
    });
  }

});

module.exports = router;