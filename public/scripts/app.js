'use strict';
var app = angular.module('WikiHow', ['ui.router','appController','appController2']);
app.directive('whenEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
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
      url: '/article?id',
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
    })
     $locationProvider.html5Mode(true);
});