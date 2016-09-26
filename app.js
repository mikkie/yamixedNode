
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , favicon = require('serve-favicon')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , errorhandler = require('errorhandler')
  , session = require('express-session')
  , logger = require('morgan')
  , multer  = require('multer')
  , cookieParser = require('cookie-parser');
 
//require the handlers below.
var register = require('./routes/register');
var login = require('./routes/login');
var space = require('./routes/space');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(favicon());
app.use(logger('dev'));
app.use(session({ resave: true,    saveUninitialized: true,    secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(errorhandler());
}

app.get('/', routes.index);

//use handlers
app.use('/register',register);
app.use('/login',login);
app.use('/space',space);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
