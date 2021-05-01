var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var my_index = require('./routes/my_index');
var submitedData = require('./routes/submitedData');
var createDynaWallet = require('./routes/createDynaWallet');
var stopModule = require('./routes/stopModule');
var sse_index = require('./routes/sse_index');
var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade'); 

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', my_index);
app.use('/submitedData', submitedData);
app.use('/createDynaWallet(/*)?', createDynaWallet);
app.use('/stopModule(/*)?', stopModule);
app.use('/sse', sse_index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  //console.log('error:' + err.status|| 500);
});

module.exports = app;
