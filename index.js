var SystemInfo = require('./modules/system');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');
var bCrypt = require("bcrypt-nodejs");
var fs = require('fs');
app.use(cookieParser());
app.use(expressSession({
		secret: "SECRET",
		resave: true,
		saveUninitialized: true,
		cookie: { httpOnly: false }
}));
app.use(flash());
//setting
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//body parser to parse request
var bodyParser = require( 'body-parser' );
app.use( bodyParser.urlencoded({ extended: false }) );
app.use (bodyParser.json());
var db = require("./modules/db");
Users = db.Users;
ArticleHeaders = db.ArticleHeaders;
ArticleContents = db.ArticleContents;
Rates = db.Rates;
Categories = db.Categories;
SystemInfo.countUsers();
SystemInfo.countArticles();

app.use('/ad',require('./modules/admin'));
app.use('/article', require('./modules/article'));
app.use('/user', require('./modules/user')(app));
app.use('/get', require('./modules/index'));

adminRoute = express.Router();
adminRoute.get('/*',function(req,res){
  res.render('pages/admin');
});
app.use('/admin', adminRoute);
defaultRoute = express.Router();
defaultRoute.get('/',function(req,res){
	res.render('pages/index');
});
app.use('/*',defaultRoute);



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
