var app = angular.module("adminController",['ngCookies','ui.router','ngFileUpload']);
app.run(['$cookies','$window','$rootScope','$http','$location',function($cookies,$window,$rootScope,$http,$location){
	$rootScope.user = null;
	if($window.sessionStorage.token) $rootScope.user = $window.sessionStorage.user;
	else if ($cookies.getObject('user')) $rootScope.user = $cookies.getObject('user');
	$rootScope.logout = function(){
		$rootScope.user = null;
		$location.url('/admin/login');
		delete $rootScope.user;
		delete $window.sessionStorage.token ;

	}
	$rootScope.range = function(begin,end){
		var a = [];
		for(var i = begin;i<=end;i++){
			a.push(i);
		}
		return a;
	}
}]);
app.controller('LoginCtrl',['$rootScope','$scope','$http','$location','$window','$cookies',function($rootScope,$scope,$http,$location,$window,$cookies){
	if($rootScope.user) $location.url('/admin/home');
	$rootScope.title = "Login to admin";
	$scope.login = function(){
		var user = {};
		user.username = $scope.username;
		user.password = $scope.password;
		$http({
			method: 'POST',
			url: '/user/login',
			headers: {
  				'Content-Type': 'application/json'
 			},
			data: user
			}).then(function(response){
				var data = angular.fromJson(response.data);
				if(data.user&&data.user.role=="admin"){
					$rootScope.user = data.user;
					$cookies.putObject('user',$rootScope.user);
					$window.sessionStorage.username = $rootScope.user.username;
					$location.url('admin/home');
				}else{
					if(!data.user) $scope.error = data.message[0];
					else $scope.error = "You do not have permisssion";
				}
			},function(error){

		});
	};
}]);

app.controller('HomeCtrl',['$rootScope','$scope','$http','$location',function($rootScope,$scope,$http,$location){
	if(!$rootScope.user) $location.url('/home');
	$rootScope.title = "Admin Home";
}]);

app.controller('UsersCtrl',['$rootScope','$scope','$http','$location','$stateParams',function($rootScope,$scope,$http,$location,$stateParams){
	if(!$rootScope.user) $location.url('/admin/login');
	$scope.totalPage = 0;
	$scope.page = $stateParams.page;
	$rootScope.title = "User page = " +$stateParams.page;
	$http({
		method: 'GET',
		url: '/ad/users/get?page='+$stateParams.page
	}).then(function(response){
		$scope.users = response.data.users;
		$scope.totalPage = response.data.totalPage;
		$scope.pre = prePage();
		$scope.next = nextPage();
	},function(){});
	$scope.remove = function(id){
		$http({
			method: 'POST',
			url: '/ad/users/remove?username='+username+"&page="+$stateParams.page
		}).then(function(response){
			$scope.totalPage = response.data.totalPage;
			if($scope.page>$scope.totalPage) $location.url('/admin/articles?page='+$scope.prePage());
			console.log($scope.page,$scope.totalPage);
			$scope.users = response.data.users;
		})
	}
	$scope.changeRole = function(role,index){
		if(!role||$scope.users[index].role==role) return;
		$http({
			method: 'POST',
			url: '/ad/users/role?username='+ $scope.users[index].username+"&role="+role,
		}).then(function(response){
			if(response.data=="OK") $scope.users[index].role = role;
		})
	}
	var prePage = function(){
		if($stateParams.page>1){
			return $stateParams.page-1;
		}else return $stateParams.page;
	}
	var nextPage = function(){
		if($stateParams.page<$scope.totalPage){
			return parseInt($stateParams.page)+1;
		}else return $stateParams.page;
	}
	$scope.search = function(name){
		if(!name) return;
		$http({
			method: "POST",
			url: "/ad/users/search?username="+name
		}).then(function(response){
			$scope.users = response.data;
		},function(){});
	}
}]);
app.controller('UserProfileCtrl',['$rootScope','$scope','$http','$location',function($rootScope,$scope,$http,$location){
	if(!$rootScope.user) $location.url('/admin/login');
	$rootScope.title = "Profile";
}]);

