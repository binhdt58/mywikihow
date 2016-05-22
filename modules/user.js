var express = require('express');
var router = express.Router();
var bCrypt = require("bcrypt-nodejs");
var SystemInfo = require("./system");
module.exports = function(app){
  var passport = require('passport');
  app.use(passport.initialize());
  app.use(passport.session());
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
            //console.log('User Not Found with username '+username);
            return done(null, false,
                  req.flash('message', 'User Not found.'));
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user,password)){
            //console.log('Invalid Password');
            return done(null, false,
                req.flash('message', 'Invalid Password'));
          }
          // User and password both match, return user from
          // done method which will be treated like success
          //console.log("success login");
          return done(null, user);
        }
      );
  }));
  var createHash = function(password){
   return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  }
  passport.use('signup', new LocalStrategy({ passReqToCallback : true }, function(req, username, password, done) {
      var findOrCreateUser = function(){
        // find a user in Mongo with provided username
        Users.findOne({'username':username},function(err, user) {
          // In case of any error return
          if (err){
            //console.log('Error in SignUp: '+err);
            return done(err);
          }
          // already exists
          if (user) {
            ////console.log('User already exists');
            return done(null, false,
               req.flash('message','User Already Exists'));
          } else {
            // if there is no user with that email
            // create the user
            var newUser = new Users();
            // set the user's local credentials
            newUser.username = username;
            newUser.password = createHash(password);
            newUser.role = "user";
            newUser.email = req.param('email');

            // save the user
            newUser.save(function(err) {
              if (err){
                //console.log('Error in Saving user: '+err);
                //throw err;
              }
              SystemInfo.numberOfUsers++;
            // console .log('user registration succesful');
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
          //console.log(err);
          return done(err,null);
        }
        if(user){
          if(isValidPassword(user,oldPass)){
            user.update({'password': createHash(newPass)}).exec();
            return done(null,true);
          }
          else{
            ////console.log("pass not match");
            return done(null,false,{message: "Wrong password"});
          }
        }else{
          ////console.log("user empty");
          return done(null,false,{message: "Server cant find your account, please log out then log in"});
        }
      })
  }
  router.post('/change-pass/',function(req,res){
    changePass(req.body._id,req.body.oldPass,req.body.newPass,function(err,isChanged,info){
      if(err){
        //console.log(err);
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
  router.post('/login', passport.authenticate('login', {
      successRedirect: '/user/loginsuccess',
      failureRedirect: '/user/faillogin',
      failureFlash : true
    }));
  router.post('/signup', passport.authenticate('signup', {
      successRedirect: '/user/signinsuccess',
      failureRedirect: '/user/failsignup',
      failureFlash : true
    }));
   router.get('/loginsuccess',function(req,res){
      res.send({user: req.user});
   })
   router.get('/signinsuccess',function(req,res){
      res.send({user: req.user});
   })
  router.get('/faillogin',function(req,res){
    ////console.log("fail login");
    res.send({message: req.flash('message')});
  });
  router.get('/failsignup',function(req,res){
    ////console.log("fail sign up");
    res.send({message: req.flash('message')});
  });
  return router;
}
