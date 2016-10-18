/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , https = require('https')
    , http = require('http')
    , path = require('path')
    , fs = require('fs')
    , favicon = require('serve-favicon')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , errorhandler = require('errorhandler')
    , session = require('express-session')
    , logger = require('morgan')
    , multer = require('multer')
    , cookieParser = require('cookie-parser');

//require the handlers below.
var register = require('./routes/register');
var login = require('./routes/login');
var space = require('./routes/space');
var link = require('./routes/link');
var account = require('./routes/account');
var group = require('./routes/group');
var message = require('./routes/message');

var key = fs.readFileSync('./cert/yamixed.key');
var cert = fs.readFileSync('./cert/yamixed.crt');
var https_options = {
    key: key,
    cert: cert
};


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(favicon());
app.use(logger('dev'));
app.use(session({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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
app.use('/register', register);
app.use('/login', login);
app.use('/space', space);
app.use('/link', link);
app.use('/account', account);
app.use('/group', group);
app.use('/message', message);

https.createServer(https_options, app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
