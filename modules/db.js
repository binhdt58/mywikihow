var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
//mongoose.connect('mongodb://127.0.0.1:27017/wikihow?auto_reconnect');
mongoose.connect('mongodb://chuyendecongnghe:1111@ds064188.mlab.com:64188/wikihow?auto_reconnect');
var elasticsearch = require('elasticsearch');
//model User
var Schema = mongoose.Schema;
var User = new Schema({
	username: String,
	password: String,
  email: String,
  role: String
}, { collection: 'users' });
var Users = mongoose.model('user',User);
var Category = new Schema({
  name: String,
  id: Number,
  numberArticles: Number
},{collection: 'categories'});
var Categories = mongoose.model('category',Category);
var ArticleHeader = new Schema({
  id: Number,
  title: {type: String, es_indexed: true},
  date: Date,
  author: String,
  description: {type: String,es_indexed: true},
  category: String,
  image: String,
  views: Number,
  content: Schema.Types.ObjectId,
	rate: Schema.Types.ObjectId
}, { collection: 'articles'});
var Rate = new Schema({
		totalRate: Number,
		sumRate: Number,
		rate: {type: Schema.Types.Mixed,default: []}
},{collection: 'rate'});
var Rates = mongoose.model('rate', Rate);
//var esClient = new elasticsearch.Client({host: 'http://127.0.0.1:9200'});
var esClient = new elasticsearch.Client({
	host: 'https://zliGiGMUx0GgJIeRYgmkQObtHqHcbU0K:@ngocson95.east-us.azr.facetflow.io',
  apiVersion: '1.0'
});
ArticleHeader.plugin(mongoosastic, {
    esClient: esClient
});
var ArticleHeaders =mongoose.model('article',ArticleHeader);
var ArticleContent = new Schema({
  parts: [{
    title: String,
    video: String,
    steps: [{
      title:  String,
      text: String,
      image: String
    }]
  }]
},{ collection: 'articleContent'});
var ArticleContents = mongoose.model('articleContent',ArticleContent);
module.exports = {Users: Users, ArticleHeaders: ArticleHeaders,ArticleContents: ArticleContents,Categories: Categories,Rates: Rates};
