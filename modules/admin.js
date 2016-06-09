var express = require('express');
var router = express.Router();
var SystemInfo = require("./system");
var fs = require('fs');
var multipart = require('connect-multiparty');
var categoryUpload = multipart({
  uploadDir: 'public/images/category/'
})
var db = require("./db");
Users = db.Users;
ArticleHeaders = db.ArticleHeaders;
ArticleContents = db.ArticleContents;
Rates = db.Rates;
Categories = db.Categories;
router.get('/articles/get*',function(req,res){
    var page = req.query.page;
    var skip = SystemInfo.pageSize*(page-1);
    var limit = SystemInfo.numberOfArticles-skip;
    if(limit>10)  limit = 10;
    //console.log(skip);
    //console.log(limit);
    ArticleHeaders.find({})
      .skip(skip)
      .limit(limit)
    //  .populate('stuff')
      .exec(function (err, articles) {
          if(err){
            console.log(err);
            return;
          }
          res.send({articles: articles,totalPage: SystemInfo.getTotalArticlePage()});
      });
});
router.post('/articles/remove*',function(req,res){
    ArticleHeaders.findOne({_id: req.query.id},function(err,header){
      if(err) console.log(err);
      ArticleContents.findByIdAndRemove(header.content,function(err){});
      Rates.findByIdAndRemove(header.rate,function(err){});
      ArticleHeaders.findByIdAndRemove(header._id,function(err){});
      SystemInfo.numberOfArticles--;
      Categories.findOne({name: header.category},function(err,c){
          if(err) return;
          if(c){
            c.numberArticles--;
            c.save(function(err){});
          }
      });
    });
    res.redirect('/ad/articles/get?page='+req.query.page);
});
router.get('/users/get*',function(req,res){
    var page = req.query.page;
    var skip = SystemInfo.pageSize*(page-1);
    var limit = SystemInfo.numberOfUsers-skip;
    if(limit>10)  limit = 10;
    Users.find()
      .skip(skip)
      .limit(limit)
      .populate('stuff')
      .exec(function (err, users) {
          if(err){
            console.log(err);
            return;
          }
          //console.log(SystemInfo.numberOfUsers);
          res.send({users: users,totalPage: SystemInfo.getTotalUserPage()});
      });
});
router.post('/users/search*',function(req,res){
  Users.find({username: new RegExp(req.query.username,"i")},function(err,users){
    if(err) {
      console.log(err);
      return;
    }
    res.send(users);
  })
});
router.post('/users/remove*',function(req,res){
    Users.find({username: req.query.username}).remove().exec(function(err){
      if(err) console.log(err);
      SystemInfo.numberOfUsers--;
    });

    res.redirect('/ad/users/get?page='+req.query.page);
});
router.post('/users/role*',function(req,res){
  Users.findOneAndUpdate({username: req.query.username},{role: req.query.role},function(err){
        //console.log(Users.findOne({name: req.query.username}));
        if(!err){
          res.send("OK");
        }
        else{
          res.send("FAIL");
        }
  });
})
router.post('/category/remove/:category',function(req,res){
    Categories.findOne({name: req.params.category}).remove().exec();
    fs.unlink('public/images/category/'+req.params.category+".png",function(err){
      if(err) console.log(err);
    });
    res.redirect('/get/categories');
});
router.post('/category/new/:category',function(req,res){
    newCategory = new Categories();
    newCategory.name = req.params.category;
    newCategory.numberArticles =0;
    newCategory.save(function(err){
       res.redirect('/get/categories');
    });
})
router.post('/category/rename*',function(req,res){
    ArticleHeaders.update({category: req.query.oldName},{category: req.query.newName},{multi: true}, function(err){});
    Categories.findOneAndUpdate({name: req.query.oldName},{name: req.query.newName},function(err){
      fs.rename('public/images/category/'+req.query.oldName+".png",'public/images/category/'+req.query.newName+".png",function(err){
         if(err) console.log(err);
          res.send("OK");
      });
    });
})
router.post('/category/upimage/:category', categoryUpload, function(req, res) {
  link = 'public/images/category/'+req.params.category+".png";
  if(!req.files){
    res.send("ok");
  }
  path = req.files.file.path;
  fs.unlink(link,function(err){
    if(err) console.log(err);

  });
 fs.rename(req.files.file.path,link,function(err){
         if(err) console.log(err);
         });
  delete req.files;
  res.send("OK");

  //if(req.files.file) res.send(req.files.file.path.slice(6));
});
module.exports = router;
