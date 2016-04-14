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
			title: "",
			author: "",
			category: "",
			description: "",
			image: ""
		},
		content: {
			parts: [{

				title: "",
				steps: [{part_index:0 ,title: "",text: "",image: ""}]
			}
			]
		}
	};
	//var data = {header: {},content: {}};

	$scope.postArticle = function(){
		$scope.data.header.author = $rootScope.user.username;
		/*data.header.title = $scope.article_title;
		data.header.category = $scope.category;
		data.header.description = $scope.article_intro;*/
		$scope.data.header.image = $scope.data.content.parts[0].steps[0].image;
		$http({
			method: "POST",
			url: "/post-article",
			data: $scope.data
		}).then(function(response){

		},function(){});
	};
	$scope.addStep = function (index){
		$scope.data.content.parts[index].steps.push({part_index:index ,text: "",image: ""});
	};
	$scope.addPart = function (){
		$scope.data.content.parts.push({title: "",
				steps: [{part_index: $scope.data.content.parts.length ,text: "",image: ""}]
			}); 
		console.log($scope.data.content.parts);

	};
	$scope.imageUrl = null;
	$scope.upload = function (file,index1,index2) {
        Upload.upload({
            url: '/upload-image',
            data: {file: file}
        }).then(function (res) {
            $scope.data.content.parts[index1].steps[index2].image = res.data;
            console.log("link:" +$scope.data.content.parts[index1].steps[index2].image );
        }, function (res) {
            console.log('Error status: ' + res.status);
        }, function (evt) {
        });

    };
    $http({
		method: 'GET',
		url: '/get-categories-list'
	}).then(function(response){
		$scope.categories = response.data.map(function(a) {return a.name;});
	},function(){});
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
	$http({
		method: 'GET',
		url: '/get-categories-list'
	}).then(function(response){
		$scope.categories = response.data.map(function(a) {return a.name;});
	},function(){});
}]);