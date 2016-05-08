var db = require("./db");
Users = db.Users;
ArticleHeaders = db.ArticleHeaders;
var SystemInfo = {
    pageSize: 10,
    numberOfUsers: 0,
    numberOfArticles: 0,
    countUsers: function(){
      Users.count({}).exec(function(err,c){
        SystemInfo.numberOfUsers = c;
        //console.log(SystemInfo.numberOfUsers);
      });
    },
    countArticles: function(){
      ArticleHeaders.count({},function(err,c){
          SystemInfo.numberOfArticles = c;
          //console.log(SystemInfo.numberOfArticles);
      });
    },
    getTotalUserPage: function(){
      return Math.ceil(SystemInfo.numberOfUsers/SystemInfo.pageSize);
    },
    getTotalArticlePage: function(){
      return Math.ceil(SystemInfo.numberOfArticles/SystemInfo.pageSize);
    }


};
module.exports = SystemInfo;
