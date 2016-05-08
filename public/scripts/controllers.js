var app = angular.module("appController",['ngCookies','ui.router','ngFileUpload']);
app.run(['$cookies','$window','$rootScope','$http',function($cookies,$window,$rootScope,$http){
	$rootScope.user = null;
	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
	$rootScope.range = function(begin,end){
		var a = [];
		for(var i = begin;i<=end;i++){
			a.push(i);
		}
		return a;
	}
}]);

app.controller("navbarCtrl",['$scope','$location','$http','$rootScope','$cookies','$window',function($scope,$location,$http,$rootScope,$cookies,$window){
	$scope.search = function(key){
		if(key.length==0) $location.url('/home');
		else $location.url('/search?key='+key);
	}
	$scope.login = function(){
		var user = {};
		user.username = $scope.username;
		user.password = $scope.password;
		$http({
			method: 'POST',
			url: '/login',
			headers: {
  				'Content-Type': 'application/json'
 			},
			data: user
			}).then(function(response){
				var data = angular.fromJson(response.data);
				if(data.user){
					$rootScope.user = data.user;
					$cookies.putObject('user',$rootScope.user);
					if($scope.remenberMe){
						$cookies.putObject('user',$rootScope.user);

					}else{
						$window.sessionStorage.username = $rootScope.user.username;
					}
				}else{
					console.log(data.message);
					$scope.error = data.message[0];
				}
			},function(error){

		});
	}

}]);
app.controller("ProfileCtrl",['$scope','$rootScope','$cookieStore','$window','$location','$http',function($scope,$rootScope,$cookieStore,$window,$location,$http){
	$rootScope.title = $rootScope.user.username + " Profile";
	$scope.error = null;
	$scope.success = null;
	$scope.articles = [];
	$http({
		method: 'GET',
		url: '/getuserarticles/'+$rootScope.user.username,
	}).then(function(response){
		var data = angular.fromJson(response.data);
		console.log(data);
		if(data.articles){
			$scope.articles = data.articles;
		}
		else {
			$scope.articles = [data.message];
		}
	},function(){

	});
	$scope.logout = function(){
		console.log("logged out");
		delete $rootScope.user;
		delete $window.sessionStorage.token ;
		$cookieStore.remove('user');
		$location.url('/home');
	}
	$scope.changePass = function(){
		if($scope.password!=$scope.passwordConfirm) {
			console.log("not match");
			$scope.error = "Password not match";
			$scope.success = null;
			return;
		}
		if($scope.password.length<8){
			console.log("length problem")
			$scope.error = "Password must be at least 8 characters ";
			$scope.success = null;
			return;
		}
		var xdata = {};
		xdata._id= $rootScope.user._id;
		xdata.oldPass =  $scope.oldPass;
		xdata.newPass =  $scope.password;
		$http({
			method: 'POST',
			url: '/change-pass/',
			data: xdata
		}).then(function(response){
			var data = angular.fromJson(response.data);
			console.log(data);
			if(data.message=='success'){
				$scope.success = "Congratulation! Your password has been updated";
				$scope.error = null;
				console.log($scope.success);
				$scope.oldPass = "";
				$scope.password = "";
				$scope.passwordConfirm = "";
			}
			else {
				$scope.error = data.message;
				$scope.success = null;
			}
			},function(){
		});
	}
}]);

app.controller("HomepageCtrl",['$rootScope','$scope','$http',function($rootScope,$scope,$http){
	$rootScope.title = "Home";
	$http({
		method: 'GET',
		url: 'article/list',

	}).then(function(response){
		var data = angular.fromJson(response.data);
		$scope.articles = data;
	},function(){

	});
	$http({
		method: 'GET',
		url: '/get/categories'
	}).then(function(response){
		$scope.categories = response.data.map(function(a) {return a.name;});
	},function(){});
}]);
app.controller('SignUpCtrl',['$http','$scope','$rootScope','$location',function($http,$scope,$rootScope,$location){
	$scope.error = null;
	$scope.signup = function(){

		if($scope.password!=$scope.passwordConfirm) {
			$scope.error = "Password not match";
			return;
		}
		if($scope.password.length<8){
			$scope.error = "Password must be at least 8 characters ";
			return;
		}
		var user = {};
		user.username = $scope.username;
		user.password = $scope.password;
		user.email = $scope.email;
		$http({
			method: 'POST',
			url: '/signup',
			data: user
			}).then(function(response){
				var data = angular.fromJson(response.data);
				if(data.user){
					console.log(data.user);
					$rootScope.user = data.user;
					$location.url('/home');
				}else{
					console.log(data.message);
					$scope.error = data.message[0];
				}
			},function(error){
		});
	}
}]);
app.controller("SearchCtrl",['$rootScope','$scope','$http','$stateParams',function($rootScope,$scope,$http,$stateParams){
	$rootScope.title = "Search";
	$scope.results = [];
	$http({
		method: 'GET',
		url: '/article-search'+$stateParams.key
	}).then(function(response){
		$scope.results = angular.fromJson(response.data);
	},function(){});
}]);
app.controller('CategoryCtrl',['$rootScope','$scope','$http','$stateParams',function($rootScope,$scope,$http,$stateParams){
	$rootScope.title = "Search result";
	$scope.category = $stateParams.category;
	$scope.totalPage = $stateParams.page;
	$scope.pre = $stateParams.page;
	$scope.next = $stateParams.page;
	var prePage = function(){
		console.log($stateParams.page+" "+$scope.totalPage)
		if($stateParams.page>1){
			return $stateParams.page-1;
		}else return $stateParams.page;
	}
	var nextPage = function(){
		if($stateParams.page<$scope.totalPage){
			return parseInt($stateParams.page)+1;
		}else return $stateParams.page;
	}
	$http({
			method: 'GET',
			url: '/get/category/p?page='+$stateParams.page+"&category="+$stateParams.category,
	}).then(function(response){
				var data = angular.fromJson(response.data);
				$scope.articles = data.articles;
				$scope.totalPage = data.totalPage;
				$scope.pre = prePage();
				$scope.next = nextPage();
			},function(error){
		});
}]);
