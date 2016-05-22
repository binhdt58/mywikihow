var express = require('express');
var router = express.Router();
var db = require("./db");
var SystemInfo = require("./system");
Users = db.Users;
ArticleHeaders = db.ArticleHeaders;
ArticleContents = db.ArticleContents;
Rates = db.Rates;
Categories = db.Categories;
router.get('/category/p*',function(req,res){
  //console.log(req.query);
    Categories.findOne({name: req.query.category},function(err,c){
      if(err||!c) {
        //console.log(c);
        res.send({articles: [],totalPage: 0});
        return;
      }
      //console.log("category: "+ c);
      var numArticles  = c.numberArticles;
      var page = req.query.page;
      if(page<=0) {
        res.status(404).end();
        return;
      }
      var skip = SystemInfo.pageSize*(page-1);
      var limit = numArticles-skip;
      if(limit>SystemInfo.pageSize)  limit = SystemInfo.pageSize;
      ArticleHeaders.find({category: req.query.category})
        .skip(skip)
        .limit(limit)
      //  .populate('stuff')
        .exec(function (err, articles) {
            if(err){
              console.log(err);
              return;
            }
            //console.log(articles);
            res.send({articles: articles,totalPage: SystemInfo.getTotalArticlePage()});
        });

      })
});
router.get('/categories',function(req,res){
  Categories.find({}).sort({name: 1}).exec(function(err,categories){
    if(err) return;
    res.send(categories);
  });
});
module.exports = router;
