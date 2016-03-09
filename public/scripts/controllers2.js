var app = angular.module('appController');
//app.run(['$cookies','$window','$rootScope','$http',function($cookies,$window,$rootScope,$http){
//	$rootScope.user = null;
//	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
//	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
//}]);

app.controller('CreateNewArticleCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
	$rootScope.title = "New articles";
	$scope.data = {
		header: {
			title: "This is a title",
			author: "son",
			category: "Health",
			image: "image/user/test.png"
		},
		content: {
			description: "This is a test",
			parts: [{
				title: "this is parts 1",
				steps: [{text: "This is step1 of part 1",image: "xxx"},{text: "this is step2 of part 1",image: "xxx"}]
			},{
				title: "this is parts 2",
				steps: [{text: "This is step1 of part 2",image: "xxx"},{text: "this is step2 of part 2",image: "xxx"}]
			}
			]
		}
	};
	$scope.postArticle = function(){
		$http({
			method: "POST",
			url: "/post-article",
			data: $scope.data
		}).then(function(response){

		},function(){});
	};
}]);
app.controller("ViewArticleCtrl",['$rootScope','$scope','$http','$stateParams',function($rootScope,$scope,$http,$stateParams){

	$scope.data = {};
	$http({
			method: "GET",
			url: "/get-article-content"+$stateParams.id
		}).then(function(response){
			$scope.data = response.data;
			$rootScope.title = $scope.data.header.title;
	},function(){});
}]);