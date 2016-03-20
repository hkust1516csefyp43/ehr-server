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
var v2Genders = require('./v2/routes/genders');
var v2MedicationVariants = require('./v2/routes/medication_variants');
var v2Medications = require('./v2/routes/medications');
var v2Notifications = require('./v2/routes/notifications');
var v2Suitcases = require('./v2/routes/suitcases');

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
app.use('/v2/genders', v2Genders);
app.use('/v2/medications', v2Medications);
app.use('/v2/medication_variants', v2MedicationVariants);
app.use('/v2/notifications', v2Notifications);
app.use('/v2/suitcases', v2Suitcases);

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
