'use strict';
var app = angular.module('WikiHow', ['ui.router','appController']);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('profile',{
      url: '/profile',
      templateUrl: 'htmls/profile.html', 
      controller: 'ProfileCtrl'
    })
    .state('home',{
      url: '/home',
      templateUrl: 'htmls/home.html',      
      controller: 'HomepageCtrl'
    })
    .state('viewArticle',{
      url: '/article/:id',
      templateUrl: 'htmls/view-article.html', 
      controller: 'ViewArticleCtrl'
    })
    .state('category',{
      url: '/category/:key',
      templateUrl: 'htmls/category.html',
      controller: 'CategoryCtrl'
    })
    .state('search',{
      url: '/search?key',
      templateUrl: 'htmls/search.html',      
      controller: 'SearchCtrl'
    })
    .state('newArticle',{
      url: '/new-article',
      templateUrl: 'htmls/new-article.html',      
      controller: 'CreateNewArticleCtrl'
    })
    .state('signup',{
      url: '/signup',
      templateUrl: 'htmls/sign-up.html',      
      controller: 'SignUpCtrl'
    });
     $locationProvider.html5Mode(true);
});