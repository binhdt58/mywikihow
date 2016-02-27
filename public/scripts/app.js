'use strict';
var app = angular.module('WikiHow', ['ui.router','appController']);
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
      views: {
        view1: {templateUrl: 'htmls/profile.html', controller: 'ProfileCtrl'},
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
    .state('home',{
      url: '/home',
      views: {
        view1: {templateUrl: 'htmls/home.html',      controller: 'HomepageCtrl'},    
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
    .state('viewArticle',{
      url: '/article?id&title',
      views: {
        view1: {templateUrl: 'htmls/view-article.html', controller: 'ViewArticleCtrl'},
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
    .state('search',{
      url: '/search?key',
      views: {
        view1: {templateUrl: 'htmls/search.html',      controller: 'SearchCtrl'},
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
    .state('newArticle',{
      url: '/new-article',
      views: {
        view1: {templateUrl: 'htmls/new-article.html',      controller: 'CreateNewArticleCtrl'},
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
    .state('signup',{
      url: '/signup',
      views: {
        view1: {templateUrl: 'htmls/sign-up.html',      controller: 'SignUpCtrl'},
        view2: {templateUrl: 'htmls/view2.html', controller: 'View2Ctrl'}
      }
    })
     $locationProvider.html5Mode(true);
});