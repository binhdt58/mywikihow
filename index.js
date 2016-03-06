var express = require('express');
var app = express();
var router = express.Router();
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');
var bCrypt = require("bcrypt-nodejs");
app.use(cookieParser());
//setting
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//body parser to parse request
var bodyParser = require( 'body-parser' );
app.use( bodyParser.urlencoded({ extended: false }) );
app.use (bodyParser.json());
//database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wikihow?auto_reconnect');
//model User
var Schema = mongoose.Schema;
var User = new Schema({
	username: String,
	password: String,
  email: String
}, { collection: 'users' });
var Users = mongoose.model('user',User);
var ArticleHeader = new Schema({
  id: Number,
  title: String,
  author: String,
  category: String,
  content: Schema.Types.ObjectId
}, { collection: 'articles'});
var ArticleHeaders =mongoose.model('article',ArticleHeader);
var ArticleContent = new Schema({
  id: Number,
  rate: [[String]],
  parts: [{
    title: String,
    video: String,
    steps: [{
      text: String,
      images: [String]
    }]
  }]
},{ collection: 'articleContent'});
var ArticleContents = mongoose.model('articleContent',ArticleContent);
//middleware for auth
var passport = require('passport');
app.use(expressSession({
    secret: "SECRET",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
    done(err, user);
  });
});
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}
var LocalStrategy = require('passport-local').Strategy;
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    Users.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user,password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        console.log("success login");
        return done(null, user);
      }
    );
}));
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    var findOrCreateUser = function(){
      // find a user in Mongo with provided username
      Users.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new Users();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
 
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    findOrCreateUser();
  })
);

var findArticleById = function(myid,done){
  var article = {};
  ArticleHeaders.findOne({'id':myid},function(err,header){
    if(err){
      console.log("error when find article with id "+id);
      return done(err,null);
    }
    if(header) article.header = header;
    else return done(err,null,{message: "Not found ariticle"})
  });
  ArticleContents.findOne({'id': article.header.content},function(err,content){
    if(err){
      console.log("error when find article with id "+id);
      return done(err,null);
    }
    if(content) {
      article.content = content;
      return done(null,article);
    }
    else{
      return done(null,null,{message: "Missing content"});
    }

  });
}
app.get('/home', function(req, res) {
  res.render('pages/index');
});
app.get('/',function(req,res){
  res.render('pages/index');
});
app.get('/signup',function(req,res){
  res.render('pages/index');
});
app.get('/search',function(req,res){
  res.render('pages/index');
});
app.get('/profile',function(req,res){
  res.render('pages/index');
});
app.get('/article',function(req,res){
  res.render('pages/index');
});
app.get('/new-article',function(req,res){
  res.render('pages/index');
});
app.get('/get-article-content:id',function(req,res){
    res.send(findArticleById(req.id),function(err,article,info){
      if(err){
        console.log(err);
        res.send("Error");
        return;
      }
      if(!article){
        res.send({message:info});
      }else {
        res.send({article: article});
      }

    })
});
app.get('/abc',function(req,res){

});
app.post('/new-article/new',function(req,res){

});
app.post('/login', passport.authenticate('login', {
    successRedirect: '/loginsuccess',
    failureRedirect: '/faillogin',
    failureFlash : true 
  }));
app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/signinsuccess',
    failureRedirect: '/failsignup',
    failureFlash : true 
  }));
 app.get('/loginsuccess',function(req,res){
    res.send({user: req.user});
 })
 app.get('/signinsuccess',function(req,res){
    res.send({user: req.user});
 })
app.get('/faillogin',function(req,res){
  console.log("fail login");
  res.send({message: req.flash('message')});
});
app.get('/failsignup',function(req,res){
  console.log("fail sign up");
  res.send({message: req.flash('message')});
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