app.controller('ArticlesCtrl',['$rootScope','$scope','$http','$location','$stateParams','$window',function($rootScope,$scope,$http,$location,$stateParams,$window){
	if(!$rootScope.user) $location.url('/admin/login');
	$scope.totalPage = 0;
	$rootScope.title = "Articles page = " +$stateParams.page;
	$http({
		method: 'GET',
		url: '/ad/articles/get?page='+$stateParams.page
	}).then(function(response){
		$scope.articles = response.data.articles;
		$scope.totalPage = response.data.totalPage;
		$scope.pre = prePage();
		$scope.next = nextPage();

	},function(){});
	$scope.page = $stateParams.page;
	$scope.goto = function(id){
		$window.open("/article/"+id);
	}
	var prePage = function(){
		if($stateParams.page>1){
			return $stateParams.page-1;
		}else return $stateParams.page;
	}
	var nextPage = function(){
		if($stateParams.page<$scope.totalPage){
			return parseInt($stateParams.page)+1;
		}else return $stateParams.page;
	}
	$scope.remove = function(_id){
		$http({
			method: 'POST',
			url: '/ad/articles/remove?id='+_id+"&page="+$stateParams.page
		}).then(function(response){
			$scope.articles = response.data.articles;
			$scope.totalPage = response.data.totalPage;
			if($scope.page>$scope.totalPage) $location.url('/admin/articles?page='+$scope.prePage());
		})
	}
	$scope.search = function(name){
		if(!name) return;
		$http({
			method: "GET",
			url: "/article/search"+name
		}).then(function(response){
			$scope.articles = response.data;
		},function(){});
	}

}]);
app.controller('CategoriesCtrl',['$rootScope','$scope','$http','$location','$window','Upload','$state',function($rootScope,$scope,$http,$location,$window,Upload,$state){
	if(!$rootScope.user) $location.url('/admin/login');
	$rootScope.title = "Admin Home";
	$http({
		method: 'GET',
		url: '/get/categories'
	}).then(function(response){
		$scope.categories = response.data;
	},function(){});
	$scope.goto = function(c){
		$window.open("/category/p?category="+c+"&page=1");
	};
	$scope.changeName = function(newname,i){
		$http({
			method: 'POST',
			url: '/ad/category/rename?oldName='+$scope.categories[i].name+'&newName='+newname
		}).then(function(response){
			if(response.data=="OK"){
				$scope.categories[i].name = newname;
			}
		},function(){})
	};
	$scope.remove = function(name){
		$http({
		method: 'POST',
		url: '/ad/category/remove/'+name
		}).then(function(response){
			$scope.categories = response.data;
		},function(){});
	};
	$scope.createNew = function(name){
		if(!name) return;
		$http({
			method: 'POST',
			url: '/ad/category/new/'+name
		}).then(function(response){
			$scope.categories = response.data;
		},function(){})
	};
	$scope.upload = function (file,name) {
	//	file = Upload.rename(file, name+".png");
        Upload.upload({
            url: '/ad/category/upimage/'+name,
            data: {file: file, fileName: "hello.png"}
        }).then(function (res) {
        	document.location.reload(true);
        }, function (res) {
            console.log('Error status: ' + res.status);
        });

    };
}]);
app.controller('ProfileCtrl',['$rootScope','$scope','$http','$location',function($rootScope,$scope,$http,$location){
	if(!$rootScope.user) $location.url('/admin/login');
	$rootScope.title = $rootScope.user.username + " Profile";
	$scope.error = null;
	$scope.success = null;
	$scope.articles = [];
	$http({
		method: 'GET',
		url: 'article/getuserarticles/'+$rootScope.user.username,
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
app.controller('navbarCtrl',['$rootScope','$scope','$http',function($rootScope,$scope,$http){
	$rootScope.title = "My Profile";
}]);
