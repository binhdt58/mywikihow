var express = require('express');
var router = express.Router();
var SystemInfo = require("./system");
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir: 'public/images/user/'
});
var db = require("./db");
var Schema = require("mongoose").Schema;
Users = db.Users;
ArticleHeaders = db.ArticleHeaders;
ArticleContents = db.ArticleContents;
Rates = db.Rates;
Categories = db.Categories;

router.post('/upload-image', multipartMiddleware, function(req, res) {
  if(req.files.file) res.send(req.files.file.path.slice(6));
  delete req.files;
});
router.get('/list',function(req,res){
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
router.get('/search:key',function(req,res){
  ArticleHeaders.search({query_string: {query: req.params.key }}, {hydrate:true},function(err,results){
    if(err){
      console.log(err);
      return;
    }
    res.send(results.hits.hits);
  });
});
router.post('/post', function(req,res){
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
    console.log(contentReturn._id);
    var newHeader = new ArticleHeaders();
    newHeader.title = header.title;
    newHeader.author = header.author;
    newHeader.image = header.image;
    newHeader.category = header.category;
    newHeader.date = new Date();
    newHeader.content = contentReturn._id;
		newHeader.views = 0;
    newHeader.description = header.description;
		var rate = new Rates();

		console.log(rate.rate);
		rate.sumRate = 0;
		rate.totalRate = 0;
		var tempArray = [[],[],[],[],[]];
		console.log(tempArray);
		rate.rate = tempArray;
		rate.save(function(err,r){
			if(err) console.log(err);
			else console.log("saved rate",r);
			newHeader.rate = r._id;
			newHeader.save(function(err,headerReturn){
	      if(err) {
	        res.send(err);
	        return;
	    	}
				res.send(headerReturn._id);
			});
		});
    SystemInfo.numberOfArticles++;
    Categories.findOne({name: header.category},function(err,c){
      if(err) return;
      if(c){
        //console.log(c);
        numberArticles = c.numberArticles;
        numberArticles++;
        c.update({numberArticles: numberArticles},function(err){
          if(err) console.log(err);
        });
      }
    });
  });

});
router.get('/rating/get:id',function(req,res){
		Rates.findById(req.params.id,function(err,rate){
				if(err) res.send("Fail");
				if(rate) res.send(rate);
		});
});
router.get('/rating/rate*',function(req,res){
		req.query.rate = parseInt(req.query.rate);
		Rates.findById(req.query.id,function(err,rating){
				if(err) res.send("Error");
				if(rating){
						//console.log(rating);
						for(index=0;index<rating.rate.length;index++){
								_index = rating.rate[index].findIndex(function(id){return req.query.user_id==id;});
								if(_index>=0){
										if(index==req.query.rate) {
											res.send(rating);
											return;
										}
										console.log("user already rated");
										rating.rate[index].splice(_index,1);
										rating.sumRate -= index+1;
										rating.sumRate += req.query.rate+1;
										rating.rate[req.query.rate].push(req.query.user_id);
										rating.markModified('rate');
										rating.save(function(err,newRate){
											console.log(err);
											res.send(newRate);
										});
										return;
								}
						};
						rating.sumRate+=req.query.rate+1;
						rating.totalRate+=1;
						rating.rate[req.query.rate]=rating.rate[req.query.rate].concat([req.query.user_id]);
						rating.markModified('rate');
						rating.save(function(err,newRate){
								console.log(err);
								res.send(newRate);
						});
						return;
				}
				else res.send("failed when find rate in DB");
		});
});
var findArticleById = function(myid,done){
  var article = {};
  ArticleHeaders.findById(myid,function(err,header){
    if(err){
      console.log("error when find article with id "+myid);
      return done(err,null);
    }
    if(!header){
      return done(err,null,{message: "Not found ariticle"});
    }
		header.views++;
  	header.save();
    article.header = header;
    ArticleContents.findById(article.header.content,function(err,content){
      if(err){
        console.log("error when find content with id "+id);
        return done(err,null);
      }
      if(content) {
        article.content = content;
				Rates.findById(article.header.rate,function(err, rate){
						if(err){
				        console.log("error when find rate with id "+id);
						}
						if(rate){
							article.rate = rate;
						}
		        return done(null,article);
				});
      }
      else{
        return done(null,null,{message: "Missing content"});
      }
    });
  });
};
router.get('/get-content:id',function(req,res){
    findArticleById(req.params.id,function(err,article,info){
      if(err){
        console.log(err);
        res.send("Error");
        return;
      }
      if(!article){
       // console.log("not found");
        res.send({message:info});
      }else {
        res.send(article);
      }
    });
});
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
router.get('/getuserarticles/:username',function(req,res){
  findArticleByUsername(req.params.username,function(err,article,info){
    if(err){
        console.log(err);
        res.send("Error");
        return;
      }
      if(!article){
       // console.log("not found");
        res.send({message:info});
      }else {
        res.send({articles: article});
      }
  });
});
module.exports = router;
