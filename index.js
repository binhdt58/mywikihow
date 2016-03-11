var express = require('express');
var app = express();
var router = express.Router();
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');
var bCrypt = require("bcrypt-nodejs");
var elasticsearch = require('elasticsearch');
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
var mongoosastic = require('mongoosastic');
mongoose.connect('mongodb://127.0.0.1:27017/wikihow?auto_reconnect');
//model User
var Schema = mongoose.Schema;
var User = new Schema({
	username: String,
	password: String,
  email: String
}, { collection: 'users' });
var Users = mongoose.model('user',User);
var Category = new Schema({
  name: String,
  id: Number
},{collection: 'categories'});
var Categories = mongoose.model('category',Category);
var ArticleHeader = new Schema({
  id: Number,
  title: {type: String, es_indexed: true},
  author: String,
  description: {type: String,es_indexed: true},
  category: String,
  content: Schema.Types.ObjectId
}, { collection: 'articles'});

var esClient = new elasticsearch.Client({host: 'http://127.0.0.1:9200'});
ArticleHeader.plugin(mongoosastic, {
    esClient: esClient
});
var ArticleHeaders =mongoose.model('article',ArticleHeader);
var ArticleContent = new Schema({
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
var changePass = function(_id,oldPass,newPass,done){
    Users.findOne({'_id':_id},function(err,user){
      if(err){
        console.log(err);
        return done(err,null);
      }
      if(user){
        if(isValidPassword(user,oldPass)){
          user.update({'password': createHash(newPass)}).exec();
          return done(null,true);
        }
        else{
          console.log("pass not match");
          return done(null,false,{message: "Wrong password"});
        }
      }else{
        console.log("user empty");
        return done(null,false,{message: "Server cant find your account, please log out then log in"});
      }
    })
}
var findArticleById = function(myid,done){
  var article = {};
  ArticleHeaders.findOne({'_id':myid},function(err,header){
    if(err){
      console.log("error when find article with id "+myid);
      return done(err,null);
    }
    if(!header){
      return done(err,null,{message: "Not found ariticle"});
    }
    article.header = header;
    ArticleContents.findOne({'_id': article.header.content},function(err,content){
      if(err){
        console.log("error when find content with id "+id);
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
  });
  
};
var findArticleByUsername = function(username, done){
  var articles;
  ArticleHeaders.find({'username': username},function(err,articles){
    if(err){
      console.log(" Error when find article by id");
      return done(err,null);
    }
    if(articles) {
      return done(null, articles);
    }
    else {
      return done(null, null , {message:"You done have any article"});
    }
  })
};
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir: 'public/images/user/'
});
app.post('/upload-image', multipartMiddleware, function(req, res) {
  if(req.files.file) res.send(req.files.file.path.slice(6));
  delete req.files;
  // don't forget to delete all req.files when done 
});
app.get('/get-categories-list',function(req,res){
  Categories.find({}).sort({name: 1}).exec(function(err,categories){
    if(err) return;
    res.send(categories);
  });
});
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
app.get('/article/:id',function(req,res){
  res.render('pages/index');
});
app.get('/new-article',function(req,res){
  res.render('pages/index');
});
app.get('/category/:key',function(req,res){
  res.render('pages/index');
});
app.get('/get-article-content:id',function(req,res){
    findArticleById(req.params.id,function(err,article,info){
      if(err){
        console.log(err);
        res.send("Error");
        return;
      }
      if(!article){
        console.log("not found");
        res.send({message:info});
      }else {
        res.send(article);
      }

    });
});
app.get('/getuserarticles/:username',function(req,res){
  findArticleByUsername(req.params.username,function(err,article,info){
    if(err){
        console.log(err);
        res.send("Error");
        return;
      }
      if(!article){
        console.log("not found");
        res.send({message:info});
      }else {
        res.send({articles: article});
      }
  });
});
app.get('/articles-list',function(req,res){
  ArticleHeaders.find({},function(err,articles){
    if(err){
      res.send("Error");
      return;
    }
    if(articles){
      res.send(articles);
    }
  })
});
app.get('/article-search:key',function(req,res){
  ArticleHeaders.search({query_string: {query: req.params.key }}, {hydrate:true},function(err,results){
    if(err){
      console.log(err);
      return;
    }
    res.send(results.hits.hits);
  });
});
app.post('/change-pass/',function(req,res){
  changePass(req.body._id,req.body.oldPass,req.body.newPass,function(err,isChanged,info){
    if(err){
      console.log(err);
      res.send("Error");
      return;
    }
    if(isChanged){
      res.send({message: "success"});
    }else{
      res.send({message: info.message});
    }
  });
});
app.post('/post-article', function(req,res){
  var header = req.body.header;
  var content = req.body.content;
  var newContent = new ArticleContents();
  newContent.description = content.description;
  newContent.parts = content.parts;
  var contentId = Schema.Types.ObjectId;
  newContent.save(function(err,contentReturn){
    if(err) {
      res.send(err);
      return;
    };
    contentId = contentReturn._id;
    var newHeader = new ArticleHeaders();
    newHeader.title = header.title;
    newHeader.author = header.author;
    newHeader.image = header.image;
    newHeader.category = header.category;
    newHeader.content = contentId;
    newHeader.description = header.description;
    newHeader.save(function(err,headerReturn){
      if(err) {
        res.send(err);
        return;
    }
    res.send("Complete");
  });
  });
  
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


