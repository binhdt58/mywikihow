'use strict';
var app = angular.module('Admin', ['ui.router','adminController']);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
 // $urlRouterProvider.otherwise('/admin/login');
  $stateProvider
    .state('Login',{
      url: '/admin/login',
      templateUrl: 'htmls/admin/admin-login.html',      
      controller: 'LoginCtrl'
    })
    .state('Home',{
      url: '/admin/home',
      templateUrl: 'htmls/admin/admin-home.html', 
      controller: 'HomeCtrl'
    })
    .state('User',{
      url: '/admin/users?page',
      templateUrl: 'htmls/admin/admin-user.html',
      controller: 'UsersCtrl'
    })
    .state('UserProfile',{
      url: '/admin/usersDetail',
      templateUrl: 'htmls/admin/user-profile.html',      
      controller: 'UserProfileCtrl'
    })
    .state('Articles',{
      url: '/admin/articles?page',
      templateUrl: 'htmls/admin/admin-articles.html',      
      controller: 'ArticlesCtrl'
    })
    .state('Categories',{
      url: '/admin/categories',
      templateUrl: 'htmls/admin/admin-categories.html',      
      controller: 'CategoriesCtrl'
    })
    .state('AdminProfile',{
      url: '/admin/profile',
      templateUrl: 'htmls/admin/admin-profile.html',      
      controller: 'ProfileCtrl'
    });
     $locationProvider.html5Mode(true);
});