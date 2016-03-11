var app = angular.module('appController');
//app.run(['$cookies','$window','$rootScope','$http',function($cookies,$window,$rootScope,$http){
//	$rootScope.user = null;
//	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
//	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
//}]);

app.controller('CreateNewArticleCtrl',['$scope','$rootScope','$http','Upload',function($scope,$rootScope,$http,Upload){
	$rootScope.title = "New articles";
	$scope.data = {
		header: {
			title: "This is a title",
			author: "son",
			category: "Health",
			description: "This is a test",
			image: "image/user/test.png"
		},
		content: {
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
	$scope.imageUrl = null;
	$scope.upload = function (file) {
        Upload.upload({
            url: '/upload-image',
            data: {file: file}
        }).then(function (res) {
            $scope.imageUrl = res.data;
            console.log($scope.imageUrl);
        }, function (res) {
            console.log('Error status: ' + res.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
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