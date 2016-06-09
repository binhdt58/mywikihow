var app = angular.module('appController');
//app.run(['$cookies','$window','$rootScope','$http',function($cookies,$window,$rootScope,$http){
//	$rootScope.user = null;
//	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
//	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
//}]);

app.controller('CreateNewArticleCtrl',['$scope','$rootScope','$http','Upload','$location',function($scope,$rootScope,$http,Upload,$location){
	$scope.checked = 0;
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
	$scope.upimage = [];
	$scope.upimage.push([{part_index:0 ,image: {} }]);

	$scope.postArticle = function(){
		if (! $rootScope.user ) {
			confirm(" You must login before you want to post article ");
		};
		if (! $scope.data.header.title ) {
			confirm(" You must fill in the title before you want to post article ");
			return;
		};
		if (! $scope.data.header.category ) {
			confirm(" You must fill in the category before you want to post article ");
			return;
		};
		if (! $scope.data.header.description ) {
			confirm(" You must fill in the introduction before you want to post article ");
			return;
		};
		$scope.upload(0,0,postData);
	};
	var postData = function(){
				$scope.data.header.author = $rootScope.user.username;
				$scope.data.header.image = $scope.data.content.parts[0].steps[0].image;
				if( ! $scope.data.header.image){
					$scope.data.header.image = "/images/user/default.jpg";
				};
				$http({
					method: "POST",
					url: "article/post",
					data: $scope.data
				}).then(function(response){
						$location.url('/article/'+response.data);
				},function(){});
	}
	$scope.addStep = function (index){
		$scope.data.content.parts[index].steps.push({part_index:index ,text: "",image: ""});
		$scope.upimage[index].push({part_index:index ,image: ""});
	};
	$scope.addPart = function (){
		$scope.data.content.parts.push({title: "",
				steps: [{part_index: $scope.data.content.parts.length ,text: "",image: ""}]
			});
		console.log($scope.upimage);
		$scope.upimage.push([{part_index: $scope.upimage.length ,image: ""}]);
		console.log($scope.data.content.parts);

	};
	$scope.imageUrl = null;
	$scope.upload = function (partIndex,stepIndex,callBack) {
				if($scope.upimage[partIndex][stepIndex].image.$ngfName==undefined){
						if(stepIndex<$scope.upimage[partIndex].length-1) $scope.upload(partIndex,stepIndex+1,callBack);
						else if(partIndex<$scope.upimage.length-1)  $scope.upload(partIndex+1,0,callBack);
						else callBack();
				}
        else Upload.upload({
            url: 'article/upload-image',
            data: {file: $scope.upimage[partIndex][stepIndex].image}
        }).then(function (res) {
            $scope.data.content.parts[partIndex].steps[stepIndex].image = res.data;
						if(stepIndex<$scope.upimage[partIndex].length-1) $scope.upload(partIndex,stepIndex+1,callBack);
						else if(partIndex<$scope.upimage.length-1)  $scope.upload(partIndex+1,0,callBack);
						else callBack();
						//console.log($scope.upimage[partIndex].length-2,$scope.upimage.length-2 );
            //console.log("image Link: part"+partIndex+" step"+stepIndex+ "    " +$scope.data.content.parts[partIndex].steps[stepIndex].image);
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
