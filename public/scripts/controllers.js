var app = angular.module("appController",['ngCookies']);
app.run(['$cookies','$window','$rootScope',function($cookies,$window,$rootScope){
	$rootScope.user = null;
	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
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
			data: user
			}).then(function(response){
				var data = angular.fromJson(response.data);
				if(data.user){
					console.log(data.user);
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
app.controller("ProfileCtrl",['$scope','$rootScope','$cookieStore','$window','$location',function($scope,$rootScope,$cookieStore,$window,$location){
	$scope.logout = function(){
		console.log("logged out");
		delete $rootScope.user;
		delete $window.sessionStorage.token ;
		$cookieStore.remove('user');
		$location.url('/home');
	}
}]);
app.controller("ArticleCtrl",[function(){

}]);
app.controller("HomepageCtrl",[function(){

}]);
app.controller('SignUpCtrl',['$http','$scope','$rootScope',function($http,$scope,$rootScope){
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
				}else{
					console.log(data.message);
					$scope.error = data.message[0];
				}
			},function(error){
		});
	}
}]);
app.controller('CreateNewArticleCtrl',[function(){

}]);
app.controller('ViewArticleCtrl',[function(){

}]);
app.controller('SearchCtrl',[function(){

}]);
app.controller("View2Ctrl",[function(){

}])