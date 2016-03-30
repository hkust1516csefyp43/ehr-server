var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./v1/routes/index');

var v1Inventory = require('./v1/routes/inventory');
var v1Patient = require('./v1/routes/patient');
var v1User = require('./v1/routes/user');
var v1Static = require('./v1/routes/static');
var v1ChiefComplain = require('./v1/routes/chief_complain');
var v1Diagnosis = require('./v1/routes/diagnosis');
var v1Medication = require('./v1/routes/medication');
var v1Location = require('./v1/routes/location');

//v2
var v2Attachments = require('./v2/routes/attachments');
var v2BlockedDevices = require('./v2/routes/blocked_devices');
var v2BloodTypes = require('./v2/routes/blood_types');
var v2Clinics = require('./v2/routes/clinics');
var v2Comments = require('./v2/routes/comments');
var v2ConsultationAttachments = require('./v2/routes/consultation_attachments');
var v2Consultations = require('./v2/routes/consultations');
var v2Countries = require('./v2/routes/countries');
var v2DocumentTypes = require('./v2/routes/document_types');
var v2EmergencyContacts = require('./v2/routes/emergency_contacts');
var v2Genders = require('./v2/routes/genders');
var v2InvestigationAttachments = require('./v2/routes/investigation_attachments');
var v2Investigations = require('./v2/routes/investigations');
var v2Keywords = require('./v2/routes/keywords');
var v2MedicationVariants = require('./v2/routes/medication_variants');
var v2Medications = require('./v2/routes/medications');
var v2Notifications = require('./v2/routes/notifications');
var v2Patients = require('./v2/routes/patients');
var v2Pharmacies = require('./v2/routes/pharmacies');
var v2Prescriptions = require('./v2/routes/prescriptions');
var v2RelatedData = require('./v2/routes/related_data');
var v2Relationships = require('./v2/routes/relationships');
var v2Roles = require('./v2/routes/roles');
var v2Suitcases = require('./v2/routes/suitcases');
var v2Tokens = require('./v2/routes/tokens');
var v2Triages = require('./v2/routes/triages');


//old stuff
var v2Inventory = require('./v2/routes/inventory');
var v2Patient = require('./v2/routes/patient');
var v2User = require('./v2/routes/user');
var v2Visit = require('./v2/routes/visit');
var v2Static = require('./v2/routes/static');
var v2ChiefComplain = require('./v2/routes/chief_complain');
var v2Diagnosis = require('./v2/routes/diagnosis');
var v2Location = require('./v2/routes/location');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

//v1
app.use('/v1/inventory', v1Inventory);
app.use('/v1/patient', v1Patient);
app.use('/v1/user', v1User);
app.use('/v1/static', v1Static);
app.use('/v1/chief_complain', v1ChiefComplain);
app.use('/v1/diagnosis', v1Diagnosis);
app.use('/v1/medication', v1Medication);
app.use('/v1/location', v1Location);

//v2
app.use('/v2/attachments', v2Attachments);
app.use('/v2/blood_types', v2BloodTypes);
app.use('/v2/blocked_devices',v2BlockedDevices);
app.use('/v2/clinics',v2Clinics);
app.use('/v2/comments', v2Comments);
app.use('/v2/consultation_attachments',v2ConsultationAttachments);
app.use('/v2/consultations',v2Consultations);
app.use('/v2/countries',v2Countries);
app.use('/v2/document_types', v2DocumentTypes);
app.use('/v2/emergency_contacts', v2EmergencyContacts);
app.use('/v2/genders', v2Genders);
app.use('/v2/investigation_attachments', v2InvestigationAttachments);
app.use('/v2/investigations', v2Investigations);
app.use('/v2/keywords', v2Keywords);
app.use('/v2/medications', v2Medications);
app.use('/v2/medication_variants', v2MedicationVariants);
app.use('/v2/notifications', v2Notifications);
app.use('/v2/patients', v2Patients);
app.use('/v2/pharmacies', v2Pharmacies);
app.use('/v2/prescriptions', v2Prescriptions);
app.use('/v2/related_data', v2RelatedData);
app.use('/v2/relationships', v2Relationships);
// app.use('/v2/roles', v2Roles);
app.use('/v2/suitcases', v2Suitcases);
app.use('/v2/tokens', v2Tokens);
// app.use('/v2/triages', v2Triages);


//old stuff
app.use('/v2/inventory', v2Inventory);
app.use('/v2/patient', v2Patient);
app.use('/v2/user', v2User);
app.use('/v2/visit', v2Visit);
app.use('/v2/static', v2Static);
app.use('/v2/chief_complain', v2ChiefComplain);
app.use('/v2/diagnosis', v2Diagnosis);
app.use('/v2/location', v2Location);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
