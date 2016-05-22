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
		if (! $rootScope.user ) {
			confirm(" You must login before you want to post article ");
		};
		if (! $scope.data.header.title || ! $scope.data.header.category || ! $scope.data.header.description ) {
			confirm(" You must fill in the title, category, introduc before you want to post article ");
			return;
		};
		$scope.data.header.author = $rootScope.user.username;

		/*data.header.title = $scope.article_title;
		data.header.category = $scope.category;
		data.header.description = $scope.article_intro;*/
		$scope.data.header.image = $scope.data.content.parts[0].steps[0].image;
		if( ! $scope.data.header.image){
			$scope.data.header.image = "/images/user/default.jpg";
		};
		$http({
			method: "POST",
			url: "article/post",
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
            url: 'article/upload-image',
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
		url: '/get/categories'
	}).then(function(response){
		$scope.categories = response.data.map(function(a) {return a.name;});
	},function(){});
}]);
app.controller("ViewArticleCtrl",['$rootScope','$scope','$http','$stateParams',function($rootScope,$scope,$http,$stateParams){
	$scope.addrate = 3;
	$scope.color = {
        name: 'blue'
      };
	$scope.data = {};
	$http({
			method: "GET",
			url: "/article/get-content"+$stateParams.id
		}).then(function(response){
			$scope.data = response.data;
			$rootScope.title = $scope.data.header.title;
	},function(){
		
	});
	
	$http({
		method: 'GET',
		url: '/get/categories'
	}).then(function(response){
		$scope.categories = response.data.map(function(a) {return a.name;});
	},function(){});
	$scope.rateArticle = function(){
		if (! $rootScope.user ) {
			confirm(" You must login before you want to rate article ");
		};
		
		$http({
			method: "GET",
			url: "article/rating/rate?user_id=" +$rootScope.user._id+"&rate="+$scope.color.name+"&id="+$scope.data.rate._id,
		}).then(function(response){
			console.log(Error);
		},function(){});
	};
}]);