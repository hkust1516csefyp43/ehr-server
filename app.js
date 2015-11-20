var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
